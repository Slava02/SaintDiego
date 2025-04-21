package models

import "time"

// Event represents an event that occurred in a time slot.
type Event struct {
	ID                int64     `json:"id" validate:"omitempty"`
	TimeSlotServiceID int64     `json:"timeSlotServiceId" validate:"required"`
	Capacity          int32     `json:"capacity" validate:"required,min=1"`
	Datetime          time.Time `json:"datetime" validate:"required"`
	ServiceTypeID     int64     `json:"serviceTypeId" validate:"required"`
	ParticipantsCount int32     `json:"participantsCount" validate:"required,min=0"`
	ServiceName       string    `json:"serviceName" validate:"required,min=1"`
}

type Participant struct {
	ID                   int64      `json:"id" validate:"required,min=1"`
	PhotoName            *string    `json:"photo_name" validate:"omitempty"`
	BirthDate            *time.Time `json:"birth_date" validate:"omitempty,datetime=2006-01-02T15:04:05Z"`
	Gender               *int64     `json:"gender" validate:"omitempty"`
	FirstName            string     `json:"first_name" validate:"required,min=1"`
	MiddleName           string     `json:"middle_name" validate:"required,min=1"`
	LastName             string     `json:"last_name" validate:"required,min=1"`
	VolunteerTG          int64      `json:"volunteer_tg" validate:"required,min=1"`
	VolunteerTgLogin     string     `json:"volunteer_tg_login" validate:"required,min=1"`
	VolounteerFirstName  string     `json:"volounteer_first_name" validate:"required,min=1"`
	VolounteerMiddleName string     `json:"volounteer_middle_name" validate:"required,min=1"`
	VolounteerLastName   string     `json:"volounteer_last_name" validate:"required,min=1"`
}
