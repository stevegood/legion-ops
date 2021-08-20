package data

import (
	"errors"
	"log"
	"strings"
	"time"

	"github.com/gofrs/uuid"
	"github.com/jinzhu/gorm"

	"github.com/StarWarsDev/legion-ops/internal/constants"
	"github.com/StarWarsDev/legion-ops/internal/orm/models/user"

	"github.com/StarWarsDev/legion-ops/internal/gql/models"
	"github.com/StarWarsDev/legion-ops/internal/orm/models/event"

	"github.com/StarWarsDev/legion-ops/internal/orm"
)

func FindEvents(db *gorm.DB, max int, forUser *user.User, eventType *models.EventType, startsAfter, endsBefore *time.Time, onlyPublished bool) ([]event.Event, error) {
	var dbRecords []event.Event
	var count int

	var where []string
	var params []interface{}

	if onlyPublished {
		where = append(where, "published = ?")
		params = append(params, onlyPublished)
	}

	if eventType != nil {
		where = append(where, "type = ?")
		params = append(params, eventType.String())
	}

	if startsAfter != nil || endsBefore != nil {
		ids, err := eventIdsInRange(db, startsAfter, endsBefore)
		if err != nil {
			return dbRecords, err
		}

		if len(ids) > 0 {
			where = append(where, "id IN (?)")
			params = append(params, ids)
		}
	}

	err := db.
		Set("gorm:auto_preload", true).
		Select("*").
		Where(strings.Join(where, " AND "), params...).
		Limit(max).
		Find(&dbRecords).
		Count(&count).
		Error

	if err != nil {
		log.Println(err)
		return dbRecords, err
	}

	return dbRecords, nil
}

func eventIdsInRange(db *gorm.DB, startsAfter *time.Time, endsBefore *time.Time) ([]string, error) {
	var (
		err error
		ids []string
	)

	if startsAfter != nil && endsBefore == nil {
		var days []event.Day
		err = db.Select("DISTINCT event_id").Where("start_at >= ?", startsAfter).Find(&days).Error
		if err != nil {
			return nil, err
		}
		for _, day := range days {
			ids = append(ids, day.EventID.String())
		}
	}

	if endsBefore != nil && startsAfter == nil {
		var days []event.Day
		err = db.Select("DISTINCT event_id").Where("end_at <= ?", endsBefore).Find(&days).Error
		if err != nil {
			return nil, err
		}
		for _, day := range days {
			ids = append(ids, day.EventID.String())
		}
	}

	if startsAfter != nil && endsBefore != nil {
		var days []event.Day
		err = db.
			Select("DISTINCT event_id").
			Where("start_at >= ? AND end_at <= ?", startsAfter, endsBefore).
			Find(&days).
			Error
		if err != nil {
			return nil, err
		}
		for _, day := range days {
			ids = append(ids, day.EventID.String())
		}
	}

	return ids, nil
}

func GetEventWithID(eventID string, db *gorm.DB) (event.Event, error) {
	var dbEvent event.Event
	err := db.
		Set("gorm:auto_preload", true).
		Select("*").
		Where("id=?", eventID).
		First(&dbEvent).
		Error

	return dbEvent, err
}

func GetDayWithID(id string, db *gorm.DB) (event.Day, error) {
	var day event.Day
	err := db.
		Set("gorm:auto_preload", true).
		Select("*").
		Where("id=?", id).
		First(&day).
		Error
	return day, err
}

func GetRoundWithID(id string, db *gorm.DB) (event.Round, error) {
	log.Printf("Getting round with id %s", id)
	var round event.Round
	err := db.
		Set("gorm:auto_preload", true).
		Select("*").
		Where("id=?", id).
		First(&round).
		Error
	return round, err
}

func GetMatchWithID(id string, db *gorm.DB) (event.Match, error) {
	var match event.Match
	err := db.
		Set("gorm:auto_preload", true).
		Select("*").
		Where("id=?", id).
		First(&match).
		Error
	return match, err
}

func CreateEventWithInput(input *models.EventInput, organizer *user.User, orm *orm.ORM) (event.Event, error) {
	db := NewDB(orm)

	// the organizer can only be set during create
	dbEvent := event.Event{
		Organizer:   *organizer,
		Name:        input.Name,
		Description: input.Description,
		Type:        input.Type.String(),
	}

	err := db.Transaction(func(tx *gorm.DB) error {
		if input.HeadJudge != nil && *input.HeadJudge != "" {
			dbHeadJudge, err := GetUser(*input.HeadJudge, tx)
			if err != nil {
				return err
			}
			dbEvent.HeadJudge = &dbHeadJudge
		}

		for _, judgeID := range input.Judges {
			judge, err := GetUser(*judgeID, tx)
			if err != nil {
				return err
			}
			dbEvent.Judges = append(dbEvent.Judges, judge)
		}

		for _, playerID := range input.Players {
			player, err := GetPlayer(*playerID, tx)
			if err != nil {
				return err
			}
			dbEvent.Players = append(dbEvent.Players, player)
		}

		for _, day := range input.Days {
			eventDay := event.Day{
				StartAt: day.StartAt,
				EndAt:   day.EndAt,
			}

			for r, round := range day.Rounds {
				dbRound := event.Round{
					Counter: r,
				}

				for _, match := range round.Matches {
					p1, err := GetPlayer(match.Player1, tx)
					if err != nil {
						return err
					}

					p2, err := GetPlayer(match.Player2, tx)
					if err != nil {
						return err
					}
					dbMatch := event.Match{
						Player1: p1,
						Player2: p2,
					}

					if match.Player1MarginOfVictory != nil {
						dbMatch.Player1MarginOfVictory = *match.Player1MarginOfVictory
					}

					if match.Player1VictoryPoints != nil {
						dbMatch.Player1VictoryPoints = *match.Player1VictoryPoints
					}

					if match.Player2VictoryPoints != nil {
						dbMatch.Player2VictoryPoints = *match.Player2VictoryPoints
					}

					if match.Player2MarginOfVictory != nil {
						dbMatch.Player2MarginOfVictory = *match.Player2MarginOfVictory
					}

					if match.Blue != nil && *match.Blue != "" {
						blue, err := GetPlayer(*match.Blue, tx)
						if err != nil {
							return err
						}
						dbMatch.Blue = &blue
					}

					if match.Bye != nil && *match.Bye != "" {
						bye, err := GetPlayer(*match.Bye, tx)
						if err != nil {
							return err
						}
						dbMatch.Bye = &bye
					}

					if match.Winner != nil && *match.Winner != "" {
						winner, err := GetPlayer(*match.Winner, tx)
						if err != nil {
							return err
						}
						dbMatch.Winner = &winner
					}
					dbRound.Matches = append(dbRound.Matches, dbMatch)
				}
				eventDay.Rounds = append(eventDay.Rounds, dbRound)
			}
			dbEvent.Days = append(dbEvent.Days, eventDay)
		}

		// create the event
		err := tx.Create(&dbEvent).Error
		if err != nil {
			return err
		}

		// save the event
		err = tx.Save(&dbEvent).Error

		return err
	})

	return dbEvent, err
}

func UpdateEventWithInput(input *models.EventInput, orm *orm.ORM) (event.Event, error) {
	db := NewDB(orm)

	dbEvent, err := GetEventWithID(*input.ID, db)
	if err != nil {
		return dbEvent, err
	}

	// do everything inside a transaction to protect data in case of errors
	err = db.Transaction(func(tx *gorm.DB) error {
		if dbEvent.Name != input.Name {
			dbEvent.Name = input.Name
		}

		if dbEvent.Description != input.Description {
			dbEvent.Description = input.Description
		}

		if input.Published != nil && dbEvent.Published != *input.Published {
			dbEvent.Published = *input.Published
		}

		if input.HeadJudge != nil {
			if (dbEvent.HeadJudge == nil) || (dbEvent.HeadJudge != nil && dbEvent.HeadJudge.ID.String() != *input.HeadJudge) {
				headJudge, err := GetUser(*input.HeadJudge, tx)
				if err != nil {
					return err
				}
				dbEvent.HeadJudge = &headJudge
			}
		}

		err = tx.Save(&dbEvent).Error
		if err != nil {
			return err
		}

		// manage players
		var players []event.Player
		for _, pID := range input.Players {
			player, err := GetPlayer(*pID, tx)
			if err != nil {
				return err
			}
			players = append(players, player)
		}
		dbEvent.Players = players
		err = tx.Model(&dbEvent).Association("Players").Replace(players).Error
		if err != nil {
			return err
		}

		// manage judges
		var judges []user.User
		for _, jID := range input.Judges {
			judge, err := GetUser(*jID, tx)
			if err != nil {
				return err
			}
			judges = append(judges, judge)
		}
		dbEvent.Judges = judges
		err = tx.Model(&dbEvent).Association("Judges").Replace(judges).Error
		if err != nil {
			return err
		}

		// manage days
		for _, dayIn := range input.Days {
			_, err = UpdateDay(dayIn, tx)
			if err != nil {
				return err
			}
		}

		return nil
	})
	if err != nil {
		return dbEvent, err
	}

	dbEvent, err = GetEventWithID(*input.ID, db)

	return dbEvent, err
}

func DeleteEventWithID(id string, orm *orm.ORM) (bool, error) {
	db := NewDB(orm)

	err := db.Transaction(func(tx *gorm.DB) error {
		evt, err := GetEventWithID(id, tx)
		if err != nil {
			return err
		}

		err = tx.Delete(&evt).Error

		return err
	})

	return err == nil, err
}

func PublishEventWithID(id string, orm *orm.ORM) (event.Event, error) {
	db := NewDB(orm)

	dbEvent, err := GetEventWithID(id, db)
	if err != nil {
		return dbEvent, err
	}

	err = db.Transaction(func(tx *gorm.DB) error {
		dbEvent.Published = true
		err = tx.Save(&dbEvent).Error
		if err != nil {
			return err
		}

		return nil
	})

	if err != nil {
		return dbEvent, err
	}

	dbEvent, err = GetEventWithID(id, db)

	return dbEvent, err
}

func UnpublishEventWithID(id string, orm *orm.ORM) (event.Event, error) {
	db := NewDB(orm)

	dbEvent, err := GetEventWithID(id, db)
	if err != nil {
		return dbEvent, err
	}

	err = db.Transaction(func(tx *gorm.DB) error {
		dbEvent.Published = false
		err = tx.Save(&dbEvent).Error
		if err != nil {
			return err
		}

		return nil
	})

	if err != nil {
		return dbEvent, err
	}

	dbEvent, err = GetEventWithID(id, db)

	return dbEvent, err
}

// SetRegistrationTypeForEventWithID sets the Registration field for a given Event (by ID)
func SetRegistrationTypeForEventWithID(id string, registrationType models.RegistrationType, orm *orm.ORM) (event.Event, error) {
	db := NewDB(orm)

	event, err := GetEventWithID(id, db)
	if err != nil {
		return event, err
	}

	err = db.Transaction(func(tx *gorm.DB) error {
		event.Registration = registrationType.String()
		err = tx.Save(&event).Error
		return err
	})

	if err != nil {
		return event, err
	}

	event, err = GetEventWithID(id, db)

	return event, err
}

func AddPlayerToEvent(event *event.Event, player *event.Player, orm *orm.ORM) (event.Event, error) {
	println("AddPlayerToEvent", player.Name, event.Name)
	db := NewDB(orm)

	err := db.Transaction(func(tx *gorm.DB) error {
		if player.ID.String() == constants.BlankUUID {
			p, err := CreatePlayer(*player, tx)
			if err != nil {
				return err
			}
			player = &p
		}

		event.Players = append(event.Players, *player)
		err := tx.Model(&event).Association("Players").Replace(event.Players).Error
		if err != nil {
			return err
		}

		err = tx.Save(event).Error
		return err
	})

	if err != nil {
		return *event, err
	}

	dbEvent, err := GetEventWithID(event.ID.String(), db)
	return dbEvent, err
}

func RemovePlayerFromEvent(event *event.Event, player *user.User, orm *orm.ORM) (event.Event, error) {
	db := NewDB(orm)
	playerIndex := -1

	for i, p := range event.Players {
		if p.ID == player.ID {
			playerIndex = i
		}
	}

	if playerIndex < 0 {
		return *event, errors.New("player not found in event")
	}

	err := db.Transaction(func(tx *gorm.DB) error {
		err := tx.Model(&event).Association("Players").Replace(removePlayer(event.Players, playerIndex)).Error
		if err != nil {
			return err
		}

		err = tx.Save(event).Error
		return err
	})

	if err != nil {
		return *event, err
	}

	dbEvent, err := GetEventWithID(event.ID.String(), db)
	return dbEvent, err
}

func removePlayer(s []event.Player, i int) []event.Player {
	s[i] = s[len(s)-1]
	// We do not need to put s[i] at the end, as it will be discarded anyway
	return s[:len(s)-1]
}

// days

func CreateDay(dayInput *models.EventDayInput, eventID string, orm *orm.ORM) (event.Day, error) {
	var eventDay event.Day
	db := NewDB(orm)

	err := db.Transaction(func(tx *gorm.DB) error {
		dbEvent, err := GetEventWithID(eventID, tx)
		if err != nil {
			return err
		}

		eventDay = event.Day{
			StartAt: dayInput.StartAt,
			EndAt:   dayInput.EndAt,
			Event:   dbEvent,
		}

		for r, round := range dayInput.Rounds {
			dbRound := event.Round{
				Counter: r,
			}

			for _, match := range round.Matches {
				p1, err := GetPlayer(match.Player1, tx)
				if err != nil {
					return err
				}

				p2, err := GetPlayer(match.Player2, tx)
				if err != nil {
					return err
				}
				dbMatch := event.Match{
					Player1: p1,
					Player2: p2,
				}

				if match.Player1MarginOfVictory != nil {
					dbMatch.Player1MarginOfVictory = *match.Player1MarginOfVictory
				}

				if match.Player1VictoryPoints != nil {
					dbMatch.Player1VictoryPoints = *match.Player1VictoryPoints
				}

				if match.Player2VictoryPoints != nil {
					dbMatch.Player2VictoryPoints = *match.Player2VictoryPoints
				}

				if match.Player2MarginOfVictory != nil {
					dbMatch.Player2MarginOfVictory = *match.Player2MarginOfVictory
				}

				if match.Blue != nil && *match.Blue != "" {
					blue, err := GetPlayer(*match.Blue, tx)
					if err != nil {
						return err
					}
					dbMatch.Blue = &blue
				}

				if match.Bye != nil && *match.Bye != "" {
					bye, err := GetPlayer(*match.Bye, tx)
					if err != nil {
						return err
					}
					dbMatch.Bye = &bye
				}

				if match.Winner != nil && *match.Winner != "" {
					winner, err := GetPlayer(*match.Winner, tx)
					if err != nil {
						return err
					}
					dbMatch.Winner = &winner
				}
				dbRound.Matches = append(dbRound.Matches, dbMatch)
			}
			eventDay.Rounds = append(eventDay.Rounds, dbRound)
		}

		// save the day
		return tx.Create(&eventDay).Error
	})

	return eventDay, err
}

func UpdateDay(input *models.EventDayInput, db *gorm.DB) (event.Day, error) {
	var dayOut event.Day

	if input == nil {
		return dayOut, errors.New("day input is invalid")
	}

	if input.ID == nil {
		return dayOut, errors.New("day input id is missing")
	}
	day, err := GetDayWithID(*input.ID, db)
	if err != nil {
		return dayOut, err
	}

	day.StartAt = input.StartAt
	day.EndAt = input.EndAt

	err = db.Save(&day).Error
	if err != nil {
		return dayOut, err
	}

	// manage rounds for this day
	for _, roundIn := range input.Rounds {
		// there really isn't anything to change for a round
		// so lets skip down to the matches

		// manage this round's matches
		for _, matchIn := range roundIn.Matches {
			_, err := UpdateMatch(matchIn, db)
			if err != nil {
				return dayOut, err
			}
		}
	}

	return GetDayWithID(*input.ID, db)
}

func DeleteDay(id string, orm *orm.ORM) (bool, error) {
	db := NewDB(orm)

	err := db.Transaction(func(tx *gorm.DB) error {
		day, err := GetDayWithID(id, tx)
		if err != nil {
			return err
		}

		err = tx.Delete(&day).Error

		return err
	})

	return err == nil, err
}

// rounds

func CreateRound(roundInput *models.RoundInput, dayID string, orm *orm.ORM) (event.Round, error) {
	var newRound event.Round
	db := NewDB(orm)

	err := db.Transaction(func(tx *gorm.DB) error {
		day, err := GetDayWithID(dayID, tx)
		if err != nil {
			return err
		}

		newRound = event.Round{
			Counter: len(day.Rounds),
			Day:     day,
		}

		for _, match := range roundInput.Matches {
			p1, err := GetPlayer(match.Player1, tx)
			if err != nil {
				return err
			}

			p2, err := GetPlayer(match.Player2, tx)
			if err != nil {
				return err
			}
			dbMatch := event.Match{
				Player1: p1,
				Player2: p2,
			}

			if match.Player1MarginOfVictory != nil {
				dbMatch.Player1MarginOfVictory = *match.Player1MarginOfVictory
			}

			if match.Player1VictoryPoints != nil {
				dbMatch.Player1VictoryPoints = *match.Player1VictoryPoints
			}

			if match.Player2VictoryPoints != nil {
				dbMatch.Player2VictoryPoints = *match.Player2VictoryPoints
			}

			if match.Player2MarginOfVictory != nil {
				dbMatch.Player2MarginOfVictory = *match.Player2MarginOfVictory
			}

			if match.Blue != nil && *match.Blue != "" {
				blue, err := GetPlayer(*match.Blue, tx)
				if err != nil {
					return err
				}
				dbMatch.Blue = &blue
			}

			if match.Bye != nil && *match.Bye != "" {
				bye, err := GetPlayer(*match.Bye, tx)
				if err != nil {
					return err
				}
				dbMatch.Bye = &bye
			}

			if match.Winner != nil && *match.Winner != "" {
				winner, err := GetPlayer(*match.Winner, tx)
				if err != nil {
					return err
				}
				dbMatch.Winner = &winner
			}
			newRound.Matches = append(newRound.Matches, dbMatch)
		}

		// save the round
		return tx.Create(&newRound).Error
	})

	if err != nil {
		return newRound, err
	}

	return newRound, nil
}

func DeleteRound(id string, orm *orm.ORM) (bool, error) {
	db := NewDB(orm)

	err := db.Transaction(func(tx *gorm.DB) error {
		round, err := GetRoundWithID(id, tx)
		if err != nil {
			return err
		}

		err = tx.Delete(&round).Error

		return err
	})

	return err == nil, err
}

// matches

func CreateMatch(matchInput *models.MatchInput, roundID string, orm *orm.ORM) (event.Match, error) {
	var newMatch event.Match
	db := NewDB(orm)

	err := db.Transaction(func(tx *gorm.DB) error {
		round, err := GetRoundWithID(roundID, tx)
		if err != nil {
			return err
		}

		p1, err := GetPlayer(matchInput.Player1, tx)
		if err != nil {
			return err
		}

		p2, err := GetPlayer(matchInput.Player2, tx)
		if err != nil {
			return err
		}
		newMatch = event.Match{
			Player1: p1,
			Player2: p2,
			Round:   round,
		}

		if matchInput.Player1MarginOfVictory != nil {
			newMatch.Player1MarginOfVictory = *matchInput.Player1MarginOfVictory
		}

		if matchInput.Player1VictoryPoints != nil {
			newMatch.Player1VictoryPoints = *matchInput.Player1VictoryPoints
		}

		if matchInput.Player2VictoryPoints != nil {
			newMatch.Player2VictoryPoints = *matchInput.Player2VictoryPoints
		}

		if matchInput.Player2MarginOfVictory != nil {
			newMatch.Player2MarginOfVictory = *matchInput.Player2MarginOfVictory
		}

		if matchInput.Blue != nil && *matchInput.Blue != "" {
			blue, err := GetPlayer(*matchInput.Blue, tx)
			if err != nil {
				return err
			}
			newMatch.Blue = &blue
		}

		if matchInput.Bye != nil && *matchInput.Bye != "" {
			bye, err := GetPlayer(*matchInput.Bye, tx)
			if err != nil {
				return err
			}
			newMatch.Bye = &bye
		}

		if matchInput.Winner != nil && *matchInput.Winner != "" {
			winner, err := GetPlayer(*matchInput.Winner, tx)
			if err != nil {
				return err
			}
			newMatch.Winner = &winner
		}

		// save the round
		return tx.Create(&newMatch).Error
	})

	if err != nil {
		return newMatch, err
	}

	return newMatch, nil
}

func UpdateMatch(input *models.MatchInput, db *gorm.DB) (event.Match, error) {
	var matchOut event.Match

	if input == nil {
		return matchOut, errors.New("match input is invalid")
	}

	if input.ID == nil {
		return matchOut, errors.New("match input id is missing")
	}

	match, err := GetMatchWithID(*input.ID, db)
	if err != nil {
		return matchOut, err
	}

	player1, err := GetPlayer(input.Player1, db)
	if err != nil {
		return matchOut, err
	}

	player2, err := GetPlayer(input.Player2, db)
	if err != nil {
		return matchOut, err
	}

	// match players
	if match.Player1.ID != player1.ID {
		match.Player1 = player1
	}

	if match.Player2.ID != player2.ID {
		match.Player2 = player2
	}

	// player victory points
	if input.Player1VictoryPoints != nil && match.Player1VictoryPoints != *input.Player1VictoryPoints {
		match.Player1VictoryPoints = *input.Player1VictoryPoints
	}

	if input.Player2VictoryPoints != nil && match.Player2VictoryPoints != *input.Player2VictoryPoints {
		match.Player2VictoryPoints = *input.Player2VictoryPoints
	}

	// player margin of victory
	if input.Player1MarginOfVictory != nil && match.Player1MarginOfVictory != *input.Player1MarginOfVictory {
		match.Player1MarginOfVictory = *input.Player1MarginOfVictory
	}

	if input.Player2MarginOfVictory != nil && match.Player2MarginOfVictory != *input.Player2MarginOfVictory {
		match.Player2MarginOfVictory = *input.Player2MarginOfVictory
	}

	// blue player
	if input.Blue != nil {
		blue, err := GetPlayer(*input.Blue, db)
		if err != nil {
			return matchOut, err
		}

		if match.Blue == nil || match.Blue.ID != blue.ID {
			match.Blue = &blue
		}
	}

	// winner
	if input.Winner != nil {
		winner, err := GetPlayer(*input.Winner, db)
		if err != nil {
			return matchOut, err
		}

		if match.Winner == nil || match.Winner.ID != winner.ID {
			match.Winner = &winner
		}
	}

	// bye
	if input.Bye != nil {
		bye, err := GetPlayer(*input.Bye, db)
		if err != nil {
			return matchOut, err
		}

		if match.Bye == nil || match.Bye.ID != bye.ID {
			match.Bye = &bye
		}
	}

	err = db.Save(&match).Error
	if err != nil {
		return matchOut, err
	}

	return GetMatchWithID(*input.ID, db)
}

func DeleteMatch(id string, orm *orm.ORM) (bool, error) {
	db := NewDB(orm)

	err := db.Transaction(func(tx *gorm.DB) error {
		match, err := GetMatchWithID(id, tx)
		if err != nil {
			return err
		}

		err = tx.Delete(&match).Error

		return err
	})

	return err == nil, err
}

func GenerateMatchPairings(eventID, roundID string, o *orm.ORM) ([]event.Match, error) {
	db := NewDB(o)

	var generatedMatches []event.Match

	err := db.Transaction(func(tx *gorm.DB) error {
		var err error

		// get the round
		round, err := GetRoundWithID(roundID, tx)
		if err != nil {
			return err
		}

		// delete any existing matches
		for _, match := range round.Matches {
			_, err = DeleteMatch(match.ID.String(), o)
			if err != nil {
				tx.Rollback()
				return err
			}
		}

		// get player stats for each player in the event
		sql := `
		SELECT *
		FROM player_stats
		WHERE player_id in (
				select id from players where event_id = ?
		)
		ORDER BY total_wins DESC
		`
		var stats []event.PlayerStats

		err = tx.
			Raw(sql, eventID).
			Scan(&stats).
			Error
		if err != nil {
			tx.Rollback()
			return err
		}

		var players []event.Player
		for _, s := range stats {
			player, err := GetPlayer(s.PlayerID.String(), tx)
			if err != nil {
				return err
			}

			players = append(players, player)
		}

		// if players is an odd length we need to create a "Bye Player"
		// and add them to playersB.
		byePlayerName := "Bye Player"
		if len(players)%2 != 0 {
			byePlayer := event.Player{
				Name:    byePlayerName,
				EventID: uuid.FromStringOrNil(eventID),
			}

			err = tx.Save(&byePlayer).Error
			if err != nil {
				tx.Rollback()
				return err
			}

			players = append(players, byePlayer)
		}

		assigned := map[uuid.UUID]uuid.UUID{}
		// loop through the available players
		for _, player := range players {
			// loop through the players again to find an opponent
			for _, opponent := range players {
				// if opponent is the player then skip
				isSelf := player.ID == opponent.ID
				_, opponentAssigned := assigned[opponent.ID]
				_, playerAssigned := assigned[player.ID]

				if !isSelf && !opponentAssigned && !playerAssigned {
					// has this player already played the opponent?
					playedBefore := hasPlayedBefore(player, opponent, tx)

					if !playedBefore {
						// looks like a valid pairing!
						// create a match
						m := event.Match{
							Player1: player,
							Player2: opponent,
							Round:   round,
						}

						if player.Name == byePlayerName {
							m.Bye = &opponent
						}

						if opponent.Name == byePlayerName {
							m.Bye = &player
						}

						// save the match
						err := tx.Save(&m).Error
						if err != nil {
							tx.Rollback()
							return err
						}

						// map the assignment for future checks
						assigned[opponent.ID] = player.ID
						assigned[player.ID] = opponent.ID

						// add the match to the slice
						generatedMatches = append(generatedMatches, m)
					}
				}
			}
		}

		return nil
	})
	if err != nil {
		return nil, err
	}

	return generatedMatches, nil
}

func CloseRound(id string, o *orm.ORM) (*event.Round, error) {
	log.Printf("Closing round with id %s", id)
	db := NewDB(o)
	var (
		round event.Round
		err   error
	)

	err = db.Transaction(func(tx *gorm.DB) error {
		var err error

		if round, err = GetRoundWithID(id, tx); err != nil {
			tx.Rollback()
			log.Printf("error getting round %v", err)
			return err
		}

		if !round.Closed {
			round.Closed = true

			if err = tx.Save(&round).Error; err != nil {
				tx.Rollback()
				log.Printf("error saving round %v", err)
				return err
			}

			// go over each match and update each player's stats
			for _, match := range round.Matches {
				// player 1
				err = updatePlayerStats(
					match.Player1,
					int64(match.Player1MarginOfVictory),
					int64(match.Player1VictoryPoints),
					match.Winner.ID == match.Player1.ID,
					match.Blue.ID == match.Player1.ID,
					match.Player2,
					tx,
				)

				if err != nil {
					tx.Rollback()
					log.Printf("error updating p1 stats %v", err)
					return err
				}

				// player 2
				err = updatePlayerStats(
					match.Player2,
					int64(match.Player2MarginOfVictory),
					int64(match.Player2VictoryPoints),
					match.Winner.ID == match.Player2.ID,
					match.Blue.ID == match.Player2.ID,
					match.Player1,
					tx,
				)

				if err != nil {
					tx.Rollback()
					log.Printf("error updating p2 stats %v", err)
					return err
				}

				// log who the players played against
				if err = savePlayerOpponent(match.Player1, match.Player2, tx); err != nil {
					tx.Rollback()
					return err
				}

				if err = savePlayerOpponent(match.Player2, match.Player1, tx); err != nil {
					tx.Rollback()
					return err
				}
			}
		}

		return nil
	})

	if err != nil {
		return nil, err
	}

	return &round, nil
}

func updatePlayerStats(player event.Player, mov, vp int64, winner, blue bool, opponent event.Player, db *gorm.DB) error {
	var stats event.PlayerStats
	err := db.
		Where("player_id = ?", player.ID.String()).
		First(&stats).
		Error
	createNewRecord := false
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			createNewRecord = true
		} else {
			return err
		}
	}

	if createNewRecord {
		log.Printf("Create a new stats record for %s", player.Name)
		// setup a new stats record for this player
		stats = event.PlayerStats{
			PlayerID:     player.ID,
			TotalMOV:     0,
			TotalVP:      0,
			TotalMatches: 0,
			TotalWins:    0,
			AverageMOV:   0,
		}
	}

	log.Printf("Stats for %s", player.Name)
	log.Printf("Stats ID %s", stats.ID.String())

	stats.TotalMOV = stats.TotalMOV + mov
	stats.TotalVP = stats.TotalVP + vp
	stats.TotalMatches = stats.TotalMatches + 1

	stats.AverageMOV = int64(stats.TotalMOV / stats.TotalMatches)

	if winner {
		stats.TotalWins = stats.TotalWins + 1
	}

	if blue {
		stats.TimesBlue = stats.TimesBlue + 1
	}

	err = db.Save(&stats).Error

	return err
}

func savePlayerOpponent(player, opponent event.Player, db *gorm.DB) error {
	po := event.PlayerOpponent{
		Player:   player,
		Opponent: opponent,
	}

	return db.Save(&po).Error
}

func hasPlayedBefore(player, opponent event.Player, db *gorm.DB) bool {
	var pos []event.PlayerOpponent

	db.Where("player_id = ?", player.ID.String()).Find(&pos)

	for _, po := range pos {
		if po.OpponentID == opponent.ID {
			return true
		}
	}

	return false
}

func GetPlayerStats(player *event.Player, db *gorm.DB) (*event.PlayerStats, error) {
	var stats event.PlayerStats
	err := db.Where("player_id = ?", player.ID.String()).First(&stats).Error
	if err != nil {
		return nil, err
	}

	return &stats, nil
}

func GetPlayers(eventID string, db *gorm.DB) ([]*event.Player, error) {
	var players []*event.Player
	err := db.Where("event_id = ?", eventID).Find(&players).Error
	if err != nil {
		return nil, err
	}

	return players, nil
}
