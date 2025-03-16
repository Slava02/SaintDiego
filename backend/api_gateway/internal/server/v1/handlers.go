package v1

import (
	"context"
	"fmt"

	"github.com/Slava02/SaintDiego/internal/models"
	"github.com/Slava02/SaintDiego/internal/types"
)

type IScheduleUseCase interface {
	CreateTimeSlot(ctx context.Context, req *models.CreateTimeSlotRequest) (*models.TimeSlot, error)
	GetTimeSlots(ctx context.Context, req *models.GetTimeSlotsRequest) ([]*models.TimeSlot, error)
	GetTimeSlot(ctx context.Context, req types.TimeSlotID) (*models.TimeSlot, error)
	DeleteTimeSlot(ctx context.Context, req types.TimeSlotID) error
	ActivateTimeSlot(ctx context.Context, req types.TimeSlotID) error
	ArchiveTimeSlot(ctx context.Context, req types.TimeSlotID) error
	UpdateTimeSlot(ctx context.Context, req *models.TimeSlot) (*models.TimeSlot, error)
	GetServices(ctx context.Context) ([]*models.Service, error)
	GetLocations(ctx context.Context) ([]*models.Location, error)
	CreateLocation(ctx context.Context, req *models.CreateLocationRequest) (*models.Location, error)
}

//go:generate options-gen -out-filename=handlers_options.gen.go -from-struct=Options
type Options struct {
	scheduleUseCase IScheduleUseCase `option:"mandatory" validate:"required"`
}

type Handlers struct {
	Options
}

func NewHandlers(opts Options) (Handlers, error) {
	if err := opts.Validate(); err != nil {
		return Handlers{}, fmt.Errorf("validate options: %v", err)
	}

	return Handlers{Options: opts}, nil
}
