package timeSlots

import (
	"context"
	"fmt"
	"slices"
	"time"

	"github.com/Slava02/SaintDiego/backend/schedule/internal/models"
)

//go:generate mockery --name ITimeSlotsRepository --output ./mocks --outpkg mocks --case underscore
type ITimeSlotsRepository interface {
	InsertUpdateTimeSlot(ctx context.Context, req *models.TimeSlot) (*models.TimeSlot, error)
	GetTimeSlots(ctx context.Context, status string, startDate, endDate time.Time) ([]*models.TimeSlot, error)
	GetTimeSlot(ctx context.Context, id int64) (*models.TimeSlot, error)
	DeleteTimeSlot(ctx context.Context, id int64) error
	ActivateTimeSlot(ctx context.Context, id int64) error
	ArchiveTimeSlot(ctx context.Context, id int64) error
	DeleteTimeSlotServicesByIds(ctx context.Context, serviceIds []int64) error
	InsertUpdateEvents(ctx context.Context, events []*models.Event) error
	DeleteTimeSlotRecurrence(ctx context.Context, timeSlotID int64) error
	CreateTimeSlotServices(ctx context.Context, id int64, req []*models.TimeSlotService) ([]*models.TimeSlotService, error)
	DeleteEventsByServiceIds(ctx context.Context, serviceIds []int64) error
	GetEventsByServiceIds(ctx context.Context, serviceIds []int64) ([]*models.Event, error)
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
		timeSlot, err := u.timeSlotsRepository.InsertUpdateTimeSlot(ctx, timeSlot)
		if err != nil {
			return fmt.Errorf("create time slot: %v", err)
		}

		events, err := generateEvents(timeSlot, timeSlot.Services)
		if err != nil {
			return fmt.Errorf("generate events: %v", err)
		}

		err = u.timeSlotsRepository.InsertUpdateEvents(ctx, events)
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
	timeSlot, err := u.timeSlotsRepository.GetTimeSlot(ctx, id)
	if err != nil {
		return fmt.Errorf("get time slot: %v", err)
	}

	if timeSlot.Status == "active" {
		return fmt.Errorf("time slot already active")
	}

	return u.timeSlotsRepository.ActivateTimeSlot(ctx, id)
}

func (u UseCase) ArchiveTimeSlot(ctx context.Context, id int64) error {
	timeSlot, err := u.timeSlotsRepository.GetTimeSlot(ctx, id)
	if err != nil {
		return fmt.Errorf("get time slot: %v", err)
	}

	if timeSlot.Status == "archived" {
		return fmt.Errorf("time slot already archived")
	}

	return u.timeSlotsRepository.ArchiveTimeSlot(ctx, id)
}

func (u UseCase) UpdateTimeSlot(ctx context.Context, req *models.TimeSlot) (*models.TimeSlot, error) {
	var newTimeSlot *models.TimeSlot

	err := u.transactor.WithinTransaction(ctx, func(ctx context.Context) error {
		// Получаем существующий слот
		existingTimeSlot, err := u.timeSlotsRepository.GetTimeSlot(ctx, req.ID)
		if err != nil {
			return fmt.Errorf("get time slot: %v", err)
		}

		// Удаляем удаленные сервисы и события
		removedServices := getRemovedServices(existingTimeSlot, req)

		if len(removedServices) > 0 {
			err = u.timeSlotsRepository.DeleteTimeSlotServicesByIds(ctx, getServiceIds(removedServices))
			if err != nil {
				return fmt.Errorf("delete time slot service: %v", err)
			}

			err = u.timeSlotsRepository.DeleteEventsByServiceIds(ctx, getServiceIds(removedServices))
			if err != nil {
				return fmt.Errorf("delete events: %v", err)
			}
		}

		// Если убрали настройки повторения, то удаляем их и все события
		if req.Recurrence == nil && existingTimeSlot.Recurrence != nil {
			err = u.timeSlotsRepository.DeleteTimeSlotRecurrence(ctx, req.ID)
			if err != nil {
				return fmt.Errorf("delete time slot recurrence: %v", err)
			}

			err = u.timeSlotsRepository.DeleteEventsByServiceIds(ctx, getServiceIds(existingTimeSlot.Services))
			if err != nil {
				return fmt.Errorf("delete events: %v", err)
			}
		}

		// Если добавили настройки повторения, то удаляем все события
		if req.Recurrence != nil && existingTimeSlot.Recurrence == nil {
			err = u.timeSlotsRepository.DeleteEventsByServiceIds(ctx, getServiceIds(existingTimeSlot.Services))
			if err != nil {
				return fmt.Errorf("delete events: %v", err)
			}
		}

		// Добавляем новые сервисы
		newServices := getNewServices(req)

		if len(newServices) > 0 {
			_, err = u.timeSlotsRepository.CreateTimeSlotServices(ctx, req.ID, newServices)
			if err != nil {
				return fmt.Errorf("add service to time slot: %v", err)
			}
		}

		// Если добавили или убрали повторение, то нужно также перегенерировать события
		if recurrenceChanged(existingTimeSlot, req) {
			newServices = append(newServices, req.Services...)
		}

		// Генерируем новые события для добавленных сервисов
		newEvents, err := generateEvents(req, newServices)
		if err != nil {
			return fmt.Errorf("generate events: %v", err)
		}

		// Получаем существующие сервисы
		existingServices := getExistingServices(existingTimeSlot)

		// Получаем существующие события
		existingEvents, err := u.timeSlotsRepository.GetEventsByServiceIds(ctx, getServiceIds(existingServices))
		if err != nil {
			return fmt.Errorf("get events: %v", err)
		}

		// Объединяем существующие и новые события
		events := slices.Concat(existingEvents, newEvents)

		// Сохраняем события
		err = u.timeSlotsRepository.InsertUpdateEvents(ctx, events)
		if err != nil {
			return fmt.Errorf("create events: %v", err)
		}

		// Обновляем слот
		newTimeSlot, err = u.timeSlotsRepository.InsertUpdateTimeSlot(ctx, req)
		if err != nil {
			return fmt.Errorf("update time slot: %v", err)
		}

		return nil
	})

	if err != nil {
		return nil, fmt.Errorf("update time slot: %v", err)
	}

	return newTimeSlot, nil
}

func recurrenceChanged(existingTimeSlot *models.TimeSlot, newTimeSlot *models.TimeSlot) bool {
	return existingTimeSlot.Recurrence != nil && newTimeSlot.Recurrence == nil ||
		existingTimeSlot.Recurrence == nil && newTimeSlot.Recurrence != nil
}

func getServiceIds(services []*models.TimeSlotService) []int64 {
	serviceIds := make([]int64, len(services))
	for i, service := range services {
		serviceIds[i] = service.ID
	}
	return serviceIds
}

func getNewServices(req *models.TimeSlot) []*models.TimeSlotService {
	newServices := make([]*models.TimeSlotService, 0)
	for _, service := range req.Services {
		if service.ID == 0 {
			newServices = append(newServices, service)
		}
	}
	return newServices
}

func getExistingServices(timeSlot *models.TimeSlot) []*models.TimeSlotService {
	existingServices := make([]*models.TimeSlotService, 0)
	for _, service := range timeSlot.Services {
		if service.ID != 0 {
			existingServices = append(existingServices, service)
		}
	}
	return existingServices
}

func getRemovedServices(existingTimeSlot *models.TimeSlot, newTimeSlot *models.TimeSlot) []*models.TimeSlotService {
	removedServices := make([]*models.TimeSlotService, 0)

	newServices := make(map[int64]struct{})
	for _, service := range newTimeSlot.Services {
		newServices[service.ID] = struct{}{}
	}

	for _, service := range existingTimeSlot.Services {
		if _, ok := newServices[service.ID]; !ok {
			removedServices = append(removedServices, service)
		}
	}

	return removedServices
}

func generateEvents(timeSlot *models.TimeSlot, services []*models.TimeSlotService) ([]*models.Event, error) {
	var events []*models.Event

	// If no services, no events needed
	if len(services) == 0 {
		return events, nil
	}

	// For single events, create one event per service
	if timeSlot.Type == "single" {
		for _, service := range services {
			event := &models.Event{
				TimeSlotServiceID: service.ID,
				Capacity:          service.Capacity,
				DateTime:          timeSlot.StartDate,
				ServiceTypeID:     service.ServiceTypeID,
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
	endDate := timeSlot.Recurrence.EndValue
	if timeSlot.Recurrence.EndType == "date" {
		endDate = timeSlot.Recurrence.EndValue
	} else if timeSlot.Recurrence.EndType == "never" {
		// For never-ending events, create events for next 10 years
		endDate = time.Now().AddDate(10, 0, 0)
	}

	// Generate events based on recurrence settings
	currentDate := timeSlot.StartDate
	for currentDate.Before(endDate) {
		for _, service := range services {
			event := &models.Event{
				TimeSlotServiceID: service.ID,
				Capacity:          service.Capacity,
				DateTime:          currentDate,
				ServiceTypeID:     service.ServiceTypeID,
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
