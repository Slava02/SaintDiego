package models

import "time"

// Event represents an event that occurred in a time slot.
type Event struct {
	ID                int64     `json:"id" validate:"omitempty"`
	TimeSlotServiceID int64     `json:"timeSlotServiceId" validate:"required"`
	Capacity          int32     `json:"capacity" validate:"required,min=1"`
	Datetime          time.Time `json:"datetime" validate:"required"`
	ServiceTypeID     int64     `json:"serviceTypeId" validate:"required"`
}
