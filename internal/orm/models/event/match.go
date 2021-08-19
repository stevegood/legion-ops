package event

import (
	"time"

	"github.com/StarWarsDev/legion-ops/internal/constants"

	"github.com/StarWarsDev/legion-ops/internal/orm/models"
	"github.com/gofrs/uuid"
	"github.com/jinzhu/gorm"
)

type Match struct {
	ID        uuid.UUID `gorm:"primary_key;type:uuid;default:uuid_generate_v4()"`
	CreatedAt time.Time `gorm:"not null"`
	UpdatedAt time.Time `gorm:"not null"`

	// Match
	Round   Round `gorm:"PRELOAD:false"`
	RoundID uuid.UUID

	// Bye
	Bye   *Player `gorm:"association_autoupdate:false;association_autocreate:false"`
	ByeID *uuid.UUID

	// Player 1
	Player1                Player `gorm:"not null;association_autoupdate:false;association_autocreate:false"`
	Player1ID              uuid.UUID
	Player1VictoryPoints   int
	Player1MarginOfVictory int

	// Player 2
	Player2                Player `gorm:"not null;association_autoupdate:false;association_autocreate:false"`
	Player2ID              uuid.UUID
	Player2VictoryPoints   int
	Player2MarginOfVictory int

	// Blue player
	Blue   *Player `gorm:"association_autoupdate:false;association_autocreate:false"`
	BlueID *uuid.UUID

	// Winner
	Winner   *Player `gorm:"association_autoupdate:false;association_autocreate:false"`
	WinnerID *uuid.UUID
}

func (record *Match) BeforeSave(scope *gorm.Scope) error {
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
