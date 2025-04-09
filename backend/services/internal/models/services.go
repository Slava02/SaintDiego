package models

import (
	"github.com/uptrace/bun"
)

type ServiceType struct {
	bun.BaseModel `bun:"table:service_type,alias:st"`

	ID                    int64  `bun:"id,pk,autoincrement" json:"id"`
	Name                  string `bun:"name" json:"name" validate:"required,max=255"`
	MinPeriodDays         int64  `bun:"min_period_days" json:"min_period_days" validate:"required,min=1"`
	RegistrationAvailable bool   `bun:"registration_available" json:"registration_available" validate:"required"`
}
