package timeSlots

import (
	"context"
	"fmt"

	"github.com/Slava02/SaintDiego/backend/api_gateway/internal/models"
	api "github.com/Slava02/SaintDiego/backend/events/pkg/pb/api"
)

const (
	statusActive   = "active"
	statusArchived = "archived"
)

//go:generate options-gen -out-filename=usecase_options.gen.go -from-struct=Options
type Options struct {
	EventsClient IEventsClient `option:"mandatory" validate:"required"`
}

type UseCase struct {
	eventsClient IEventsClient
}

func New(opts Options) (*UseCase, error) {
	if err := opts.Validate(); err != nil {
		return nil, fmt.Errorf("validate options: %v", err)
	}

	return &UseCase{
		eventsClient: opts.EventsClient,
	}, nil
}

type IEventsClient interface {
	CreateTimeSlot(ctx context.Context, req *api.CreateTimeSlotRequest) (*api.TimeSlot, error)
	GetTimeSlots(ctx context.Context, req *api.GetTimeSlotsRequest) (*api.GetTimeSlotsResponse, error)
	GetTimeSlot(ctx context.Context, req *api.GetTimeSlotRequest) (*api.TimeSlot, error)
	DeleteTimeSlot(ctx context.Context, req *api.DeleteTimeSlotRequest) (*api.DeleteTimeSlotResponse, error)
	ActivateTimeSlot(ctx context.Context, req *api.ActivateTimeSlotRequest) (*api.TimeSlot, error)
	ArchiveTimeSlot(ctx context.Context, req *api.ArchiveTimeSlotRequest) (*api.TimeSlot, error)
	UpdateTimeSlot(ctx context.Context, req *api.UpdateTimeSlotRequest) (*api.TimeSlot, error)
}

func (u UseCase) CreateTimeSlot(ctx context.Context, req *CreateTimeSlotReq) (*models.TimeSlot, error) {
	// TODO implement me
	panic("implement me")
}

func (u UseCase) GetTimeSlots(ctx context.Context, request *GetTimeSlotsReq) ([]*models.TimeSlot, error) {
	// TODO implement me
	panic("implement me")
}

func (u UseCase) GetTimeSlot(ctx context.Context, id int) (*models.TimeSlot, error) {
	// TODO implement me
	panic("implement me")
}

func (u UseCase) DeleteTimeSlot(ctx context.Context, id int) error {
	// TODO implement me
	panic("implement me")
}

func (u UseCase) ActivateTimeSlot(ctx context.Context, id int) error {
	// TODO implement me
	panic("implement me")
}

func (u UseCase) ArchiveTimeSlot(ctx context.Context, id int) error {
	// TODO implement me
	panic("implement me")
}

func (u UseCase) UpdateTimeSlot(ctx context.Context, req *UpdateTimeSlotReq) (*models.TimeSlot, error) {
	// TODO implement me
	panic("implement me")
}
