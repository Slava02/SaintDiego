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
	ParticipantsCount int32     `bun:"participants_count" json:"participants_count"`
	ServiceName       string    `bun:"service_name" json:"service_name"`
	LocationID        int64     `bun:"location_id" json:"location_id"`

	Clients  []*Client `bun:"m2m:event_client,join:Event=Client"`
	Location *Location `bun:"rel:belongs-to,join:location_id=id" json:"location,omitempty"`
}

type EventClient struct {
	bun.BaseModel `bun:"table:event_client,alias:ec"`

	ID          int64 `bun:"id,pk,autoincrement" json:"id"`
	EventID     int64 `bun:"event_id" json:"event_id"`
	ClientID    int64 `bun:"client_id" json:"client_id"`
	VolunteerID int64 `bun:"volunteer_id" json:"volunteer_id"`

	// Relations
	Event     *Event     `bun:"rel:belongs-to,join:event_id=id"`
	Client    *Client    `bun:"rel:belongs-to,join:client_id=id"`
	Volunteer *Volunteer `bun:"rel:belongs-to,join:volunteer_id=tg_id"`
}

type Client struct {
	bun.BaseModel `bun:"table:client,alias:c"`

	ID            int64     `bun:"id,pk,autoincrement" json:"id"`
	FirstName     string    `bun:"firstname" json:"first_name"`
	LastName      string    `bun:"lastname" json:"last_name"`
	PhotoName     string    `bun:"photo_name" json:"photo_name"`
	BirthDate     time.Time `bun:"birth_date" json:"birth_date"`
	Gender        int64     `bun:"gender" json:"gender"`
	MiddleName    string    `bun:"middlename" json:"middle_name"`
	IsBlocked     bool      `bun:"is_blocked" json:"is_blocked"`
	BlockedReason string    `bun:"blocked_reason" json:"blocked_reason"`
	BlockedAt     time.Time `bun:"blocked_at" json:"blocked_at"`

	// Many-to-many relationship with Event through EventClient
	Events []*Event `bun:"m2m:event_client,join:Client=Event"`
}

type Volunteer struct {
	bun.BaseModel `bun:"table:volunteer,alias:v"`

	ID         int64  `bun:"id,pk,autoincrement" json:"id"`
	FirstName  string `bun:"first_name" json:"first_name"`
	LastName   string `bun:"last_name" json:"last_name"`
	TGID       int64  `bun:"tg_id" json:"tg_id"`
	TGLogin    string `bun:"tg_login" json:"tg_login"`
	MiddleName string `bun:"middle_name" json:"middle_name"`
}

type Participant struct {
	ID                   int64     `json:"id" validate:"required,min=1"`
	PhotoName            string    `json:"photo_name" validate:"omitempty"`
	BirthDate            time.Time `json:"birth_date" validate:"omitempty,datetime=2006-01-02T15:04:05Z"`
	Gender               int64     `json:"gender" validate:"omitempty"`
	FirstName            string    `json:"first_name" validate:"required,min=1"`
	MiddleName           string    `json:"middle_name" validate:"required,min=1"`
	LastName             string    `json:"last_name" validate:"required,min=1"`
	VolunteerTG          int64     `json:"volunteer_tg" validate:"omitempty"`
	VolunteerTgLogin     string    `json:"volunteer_tg_login" validate:"omitempty"`
	VolounteerFirstName  string    `json:"volounteer_first_name" validate:"omitempty"`
	VolounteerMiddleName string    `json:"volounteer_middle_name" validate:"omitempty"`
	VolounteerLastName   string    `json:"volounteer_last_name" validate:"omitempty"`
}

type TimeSlotWithParticipantCount struct {
	bun.BaseModel `bun:"table:time_slot,alias:ts"`

	ID               int64 `bun:"id,pk,autoincrement" json:"id"`
	Capacity         int32 `bun:"capacity" json:"capacity" validate:"required,min=1"`
	ParticipantCount int32 `bun:"participant_count" json:"participant_count" validate:"required,min=1"`
}

type Location struct {
	ID      int64  `json:"id" validate:"required,min=1"`
	Name    string `json:"name" validate:"required,min=1"`
	Address string `json:"address" validate:"required,min=1"`
}
