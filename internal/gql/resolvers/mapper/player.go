package mapper

import (
	"log"

	"github.com/StarWarsDev/legion-ops/internal/gql/models"
	"github.com/StarWarsDev/legion-ops/internal/orm/models/event"
)

func GQLPlayer(p *event.Player) *models.Player {
	if p == nil {
		log.Println("player is nil")
		return nil
	}
	return &models.Player{
		ID:   p.ID.String(),
		Name: p.Name,
	}
}
