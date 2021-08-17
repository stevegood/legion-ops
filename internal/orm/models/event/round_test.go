package event_test

import (
	"strings"
	"testing"
	"time"

	"github.com/StarWarsDev/legion-ops/internal/orm/models/event"
	"github.com/gofrs/uuid"
)

func TestSeedWithRandomMatches(t *testing.T) {
	event := event.Event{
		Players: []event.Player{
			{
				ID:   uuid.FromStringOrNil("2f29b88c-15e1-4e79-81d3-a1a5b4ba2a15"),
				Name: "Player One",
			},
			{
				ID:   uuid.FromStringOrNil("d4db23ca-3061-4399-81af-8db1ca22b997"),
				Name: "Player Two",
			},
			{
				ID:   uuid.FromStringOrNil("3e1a7f35-2b61-48e2-9dae-d155037da08b"),
				Name: "Player Three",
			},
			{
				ID:   uuid.FromStringOrNil("a5b6e087-5157-44d0-8554-26e1d668ff27"),
				Name: "Player Four",
			},
		},
		Days: []event.Day{
			{
				StartAt: time.Now(),
				EndAt:   time.Now().Add(time.Hour + 24),
				Rounds: []event.Round{
					{
						ID: uuid.FromStringOrNil("bc07fcd5-79fa-4806-9a33-b353199dce11"),
					},
				},
			},
		},
	}

	event.Days[0].Event = event
	event.Days[0].Rounds[0].Day = event.Days[0]

	// call SeedWithRaondomMatches
	event.Days[0].Rounds[0].SeedWithRandomMatches()

	if len(event.Days[0].Rounds[0].Matches) == 0 {
		t.Log("no matches generated")
		t.FailNow()
	}

	// collect the seed players ids
	var playerIDs []string
	for _, match := range event.Days[0].Rounds[0].Matches {
		playerIDs = append(playerIDs, match.Player1.ID.String())
		playerIDs = append(playerIDs, match.Player2.ID.String())
	}

	var eventPlayerIDs []string
	for _, player := range event.Players {
		eventPlayerIDs = append(eventPlayerIDs, player.ID.String())
	}

	if strings.Join(playerIDs, ",") == strings.Join(eventPlayerIDs, ",") {
		t.Logf(
			"Generated matches don't seem to be randomized... \n\tGenerated: %s\n\tOriginal: %s",
			strings.Join(playerIDs, ","),
			strings.Join(eventPlayerIDs, ","),
		)
		t.FailNow()
	}

	t.Logf(
		"Generated matches seem to be randomized... \n\tGenerated: %s\n\tOriginal: %s",
		strings.Join(playerIDs, ","),
		strings.Join(eventPlayerIDs, ","),
	)
}

func TestCalcNumMatches(t *testing.T) {
	type args struct {
		lenPlayers int
	}
	tests := []struct {
		name string
		args args
		want int
	}{
		{
			name: "2 players 1 match",
			args: args{
				lenPlayers: 2,
			},
			want: 1,
		},
		{
			name: "1 player 1 match",
			args: args{
				lenPlayers: 1,
			},
			want: 1,
		},
		{
			name: "3 players 2 matches",
			args: args{
				lenPlayers: 3,
			},
			want: 2,
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if got := event.CalcNumMatches(tt.args.lenPlayers); got != tt.want {
				t.Errorf("CalcNumMatches() = %v, want %v", got, tt.want)
			}
		})
	}
}
