package models

import (
	"time"

	"github.com/uptrace/bun"
)

type Client struct {
	bun.BaseModel `bun:"table:clients,alias:c"`

	BirthDate     time.Time  `bun:"birth_date" json:"birth_date,omitempty"`
	FirstName     string     `bun:"first_name" json:"first_name"`
	Gender        *int32     `bun:"gender" json:"gender,omitempty"`
	Id            int64      `bun:"id,pk,autoincrement" json:"id"`
	IsBlocked     *bool      `bun:"is_blocked" json:"is_blocked,omitempty"`
	IsHomeless    *bool      `bun:"is_homeless" json:"is_homeless,omitempty"`
	IsNew         bool       `bun:"-" json:"is_new,omitempty"`
	LastName      string     `bun:"last_name" json:"last_name"`
	MiddleName    string     `bun:"middle_name" json:"middle_name"`
	PhotoName     *string    `bun:"photo_name" json:"photo_name,omitempty"`
	BlockedAt     *time.Time `bun:"blocked_at" json:"blocked_at,omitempty"`
	BlockedReason *string    `bun:"blocked_reason" json:"blocked_reason,omitempty"`
}

type ServiceTypes struct {
	bun.BaseModel `bun:"table:service_type,alias:st"`

	Id                    int64  `bun:"id,pk,autoincrement" json:"id"`
	Name                  string `bun:"name" json:"name,omitempty"`
	RegistrationAvailable bool   `bun:"registration_available" json:"registration_available"`
	MinPeriodDays         int    `bun:"min_period_days" json:"min_period_days"`
}
