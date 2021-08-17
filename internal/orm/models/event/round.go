package event

import (
	"log"
	"math"
	"math/rand"
	"time"

	"github.com/StarWarsDev/legion-ops/internal/constants"

	"github.com/StarWarsDev/legion-ops/internal/orm/models"
	"github.com/gofrs/uuid"
	"github.com/jinzhu/gorm"
)

type Round struct {
	ID        uuid.UUID `gorm:"primary_key;type:uuid;default:uuid_generate_v4()"`
	CreatedAt time.Time `gorm:"not null"`
	UpdatedAt time.Time `gorm:"not null"`
	Counter   int       `gorm:"not null"`
	Day       Day       `gorm:"PRELOAD:false"`
	DayID     uuid.UUID
	Matches   []Match
}

func (record *Round) BeforeSave(scope *gorm.Scope) error {
	if record.ID.String() == constants.BlankUUID {
		id, err := models.GenerateUUID()
		if err != nil {
			return err
		}

		err = scope.SetColumn("ID", id)
		if err != nil {
			return err
		}
	}

	return nil
}

// SeedWithRandomMatches will fill a round with Match instances
// generated randomly from the associated event's players list.
func (round *Round) SeedWithRandomMatches() {
	players := round.Day.Event.Players
	log.Printf("Generating random Matches for %d players", len(players))

	// reset matches if any are there
	if len(round.Matches) > 0 {
		round.Matches = make([]Match, CalcNumMatches(len(players)))
	}

	// shuffle the event players
	shuffledPlayers := shuffle(players)

	// collect every other player into two collections
	var leftPlayers []Player
	var rightPlayers []Player

	for i, player := range shuffledPlayers {
		if i%2 == 0 {
			leftPlayers = append(leftPlayers, player)
		} else {
			rightPlayers = append(rightPlayers, player)
		}
	}

	// loop over the left players (should always be equal or larger than right players)
	for i := 0; i < len(leftPlayers); i++ {
		left := leftPlayers[i]
		right := rightPlayers[i]

		match := Match{
			Player1: left,
			Player2: right,
		}

		round.Matches = append(round.Matches, match)
	}
}

func shuffle(players []Player) []Player {
	r := rand.New(rand.NewSource(time.Now().Unix()))
	ret := make([]Player, len(players))
	n := len(players)
	for i := 0; i < n; i++ {
		randIndex := r.Intn(len(players))
		ret[i] = players[randIndex]
		players = append(players[:randIndex], players[randIndex+1:]...)
	}
	return ret
}

// CalcNumMatches takes in a number of players and
// returns the number of matches required to contain
// the players.
func CalcNumMatches(lenPlayers int) int {
	// if we have an odd number of players then
	// we need to add 1 so we get enough matches
	// to contain everyone
	if lenPlayers%2 != 0 {
		lenPlayers = lenPlayers + 1
	}

	return int(math.RoundToEven(float64(lenPlayers / 2)))
}
