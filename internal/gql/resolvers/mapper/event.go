package mapper

import (
	"github.com/StarWarsDev/legion-ops/internal/gql/models"
	"github.com/StarWarsDev/legion-ops/internal/orm/models/event"
)

func GQLEvent(eventIn *event.Event) *models.Event {
	organizer := eventIn.Organizer
	eventOut := models.Event{
		ID:           eventIn.ID.String(),
		CreatedAt:    eventIn.CreatedAt,
		UpdatedAt:    eventIn.UpdatedAt,
		Name:         eventIn.Name,
		Description:  eventIn.Description,
		Type:         models.EventType(eventIn.Type),
		Registration: models.RegistrationType(eventIn.Registration),
		Published:    eventIn.Published,
		Organizer:    GQLUser(&organizer),
	}

	if eventIn.HeadJudge != nil {
		eventOut.HeadJudge = GQLUser(eventIn.HeadJudge)
	}

	for _, judge := range eventIn.Judges {
		eventOut.Judges = append(eventOut.Judges, GQLUser(&judge))
	}

	for _, player := range eventIn.Players {
		eventOut.Players = append(eventOut.Players, GQLPlayer(&player))
	}

	for _, day := range eventIn.Days {
		eventOut.Days = append(eventOut.Days, GQLEventDay(&day))
	}

	return &eventOut
}

func GQLEventDay(day *event.Day) *models.EventDay {
	dayOut := models.EventDay{
		CreatedAt: day.CreatedAt,
		EndAt:     day.EndAt,
		ID:        day.ID.String(),
		UpdatedAt: day.UpdatedAt,
		Rounds:    []*models.Round{},
		StartAt:   day.StartAt,
	}

	for _, round := range day.Rounds {
		dayOut.Rounds = append(dayOut.Rounds, GQLRound(&round))
	}

	return &dayOut
}

func GQLRound(round *event.Round) *models.Round {
	roundOut := models.Round{
		ID:      round.ID.String(),
		Counter: round.Counter,
		Matches: []*models.Match{},
	}

	for _, match := range round.Matches {
		roundOut.Matches = append(roundOut.Matches, GQLMatch(&match))
	}

	return &roundOut
}

func GQLMatch(match *event.Match) *models.Match {
	player1 := match.Player1
	player2 := match.Player2
	m := models.Match{
		ID:                     match.ID.String(),
		Player1:                GQLPlayer(&player1),
		Player1VictoryPoints:   match.Player1VictoryPoints,
		Player1MarginOfVictory: match.Player1MarginOfVictory,
		Player2:                GQLPlayer(&player2),
		Player2VictoryPoints:   match.Player2VictoryPoints,
		Player2MarginOfVictory: match.Player2MarginOfVictory,
		// ResultReports:          []*models.MatchResultReport{},
	}

	if m.Bye != nil {
		m.Bye = GQLPlayer(match.Bye)
	}
	if m.Blue != nil {
		m.Blue = GQLPlayer(match.Blue)
	}
	if m.Winner != nil {
		m.Winner = GQLPlayer(match.Winner)
	}

	return &m
}
