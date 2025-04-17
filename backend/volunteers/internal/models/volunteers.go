package models

import (
	"github.com/uptrace/bun"
)

type Volunteer struct {
	bun.BaseModel `bun:"table:volunteer,alias:v"`

	TGID       int64  `bun:"tg_id,pk" json:"tg_id"`
	FirstName  string `bun:"first_name" json:"first_name" validate:"required,max=255"`
	MiddleName string `bun:"middle_name" json:"middle_name" validate:"required,max=255"`
	LastName   string `bun:"last_name" json:"last_name" validate:"required,max=255"`
	TgLogin    string `bun:"tg_login" json:"tg_login" validate:"required,max=255"`
}
