package models

import (
	"time"

	"github.com/Slava02/SaintDiego/internal/types"
	"github.com/Slava02/SaintDiego/proto/events"
)

// Constants for TimeSlot types.
const (
	TimeSlotTypeSingle    = "single"
	TimeSlotTypeRecurring = "recurring"

	TimeSlotStatusActive   = "active"
	TimeSlotStatusArchived = "archived"

	RecurrenceFrequencyDaily  = "daily"
	RecurrenceFrequencyWeekly = "weekly"

	RecurrenceEndTypeNever = "never"
	RecurrenceEndTypeDate  = "date"
)

// TimeSlot represents a time slot with its services and recurrence settings.
type TimeSlot struct {
	ID         types.TimeSlotID  `json:"id" validate:"required"`
	Title      string            `json:"title" validate:"required,max=255"`
	Type       string            `json:"type" validate:"required,oneof=single recurring"`
	LocationID types.LocationID  `json:"locationId" validate:"required"`
	Capacity   int               `json:"capacity" validate:"required,min=1"`
	StartDate  time.Time         `json:"startDate" validate:"required"`
	EndDate    time.Time         `json:"endDate" validate:"required,gtfield=StartDate"`
	Status     string            `json:"status" validate:"required,oneof=active archived"`
	Services   []TimeSlotService `json:"services" validate:"required,dive,min=1"`
	Recurrence *Recurrence       `json:"recurrence,omitempty" validate:"omitempty,required_if=Type recurring"`
}

func TimeSlotFromProto(protoTimeSlot *events.TimeSlot) *TimeSlot {
	return &TimeSlot{
		ID:    types.MustParse[types.TimeSlotID](protoTimeSlot.Id),
		Title: protoTimeSlot.Title,
		Type:  string(protoTimeSlot.Type),
	}
}

// TimeSlotService represents a service available in a time slot.
type TimeSlotService struct {
	ServiceTypeID types.ServiceTypeID `json:"serviceTypeId" validate:"required"`
	Capacity      int                 `json:"capacity" validate:"required,min=1"`
	BookingWindow int                 `json:"bookingWindow" validate:"required,min=1"`
	Time          time.Time           `json:"time" validate:"required"`
}

// Recurrence defines the recurrence pattern for a time slot.
type Recurrence struct {
	Frequency string `json:"frequency" validate:"required,oneof=daily weekly monthly"`
	Interval  int    `json:"interval" validate:"required,min=1"`
	EndType   string `json:"endType" validate:"required,oneof=never date"`
	//nolint:lll // Long line in struct tag is unavoidable
	EndValue *time.Time `json:"endValue,omitempty" validate:"required_if=EndType date,omitempty,gtfield=TimeSlot.StartDate"`
}

// requests.
type CreateTimeSlotRequest struct {
	Title      string            `json:"title" validate:"required,max=255"`
	Type       string            `json:"type" validate:"required,oneof=single recurring"`
	LocationID types.LocationID  `json:"locationId" validate:"required"`
	Capacity   int               `json:"capacity" validate:"required,min=1"`
	StartDate  time.Time         `json:"startDate" validate:"required"`
	EndDate    time.Time         `json:"endDate" validate:"required,gtfield=StartDate"`
	Services   []TimeSlotService `json:"services" validate:"required,dive,min=1"`
	Recurrence *Recurrence       `json:"recurrence,omitempty" validate:"omitempty,required_if=Type recurring"`
}

type GetTimeSlotsRequest struct {
	Status    string    `json:"status" validate:"required,oneof=active archived"`
	StartDate time.Time `json:"startDate" validate:"required"`
	EndDate   time.Time `json:"endDate" validate:"required,gtfield=StartDate"`
}

type DeleteTimeSlotRequest struct {
	ID types.TimeSlotID `json:"id" validate:"required"`
}

type ActivateTimeSlotRequest struct {
	ID types.TimeSlotID `json:"id" validate:"required"`
}

type ArchiveTimeSlotRequest struct {
	ID types.TimeSlotID `json:"id" validate:"required"`
}

type UpdateTimeSlotRequest struct {
	TimeSlot
}

// responses

type GetTimeSlotsResponse struct {
	TimeSlots []TimeSlot `json:"timeSlots" validate:"required,dive"`
}

type CreateTimeSlotResponse struct {
	TimeSlot TimeSlot `json:"timeSlot" validate:"required"`
}
