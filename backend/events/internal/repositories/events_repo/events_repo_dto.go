package events_repo

import "time"

type GetEventsParams struct {
	ParticipantID *int64     `json:"participant_id,omitempty"`
	LocationID    *int64     `json:"location_id,omitempty"`
	ServiceID     *int64     `json:"service_id,omitempty"`
	FromDate      *time.Time `json:"from_date,omitempty"`
	ToDate        *time.Time `json:"to_date,omitempty"`
	Upcoming      bool       `json:"upcoming,omitempty"`
	Past          bool       `json:"past,omitempty"`
	Page          int32      `json:"page,omitempty"`
	PerPage       int32      `json:"per_page,omitempty"`
}
