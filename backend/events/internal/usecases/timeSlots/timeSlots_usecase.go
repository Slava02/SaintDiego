package timeSlots

import (
	"context"
	"fmt"
	"time"

	"github.com/Slava02/SaintDiego/backend/events/internal/models"
)

type ITimeSlotsRepository interface {
	CreateTimeSlot(ctx context.Context, req *models.TimeSlot) (*models.TimeSlot, error)
	GetTimeSlots(ctx context.Context, status string, startDate, endDate time.Time) ([]*models.TimeSlot, error)
	GetTimeSlot(ctx context.Context, id int64) (*models.TimeSlot, error)
	DeleteTimeSlot(ctx context.Context, id int64) error
	ActivateTimeSlot(ctx context.Context, id int64) error
	ArchiveTimeSlot(ctx context.Context, id int64) error
	UpdateTimeSlot(ctx context.Context, req *models.TimeSlot) (*models.TimeSlot, error)
	CreateEvents(ctx context.Context, events []*models.Event) error
}

type Transactor interface {
	WithinTransaction(ctx context.Context, tFunc func(ctx context.Context) error) error
}

//go:generate options-gen -out-filename=usecase_options.gen.go -from-struct=Options
type Options struct {
	TimeSlotsRepository ITimeSlotsRepository `option:"mandatory" validate:"required"`
	Transactor          Transactor           `option:"mandatory" validate:"required"`
}

type UseCase struct {
	timeSlotsRepository ITimeSlotsRepository
	transactor          Transactor
}

func New(opts Options) (*UseCase, error) {
	if err := opts.Validate(); err != nil {
		return nil, fmt.Errorf("validate options: %v", err)
	}

	return &UseCase{
		timeSlotsRepository: opts.TimeSlotsRepository,
		transactor:          opts.Transactor,
	}, nil
}

func (u UseCase) CreateTimeSlot(ctx context.Context, req *CreateTimeSlotReq) (*models.TimeSlot, error) {
	timeSlot := &models.TimeSlot{
		Title:      req.Title,
		Type:       req.Type,
		LocationID: req.LocationID,
		Capacity:   req.Capacity,
		StartDate:  req.StartDate,
		EndDate:    req.EndDate,
		Status:     "active",
		Services:   req.Services,
		Recurrence: req.Recurrence,
	}

	err := u.transactor.WithinTransaction(ctx, func(ctx context.Context) error {
		timeSlot, err := u.timeSlotsRepository.CreateTimeSlot(ctx, timeSlot)
		if err != nil {
			return fmt.Errorf("create time slot: %v", err)
		}

		events, err := generateEvents(timeSlot)
		if err != nil {
			return fmt.Errorf("generate events: %v", err)
		}

		if len(events) == 0 {
			return fmt.Errorf("no events to create")
		}

		err = u.timeSlotsRepository.CreateEvents(ctx, events)
		if err != nil {
			return fmt.Errorf("create events: %v", err)
		}

		return nil
	})

	if err != nil {
		return nil, fmt.Errorf("create time slot: %v", err)
	}

	return timeSlot, nil
}

func (u UseCase) GetTimeSlots(ctx context.Context, req *GetTimeSlotsReq) ([]*models.TimeSlot, error) {
	return u.timeSlotsRepository.GetTimeSlots(ctx, req.Status, req.StartDate, req.EndDate)
}

func (u UseCase) GetTimeSlot(ctx context.Context, id int64) (*models.TimeSlot, error) {
	return u.timeSlotsRepository.GetTimeSlot(ctx, id)
}

func (u UseCase) DeleteTimeSlot(ctx context.Context, id int64) error {
	if err := u.timeSlotsRepository.DeleteTimeSlot(ctx, id); err != nil {
		return fmt.Errorf("delete time slot: %v", err)
	}

	return nil
}

func (u UseCase) ActivateTimeSlot(ctx context.Context, id int64) error {
	return u.timeSlotsRepository.ActivateTimeSlot(ctx, id)
}

func (u UseCase) ArchiveTimeSlot(ctx context.Context, id int64) error {
	return u.timeSlotsRepository.ArchiveTimeSlot(ctx, id)
}

func (u UseCase) UpdateTimeSlot(ctx context.Context, req *models.TimeSlot) (*models.TimeSlot, error) {

	_, err := u.timeSlotsRepository.GetTimeSlot(ctx, req.ID)
	if err != nil {
		return nil, fmt.Errorf("get time slot: %v", err)
	}

	return u.timeSlotsRepository.UpdateTimeSlot(ctx, req)
}

func generateEvents(timeSlot *models.TimeSlot) ([]*models.Event, error) {
	var events []*models.Event

	// If no services, no events needed
	if len(timeSlot.Services) == 0 {
		return events, nil
	}

	// For single events, create one event per service
	if timeSlot.Type == "single" {
		for _, service := range timeSlot.Services {
			event := &models.Event{
				TimeSlotServiceID: service.ID,
				Capacity:          service.Capacity,
				DateTime:          timeSlot.StartDate,
			}
			events = append(events, event)
		}
		return events, nil
	}

	// For recurring events
	if timeSlot.Recurrence == nil {
		return nil, fmt.Errorf("recurrence settings required for recurring time slots")
	}

	// Calculate end date for recurring events
	endDate := timeSlot.EndDate
	if timeSlot.Recurrence.EndType == "date" {
		endDate = timeSlot.Recurrence.EndValue
	} else if timeSlot.Recurrence.EndType == "never" {
		// For never-ending events, create events for next 10 years
		endDate = time.Now().AddDate(10, 0, 0)
	}

	// Generate events based on recurrence settings
	currentDate := timeSlot.StartDate
	for currentDate.Before(endDate) {
		for _, service := range timeSlot.Services {
			event := &models.Event{
				TimeSlotServiceID: service.ID,
				Capacity:          service.Capacity,
				DateTime:          currentDate,
			}
			events = append(events, event)
		}

		// Calculate next occurrence based on frequency and interval
		switch timeSlot.Recurrence.Frequency {
		case "daily":
			currentDate = currentDate.AddDate(0, 0, int(timeSlot.Recurrence.Interval))
		case "weekly":
			currentDate = currentDate.AddDate(0, 0, int(timeSlot.Recurrence.Interval)*7)
		case "monthly":
			currentDate = currentDate.AddDate(0, int(timeSlot.Recurrence.Interval), 0)
		default:
			return nil, fmt.Errorf("unsupported recurrence frequency: %s", timeSlot.Recurrence.Frequency)
		}
	}

	return events, nil
}
