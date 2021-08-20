package event

import (
	"html"
	"strings"
	"time"

	"github.com/StarWarsDev/legion-ops/internal/constants"

	"github.com/StarWarsDev/legion-ops/internal/orm/models"

	"github.com/gofrs/uuid"
	"github.com/jinzhu/gorm"
)

type Player struct {
	ID        uuid.UUID `gorm:"primary_key;type:uuid;default:uuid_generate_v4()"`
	CreatedAt time.Time `gorm:"not null"`
	UpdatedAt time.Time `gorm:"not null"`
	Event     Event     `gorm:"PRELOAD:false"`
	EventID   uuid.UUID
	Name      string
}

func (player *Player) BeforeSave(scope *gorm.Scope) error {
	var err error
	if player.ID.String() == constants.BlankUUID {
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

func (player *Player) Prepare() {
	id, err := models.GenerateUUID()
	if err != nil {
		return
	}

	player.ID = id
	player.Name = html.EscapeString(strings.TrimSpace(player.Name))
}
