package events

import "time"

type GetEventsParams struct {
	Page          int32      `query:"page" json:"page" validate:"omitempty,min=1"`
	PerPage       int32      `query:"per_page" json:"per_page" validate:"omitempty,min=1,max=100"`
	ParticipantID *int64     `query:"participant_id" json:"participant_id" validate:"omitempty,min=1"`
	Status        *string    `query:"status" json:"status" validate:"omitempty,oneof=upcoming past"`
	LocationID    *int64     `query:"location_id" json:"location_id" validate:"omitempty,min=1"`
	ServiceID     *int64     `query:"service_id" json:"service_id" validate:"omitempty,min=1"`
	FromDate      *time.Time `query:"from_date" json:"from_date" validate:"omitempty,datetime=2006-01-02T15:04:05Z|datetime=2006-01-02"`
	ToDate        *time.Time `query:"to_date" json:"to_date" validate:"omitempty,datetime=2006-01-02T15:04:05Z|datetime=2006-01-02"`
}

type UpdateEventRequest struct {
	ID       int64     `json:"id" validate:"required,min=1"`
	Capacity int32     `json:"capacity" validate:"required,min=1"`
	Datetime time.Time `json:"datetime" validate:"required,datetime=2006-01-02T15:04:05Z"`
}

type AddParticipantToEventRequest struct {
	EventID       int64 `json:"event_id" validate:"required,min=1"`
	ParticipantID int64 `json:"participant_id" validate:"required,min=1"`
	VolunteerID   int64 `json:"volunteer_id" validate:"required,min=1"`
}

type GetEventsIdParticipantsParams struct {
	Page    int32 `query:"page" json:"page" validate:"required,min=1"`
	PerPage int32 `query:"per_page" json:"per_page" validate:"required,min=1,max=100"`
	EventID int64 `query:"event_id" json:"event_id" validate:"required,min=1"`
}

type GetEventsServicesIdParams struct {
	Page      int32 `query:"page" json:"page" validate:"required,min=1"`
	PerPage   int32 `query:"per_page" json:"per_page" validate:"required,min=1,max=100"`
	ServiceID int64 `query:"service_id" json:"service_id" validate:"required,min=1"`
}
