package timeSlots

import (
	"context"
	"fmt"
	"time"

	"github.com/Slava02/SaintDiego/backend/events/internal/models"
)

//go:generate options-gen -out-filename=usecase_options.gen.go -from-struct=Options
type Options struct {
	TimeSlotsRepository ITimeSlotsRepository `option:"mandatory" validate:"required"`
}

type UseCase struct {
	timeSlotsRepository ITimeSlotsRepository
}

func New(opts Options) (*UseCase, error) {
	if err := opts.Validate(); err != nil {
		return nil, fmt.Errorf("validate options: %v", err)
	}

	return &UseCase{
		timeSlotsRepository: opts.TimeSlotsRepository,
	}, nil
}

type ITimeSlotsRepository interface {
	CreateTimeSlot(ctx context.Context, req *models.TimeSlot) (*models.TimeSlot, error)
	GetTimeSlots(ctx context.Context, status string, startDate, endDate time.Time) ([]*models.TimeSlot, error)
	GetTimeSlot(ctx context.Context, id int64) (*models.TimeSlot, error)
	DeleteTimeSlot(ctx context.Context, id int64) error
	ActivateTimeSlot(ctx context.Context, id int64) error
	ArchiveTimeSlot(ctx context.Context, id int64) error
	UpdateTimeSlot(ctx context.Context, req *models.TimeSlot) (*models.TimeSlot, error)
	CreateTimeSlotService(ctx context.Context, service *models.TimeSlotService) error
	DeleteTimeSlotServices(ctx context.Context, timeSlotID int64) error
	CreateTimeSlotRecurrence(ctx context.Context, recurrence *models.TimeSlotRecurrence) error
	DeleteTimeSlotRecurrence(ctx context.Context, timeSlotID int64) error
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
	}

	timeSlot, err := u.timeSlotsRepository.CreateTimeSlot(ctx, timeSlot)
	if err != nil {
		return nil, fmt.Errorf("create time slot: %v", err)
	}

	if len(req.Services) > 0 {
		for _, service := range req.Services {
			service.TimeSlotID = timeSlot.ID
			if err := u.timeSlotsRepository.CreateTimeSlotService(ctx, &service); err != nil {
				return nil, fmt.Errorf("create time slot service: %v", err)
			}
		}
	}

	if req.Recurrence != nil {
		req.Recurrence.TimeSlotID = timeSlot.ID
		if err := u.timeSlotsRepository.CreateTimeSlotRecurrence(ctx, req.Recurrence); err != nil {
			return nil, fmt.Errorf("create time slot recurrence: %v", err)
		}
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
	if err := u.timeSlotsRepository.DeleteTimeSlotServices(ctx, id); err != nil {
		return fmt.Errorf("delete time slot services: %v", err)
	}

	if err := u.timeSlotsRepository.DeleteTimeSlotRecurrence(ctx, id); err != nil {
		return fmt.Errorf("delete time slot recurrence: %v", err)
	}

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

func (u UseCase) UpdateTimeSlot(ctx context.Context, req *UpdateTimeSlotReq) (*models.TimeSlot, error) {
	return u.timeSlotsRepository.UpdateTimeSlot(ctx, &req.TimeSlot)
}
