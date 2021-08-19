package event

import (
	"time"

	"github.com/StarWarsDev/legion-ops/internal/constants"

	"github.com/StarWarsDev/legion-ops/internal/orm/models"
	"github.com/gofrs/uuid"
	"github.com/jinzhu/gorm"
)

type Day struct {
	ID        uuid.UUID `gorm:"primary_key;type:uuid;default:uuid_generate_v4()"`
	CreatedAt time.Time `gorm:"not null"`
	UpdatedAt time.Time `gorm:"not null"`
	StartAt   time.Time `gorm:"not null"`
	EndAt     time.Time `gorm:"not null"`
	Event     Event     `gorm:"PRELOAD:false"`
	EventID   uuid.UUID
	Rounds    []Round
}

func (record *Day) BeforeSave(scope *gorm.Scope) error {
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
