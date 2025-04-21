package events

import (
	"context"
	"fmt"
	"time"

	"github.com/Slava02/SaintDiego/backend/events/internal/models"
	"github.com/Slava02/SaintDiego/backend/events/internal/repositories/events_repo"
)

type IEventRepository interface {
	GetEvents(ctx context.Context, params *events_repo.GetEventsParams) ([]*models.Event, int64, error)
	GetEvent(ctx context.Context, id int64) (*models.Event, error)
	UpdateEvent(ctx context.Context, id int64, capacity int32, datetime time.Time) (*models.Event, error)
	DeleteEvent(ctx context.Context, id int64) error
	AddParticipantToEvent(ctx context.Context, eventID, participantID, volunteerID int64) error
	GetEventsByServiceId(ctx context.Context, serviceID int64, page int64, perPage int64) ([]*models.Event, int64, error)
	GetParticipantsByEventId(ctx context.Context, eventID int64, page int64, perPage int64) ([]*models.Participant, int64, error)
	GetTimeSlotIDByEventID(ctx context.Context, eventID int64) (int64, error)
	// TODO: вынести в timeslot service
	GetTimeSlotWithParticipantCount(ctx context.Context, timeSlotServiceID int64) (*models.TimeSlotWithParticipantCount, error)
}

//go:generate options-gen -out-filename=events_options.gen.go -from-struct=Options
type Options struct {
	EventRepository IEventRepository `option:"mandatory" validate:"required"`
}

type UseCase struct {
	eventRepository IEventRepository
}

func New(opts Options) (*UseCase, error) {
	if err := opts.Validate(); err != nil {
		return nil, fmt.Errorf("validate options: %v", err)
	}

	return &UseCase{
		eventRepository: opts.EventRepository,
	}, nil
}

func (u *UseCase) GetEvents(ctx context.Context, params *GetEventsParams) ([]*models.Event, int64, error) {
	getEventsParams := &events_repo.GetEventsParams{
		ParticipantID: params.ParticipantID,
		LocationID:    params.LocationID,
		ServiceID:     params.ServiceID,
		FromDate:      params.FromDate,
		ToDate:        params.ToDate,
	}

	if params.Status != nil {
		if *params.Status == "upcoming" {
			getEventsParams.Upcoming = true
		} else if *params.Status == "past" {
			getEventsParams.Past = true
		} else {
			return nil, 0, fmt.Errorf("invalid status: %s", *params.Status)
		}
	}

	return u.eventRepository.GetEvents(ctx, getEventsParams)
}

func (u *UseCase) GetEvent(ctx context.Context, id int64) (*models.Event, error) {
	return u.eventRepository.GetEvent(ctx, id)
}

func (u *UseCase) UpdateEvent(ctx context.Context, req *UpdateEventRequest) (*models.Event, error) {
	return u.eventRepository.UpdateEvent(ctx, req.ID, req.Capacity, req.Datetime)
}

func (u *UseCase) DeleteEvent(ctx context.Context, id int64) error {
	return u.eventRepository.DeleteEvent(ctx, id)
}

func (u *UseCase) AddParticipantToEvent(ctx context.Context, params *AddParticipantToEventRequest) error {
	event, err := u.eventRepository.GetEvent(ctx, params.EventID)
	if err != nil {
		return fmt.Errorf("get event: %v", err)
	}

	if event.ParticipantsCount >= event.Capacity {
		return fmt.Errorf("event is full")
	}

	timeSlotID, err := u.eventRepository.GetTimeSlotIDByEventID(ctx, event.ID)
	if err != nil {
		return fmt.Errorf("get time slot id: %v", err)
	}

	timeSlot, err := u.eventRepository.GetTimeSlotWithParticipantCount(ctx, timeSlotID)
	if err != nil {
		return fmt.Errorf("get time slot: %v", err)
	}

	if timeSlot.ParticipantCount >= timeSlot.Capacity {
		return fmt.Errorf("time slot is full")
	}

	return u.eventRepository.AddParticipantToEvent(ctx, params.EventID, params.ParticipantID, params.VolunteerID)
}

func (u *UseCase) GetParticipantsByEventId(ctx context.Context, params *GetEventsIdParticipantsParams) ([]*models.Participant, int64, error) {
	return u.eventRepository.GetParticipantsByEventId(ctx, params.EventID, params.Page, params.PerPage)
}

func (u *UseCase) GetEventsByServiceId(ctx context.Context, params *GetEventsByServiceIdParams) ([]*models.Event, int64, error) {
	return u.eventRepository.GetEventsByServiceId(ctx, params.ServiceID, params.Page, params.PerPage)
}
