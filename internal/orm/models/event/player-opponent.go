package event

import (
	"github.com/StarWarsDev/legion-ops/internal/constants"
	"github.com/StarWarsDev/legion-ops/internal/orm/models"
	"github.com/gofrs/uuid"
	"github.com/jinzhu/gorm"
)

type PlayerOpponent struct {
	ID         uuid.UUID `gorm:"primary_key;type:uuid;default:uuid_generate_v4()"`
	Player     Player    `gorm:"uniqueIndex:player_opponent_idx"`
	PlayerID   uuid.UUID
	Opponent   Player `gorm:"uniqueIndex:player_opponent_idx"`
	OpponentID uuid.UUID
}

func (ps *PlayerOpponent) BeforeSave(scope *gorm.Scope) error {
	var err error
	if ps.ID.String() == constants.BlankUUID {
		id, err := models.GenerateUUID()
		if err != nil {
			return err
		}

		err = scope.SetColumn("ID", id)
		if err != nil {
			return err
		}
	}

	return err
}

func (ps *PlayerOpponent) Prepare() {
	id, err := models.GenerateUUID()
	if err != nil {
		return
	}

	ps.ID = id
}
