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
	LocationID    *int64     `json:"location_id"`
	ServiceID     *int64     `json:"service_id"`
	FromDate      *time.Time `json:"from_date"`
	ToDate        *time.Time `json:"to_date"`
	Page          int64      `json:"page"`
	PerPage       int64      `json:"per_page"`
}

type GetAvailableEventsForClientByServiceIdParams struct {
	ServiceID int64 `json:"service_id"`
	ClientID  int64 `json:"client_id"`
	Page      int64 `json:"page"`
	PerPage   int64 `json:"per_page"`
}

type GetEventsIdParticipantsParams struct {
	EventID int64 `json:"event_id"`
	Page    int64 `json:"page"`
	PerPage int64 `json:"per_page"`
}

type AddParticipantToEventRequest struct {
	EventID       int64 `json:"event_id"`
	ParticipantID int64 `json:"participant_id"`
	VolunteerID   int64 `json:"volunteer_id"`
}

type GetClientsIdEventsParams struct {
	ID      int64 `json:"id"`
	Page    int64 `json:"page"`
	PerPage int64 `json:"per_page"`
}

type DeleteParticipantFromEventRequest struct {
	EventID       int64 `json:"event_id"`
	ParticipantID int64 `json:"participant_id"`
}
