package events

import (
	"context"
	"errors"
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
	DeleteParticipantFromEvent(ctx context.Context, eventID, participantID int64) error
	GetClientsIdEvents(ctx context.Context, clientID int64, page int64, perPage int64) ([]*models.Event, int64, error)
	GetClient(ctx context.Context, clientID int64) (*models.Client, error)
	// TODO: вынести в timeslot service
	GetTimeSlotWithParticipantCount(ctx context.Context, timeSlotServiceID int64) (*models.TimeSlotWithParticipantCount, error)
}

var (
	ErrEventNotFound  = errors.New("event not found")
	ErrClientNotFound = errors.New("client not found")
	ErrEventIsFull    = errors.New("event is full")
	ErrTimeSlotIsFull = errors.New("time slot is full")
)

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

	if params.ParticipantID != nil {
		_, err := u.eventRepository.GetClient(ctx, *params.ParticipantID)
		if err != nil {
			return nil, 0, fmt.Errorf("get client: %w", err)
		}
	}

	events, total, err := u.eventRepository.GetEvents(ctx, getEventsParams)
	if err != nil {
		switch {
		case errors.Is(err, events_repo.ErrClientNotFound):
			return nil, 0, fmt.Errorf("get events: %w", ErrClientNotFound)
		default:
			return nil, 0, fmt.Errorf("get events: %w", err)
		}
	}

	return events, total, nil
}

func (u *UseCase) GetEvent(ctx context.Context, id int64) (*models.Event, error) {
	event, err := u.eventRepository.GetEvent(ctx, id)
	if err != nil {
		if errors.Is(err, events_repo.ErrEventNotFound) {
			return nil, fmt.Errorf("%w", ErrEventNotFound)
		}
		return nil, fmt.Errorf("get event: %w", err)
	}

	return event, nil
}

func (u *UseCase) UpdateEvent(ctx context.Context, req *UpdateEventRequest) (*models.Event, error) {
	event, err := u.eventRepository.UpdateEvent(ctx, req.ID, req.Capacity, req.Datetime)
	if err != nil {
		if errors.Is(err, events_repo.ErrEventNotFound) {
			return nil, fmt.Errorf("%w", ErrEventNotFound)
		}
		return nil, fmt.Errorf("update event: %w", err)
	}

	return event, nil
}

func (u *UseCase) DeleteEvent(ctx context.Context, id int64) error {
	_, err := u.GetEvent(ctx, id)
	if err != nil {
		return fmt.Errorf("get event: %w", err)
	}

	err = u.eventRepository.DeleteEvent(ctx, id)
	if err != nil {
		if errors.Is(err, events_repo.ErrEventNotFound) {
			return fmt.Errorf("%w", ErrEventNotFound)
		}
		return fmt.Errorf("delete event: %w", err)
	}

	return nil
}

// TODO: по-хорошему, еще бы проверит наличие волонтера и вынести вообще всю логику клиента как-будто у нас другая бд
func (u *UseCase) AddParticipantToEvent(ctx context.Context, params *AddParticipantToEventRequest) error {
	event, err := u.GetEvent(ctx, params.EventID)
	if err != nil {
		return fmt.Errorf("get event: %w", err)
	}

	if event.ParticipantsCount >= event.Capacity {
		return fmt.Errorf("%w", ErrEventIsFull)
	}

	timeSlotID, err := u.eventRepository.GetTimeSlotIDByEventID(ctx, event.ID)
	if err != nil {
		if errors.Is(err, events_repo.ErrEventNotFound) {
			return fmt.Errorf("%w", ErrEventNotFound)
		}
		return fmt.Errorf("get time slot id: %v", err)
	}

	timeSlot, err := u.eventRepository.GetTimeSlotWithParticipantCount(ctx, timeSlotID)
	if err != nil {
		return fmt.Errorf("get time slot: %v", err)
	}

	if timeSlot.ParticipantCount >= timeSlot.Capacity {
		return fmt.Errorf("%w", ErrTimeSlotIsFull)
	}

	err = u.eventRepository.AddParticipantToEvent(ctx, params.EventID, params.ParticipantID, params.VolunteerID)
	if err != nil {
		if errors.Is(err, events_repo.ErrClientNotFound) {
			return fmt.Errorf("%w", ErrClientNotFound)
		}
		return fmt.Errorf("add participant to event: %v", err)
	}

	return nil
}

func (u *UseCase) GetParticipantsByEventId(ctx context.Context, params *GetEventsIdParticipantsParams) ([]*models.Participant, int64, error) {
	_, err := u.GetEvent(ctx, params.EventID)
	if err != nil {
		return nil, 0, fmt.Errorf("get event: %w", err)
	}

	participants, total, err := u.eventRepository.GetParticipantsByEventId(ctx, params.EventID, params.Page, params.PerPage)
	if err != nil {
		switch {
		case errors.Is(err, events_repo.ErrEventNotFound):
			return nil, 0, fmt.Errorf("%w", ErrEventNotFound)
		default:
			return nil, 0, fmt.Errorf("get participants: %v", err)
		}
	}

	return participants, total, nil
}

// TODO: тут надо проверять существование сервиса
func (u *UseCase) GetEventsByServiceId(ctx context.Context, params *GetEventsByServiceIdParams) ([]*models.Event, int64, error) {
	events, total, err := u.eventRepository.GetEventsByServiceId(ctx, params.ServiceID, params.Page, params.PerPage)
	if err != nil {
		return nil, 0, fmt.Errorf("get events: %v", err)
	}

	return events, total, nil
}

func (u *UseCase) DeleteParticipantFromEvent(ctx context.Context, params *DeleteParticipantFromEventRequest) error {
	_, err := u.GetEvent(ctx, params.EventID)
	if err != nil {
		return fmt.Errorf("get event: %w", err)
	}

	_, err = u.eventRepository.GetClient(ctx, params.ParticipantID)
	if err != nil {
		return fmt.Errorf("get client: %w", err)
	}

	err = u.eventRepository.DeleteParticipantFromEvent(ctx, params.EventID, params.ParticipantID)
	if err != nil {
		if errors.Is(err, events_repo.ErrEventNotFound) {
			return fmt.Errorf("%w", ErrEventNotFound)
		}
		return fmt.Errorf("delete participant from event: %v", err)
	}

	return nil
}

// TODO: везде где getClient, надо обращаться в сервис клиентов, а не в бд
func (u *UseCase) GetClientsIdEvents(ctx context.Context, params *GetClientsIdEventsParams) ([]*models.Event, int64, error) {
	_, err := u.eventRepository.GetClient(ctx, params.ID)
	if err != nil {
		return nil, 0, fmt.Errorf("get client: %w", err)
	}

	events, total, err := u.eventRepository.GetClientsIdEvents(ctx, params.ID, params.Page, params.PerPage)
	if err != nil {
		if errors.Is(err, events_repo.ErrClientNotFound) {
			return nil, 0, fmt.Errorf("%w", ErrClientNotFound)
		}
		return nil, 0, fmt.Errorf("get clients id events: %v", err)
	}

	return events, total, nil
}
