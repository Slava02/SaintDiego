package events

import "time"

type GetEventsParams struct {
	ParticipantID int64  `query:"participant_id" json:"participant_id" validate:"omitempty,min=1"`
	Status        string `query:"status" json:"status" validate:"omitempty,oneof=upcoming past"`
	Location      string `query:"location" json:"location" validate:"omitempty,min=1"`
	ServiceID     int64  `query:"service_id" json:"service_id" validate:"omitempty,min=1"`
	FromDate      string `query:"from_date" json:"from_date" validate:"omitempty,datetime=2006-01-02"`
	ToDate        string `query:"to_date" json:"to_date" validate:"omitempty,datetime=2006-01-02"`
}

type UpdateEventRequest struct {
	ID       int64     `json:"id" validate:"required,min=1"`
	Capacity int32     `json:"capacity" validate:"required,min=1"`
	Datetime time.Time `json:"datetime" validate:"required,datetime=2006-01-02T15:04:05Z"`
}
