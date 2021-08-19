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
	CreatedAt int64     `gorm:"not null"`
	UpdatedAt int64     `gorm:"not null"`
	Name      string    // if this is blank the UI will fall back to `Username`
	Event     Event     `gorm:"PRELOAD:false"`
	EventID   uuid.UUID
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

	unixNow := time.Now().UTC().Unix()

	if player.CreatedAt == 0 {
		err = scope.SetColumn("CreatedAt", unixNow)
		if err != nil {
			return err
		}
	}

	err = scope.SetColumn("UpdatedAt", unixNow)

	return err
}

func (player *Player) Prepare() {
	id, err := models.GenerateUUID()
	if err != nil {
		return
	}

	player.ID = id
	if player.CreatedAt == 0 {
		player.CreatedAt = time.Now().UTC().Unix()
	}
	player.UpdatedAt = time.Now().UTC().Unix()
	player.Name = html.EscapeString(strings.TrimSpace(player.Name))
}
