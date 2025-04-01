package models

import (
	"time"

	"github.com/uptrace/bun"
)

type Location struct {
	bun.BaseModel `bun:"table:location,alias:l"`

	ID          int64     `bun:"id,pk,autoincrement" json:"id"`
	Name        string    `bun:"name,notnull" json:"name" validate:"required,max=255"`
	Address     string    `bun:"address" json:"address,omitempty" validate:"max=255"`
	CreatedByID *int64    `bun:"created_by_id" json:"created_by_id,omitempty"`
	UpdatedByID *int64    `bun:"updated_by_id" json:"updated_by_id,omitempty"`
	CreatedAt   time.Time `bun:"created_at,notnull,default:current_timestamp" json:"created_at"`
	UpdatedAt   time.Time `bun:"updated_at,notnull,default:current_timestamp" json:"updated_at"`
}
