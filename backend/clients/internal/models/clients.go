package models

import (
	"time"

	"github.com/uptrace/bun"
)

type Client struct {
	bun.BaseModel `bun:"table:client,alias:c"`

	BirthDate     time.Time  `bun:"birth_date" json:"birth_date,omitempty"`
	FirstName     string     `bun:"firstname" json:"firstname"`
	Gender        *int32     `bun:"gender" json:"gender,omitempty"`
	Id            int64      `bun:"id,pk,autoincrement" json:"id"`
	IsBlocked     *bool      `bun:"is_blocked" json:"is_blocked,omitempty"`
	IsHomeless    *bool      `bun:"is_homeless" json:"is_homeless,omitempty"`
	IsNew         bool       `bun:"-" json:"is_new,omitempty"`
	LastServiceDt *time.Time `bun:"-" json:"last_service_dt,omitempty"`
	LastName      string     `bun:"lastname" json:"lastname"`
	MiddleName    string     `bun:"middlename" json:"middlename"`
	PhotoName     *string    `bun:"photo_name" json:"photo_name,omitempty"`
	BlockedReason *string    `bun:"blocked_reason" json:"blocked_reason,omitempty"`
	UpdatedByID   *int64     `bun:"updated_by_id" json:"updated_by_id,omitempty"`
	CreatedByID   *int64     `bun:"created_by_id" json:"created_by_id,omitempty"`
	BlockedAt     *time.Time `bun:"blocked_at" json:"blocked_at,omitempty"`
}

type ClientFieldValue struct {
	bun.BaseModel `bun:"table:client_field_value,alias:cfv"`

	Id       int64 `bun:"id,pk,autoincrement" json:"id"`
	ClientID int64 `bun:"client_id" json:"client_id"`
	OptionID int64 `bun:"option_id" json:"option_id"`
}

type ServiceTypes struct {
	bun.BaseModel `bun:"table:service_type,alias:st"`

	Id                    int64  `bun:"id,pk,autoincrement" json:"id"`
	Name                  string `bun:"name" json:"name,omitempty"`
	RegistrationAvailable bool   `bun:"registration_available" json:"registration_available"`
	MinPeriodDays         int    `bun:"min_period_days" json:"min_period_days"`
}

type Service struct {
	bun.BaseModel `bun:"table:service,alias:s"`

	Id        int64     `bun:"id,pk,autoincrement" json:"id"`
	ClientID  int64     `bun:"client_id" json:"client_id"`
	CreatedAt time.Time `bun:"created_at" json:"created_at"`
	UpdatedAt time.Time `bun:"updated_at" json:"updated_at"`
}

type Event struct {
	Id                int64 ` json:"id"`
	Capacity          int32 ` json:"capacity"`
	ParticipantsCount int32 `json:"participants_count"`
}
