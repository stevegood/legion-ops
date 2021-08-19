package event

import (
	"html"
	"strings"
	"time"

	"github.com/StarWarsDev/legion-ops/internal/constants"

	"github.com/StarWarsDev/legion-ops/internal/orm/models"
	"github.com/StarWarsDev/legion-ops/internal/orm/models/user"

	"github.com/jinzhu/gorm"

	"github.com/gofrs/uuid"
)

type Event struct {
	ID           uuid.UUID   `gorm:"primary_key;type:uuid;default:uuid_generate_v4()"`
	Name         string      `gorm:"not null"`
	Description  string      `gorm:"not null;type:text;default:''"`
	Type         string      `gorm:"not null"`
	CreatedAt    time.Time   `gorm:"not null"`
	UpdatedAt    time.Time   `gorm:"not null"`
	Published    bool        `gorm:"not null;type:boolean;default:false"`
	Registration string      `gorm:"not null;default:'CLOSED'"`
	Organizer    user.User   `gorm:"not null;association_autoupdate:false;association_autocreate:false"`
	OrganizerID  uuid.UUID   `gorm:"not null"`
	Players      []Player    `gorm:"many2many:event_players;association_autoupdate:false;association_autocreate:false"`
	Judges       []user.User `gorm:"many2many:event_judges;association_autoupdate:false;association_autocreate:false"`
	HeadJudge    *user.User  `gorm:"association_autoupdate:false;association_autocreate:false"`
	HeadJudgeID  *uuid.UUID
	Days         []Day
}

func (event *Event) BeforeSave(scope *gorm.Scope) error {
	if event.ID.String() == constants.BlankUUID {
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

func (event *Event) Prepare() {
	id, err := models.GenerateUUID()
	if err != nil {
		return
	}

	event.ID = id
	event.Name = html.EscapeString(strings.TrimSpace(event.Name))
	event.Type = html.EscapeString(strings.TrimSpace(event.Type))
}

func (event *Event) ContainsPlayer(playerID uuid.UUID) bool {
	for _, player := range event.Players {
		if player.ID == playerID {
			return true
		}
	}
	return false
}
