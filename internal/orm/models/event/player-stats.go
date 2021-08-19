package event

import (
	"time"

	"github.com/StarWarsDev/legion-ops/internal/constants"
	"github.com/StarWarsDev/legion-ops/internal/orm/models"
	"github.com/gofrs/uuid"
	"github.com/jinzhu/gorm"
)

type PlayerStats struct {
	ID           uuid.UUID `gorm:"primary_key;type:uuid;default:uuid_generate_v4()"`
	CreatedAt    time.Time `gorm:"not null"`
	UpdatedAt    time.Time `gorm:"not null"`
	TotalMOV     int64     `gorm:"default:0;column:total_mov;not null"`
	AverageMOV   int64     `gorm:"default:0;column:average_mov;not null"`
	TotalVP      int64     `gorm:"default:0;column:total_vp;not null"`
	TotalWins    int64     `gorm:"default:0;column:total_wins;not null"`
	TimesBlue    int64     `gorm:"default:0;column:times_blue;not null"`
	TotalMatches int64     `gorm:"default:0;column:total_matches;not null"`
	PlayerID     uuid.UUID
}

func (ps *PlayerStats) BeforeSave(scope *gorm.Scope) error {
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

func (ps *PlayerStats) Prepare() {
	id, err := models.GenerateUUID()
	if err != nil {
		return
	}

	ps.ID = id
}
