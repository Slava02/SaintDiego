package events_repo

import "time"

type GetEventsParams struct {
	ParticipantID *int64     `json:"participant_id"`
	Status        *string    `json:"status"`
	Location      *int64     `json:"location"`
	ServiceID     *int64     `json:"service_id"`
	FromDate      *time.Time `json:"from_date"`
	ToDate        *time.Time `json:"to_date"`
}
