package events

import (
	"context"
	"fmt"

	"github.com/Slava02/SaintDiego/backend/api_gateway/internal/models"
	"github.com/Slava02/SaintDiego/backend/events/pkg/pb"
)

type IEventsClient interface {
	GetEvents(ctx context.Context, req *pb.GetEventsRequest) (*pb.GetEventsResponse, error)
	GetEventById(ctx context.Context, req *pb.) (*pb.GetEventByIdResponse, error)
	UpdateEvent(ctx context.Context, req *pb.UpdateEventRequest) (*pb.UpdateEventResponse, error)
	DeleteEvent(ctx context.Context, req *pb.DeleteEventRequest) (*pb.DeleteEventResponse, error)
}

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

func (u *UseCase) GetEvents(ctx context.Context, req *GetEventsParams) ([]*models.Event, error) {
	return u.eventsClient.GetEvents(ctx, req)
}

func (u *UseCase) GetEvent(ctx context.Context, id int64) (*models.Event, error) {
	return u.eventsClient.GetEvent(ctx, id)
}

func (u *UseCase) UpdateEvent(ctx context.Context, req *UpdateEventRequest) (*models.Event, error) {
	return u.eventsClient.UpdateEvent(ctx, req)
}

func (u *UseCase) DeleteEvent(ctx context.Context, id int64) (*models.Event, error) {
	return u.eventsClient.DeleteEvent(ctx, id)
}
