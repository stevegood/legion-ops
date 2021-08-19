package data

import (
	"github.com/StarWarsDev/legion-ops/internal/orm/models/event"
	"github.com/jinzhu/gorm"
)

func CreatePlayer(in event.Player, db *gorm.DB) (event.Player, error) {
	out := in
	err := db.Create(&out).Error
	return out, err
}

func GetPlayer(id string, db *gorm.DB) (event.Player, error) {
	var p event.Player
	err := db.
		Set("gorm:auto_preload", false).
		Select("*").
		Where("id = ?", id).
		First(&p).
		Error

	return p, err
}
