package events

import "time"

type UpdateEventRequest struct {
	ID       int64     `json:"id"`
	Capacity int32     `json:"capacity"`
	Datetime time.Time `json:"datetime"`
}

type GetEventsParams struct {
	ParticipantID *int64     `json:"participant_id"`
	Status        *string    `json:"status"`
	Location      *int64     `json:"location"`
	ServiceID     *int64     `json:"service_id"`
	FromDate      *time.Time `json:"from_date"`
	ToDate        *time.Time `json:"to_date"`
}
