package models

import (
	"time"

	"github.com/uptrace/bun"
)

type Event struct {
	bun.BaseModel `bun:"table:event,alias:e"`

	ID                int64     `bun:"id,pk,autoincrement" json:"id"`
	TimeSlotServiceID int64     `bun:"time_slot_service_id" json:"time_slot_service_id"`
	Capacity          int32     `bun:"capacity" json:"capacity"`
	Datetime          time.Time `bun:"datetime" json:"datetime"`
	ServiceTypeID     int64     `bun:"service_type_id" json:"service_type_id"`
}

type EventClient struct {
	bun.BaseModel `bun:"table:event_client,alias:ec"`

	ID          int64 `bun:"id,pk,autoincrement" json:"id"`
	EventID     int64 `bun:"event_id" json:"event_id"`
	ClientID    int64 `bun:"client_id" json:"client_id"`
	VolunteerID int64 `bun:"volunteer_id" json:"volunteer_id"`

	Event     *Event     `bun:"rel:belongs_to,join:event_id=id"`
	Client    *Client    `bun:"rel:belongs_to,join:client_id=id"`
	Volunteer *Volunteer `bun:"rel:belongs_to,join:volunteer_id=id"`
}

type Client struct {
	bun.BaseModel `bun:"table:client,alias:c"`

	ID         int64     `bun:"id,pk,autoincrement" json:"id"`
	FirstName  string    `bun:"first_name" json:"first_name"`
	LastName   string    `bun:"last_name" json:"last_name"`
	PhotoName  string    `bun:"photo_name" json:"photo_name"`
	BirthDate  time.Time `bun:"birth_date" json:"birth_date"`
	Gender     int64     `bun:"gender" json:"gender"`
	MiddleName string    `bun:"middle_name" json:"middle_name"`
}

type Volunteer struct {
	bun.BaseModel `bun:"table:volunteer,alias:v"`

	ID               int64  `bun:"id,pk,autoincrement" json:"id"`
	FirstName        string `bun:"first_name" json:"first_name"`
	LastName         string `bun:"last_name" json:"last_name"`
	VolunteerTG      int64  `bun:"volunteer_tg" json:"volunteer_tg"`
	VolunteerTgLogin string `bun:"volunteer_tg_login" json:"volunteer_tg_login"`
	MiddleName       string `bun:"middle_name" json:"middle_name"`
}

type Participant struct {
	ID               int64     `json:"id" validate:"required,min=1"`
	PhotoName        string    `json:"photo_name" validate:"omitempty"`
	BirthDate        time.Time `json:"birth_date" validate:"omitempty,datetime=2006-01-02T15:04:05Z"`
	Gender           int64     `json:"gender" validate:"omitempty"`
	FirstName        string    `json:"first_name" validate:"required,min=1"`
	MiddleName       string    `json:"middle_name" validate:"required,min=1"`
	LastName         string    `json:"last_name" validate:"required,min=1"`
	VolunteerTG      int64     `json:"volunteer_tg" validate:"omitempty"`
	VolunteerTgLogin string    `json:"volunteer_tg_login" validate:"omitempty"`
}
