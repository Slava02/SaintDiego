package timeSlots

import (
	"context"
	"fmt"

	pb "github.com/Slava02/SaintDiego/backend/events/pkg/pb"
	"google.golang.org/grpc"

	"github.com/Slava02/SaintDiego/backend/api_gateway/internal/models"
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
	GetLocations(ctx context.Context, req *pb.GetLocationsRequest, opts ...grpc.CallOption) (*pb.GetLocationsResponse, error)
	CreateLocation(ctx context.Context, req *pb.CreateLocationRequest, opts ...grpc.CallOption) (*pb.Location, error)
}

func (u UseCase) GetLocations(ctx context.Context) ([]*models.Location, error) {
	resp, err := u.eventsClient.GetLocations(ctx, &pb.GetLocationsRequest{})
	if err != nil {
		return nil, err
	}

	locations := make([]*models.Location, len(resp.Locations))
	for i, location := range resp.Locations {
		locations[i] = &models.Location{
			ID:      location.Id,
			Name:    location.Name,
			Address: location.Address,
		}
	}
	return locations, nil
}

func (u UseCase) CreateLocation(ctx context.Context, req *CreateLocationRequest) (*models.Location, error) {
	resp, err := u.eventsClient.CreateLocation(ctx, &pb.CreateLocationRequest{
		Name:    req.Name,
		Address: req.Address,
	})
	if err != nil {
		return nil, err
	}

	return &models.Location{
		ID:      resp.Id,
		Name:    resp.Name,
		Address: resp.Address,
	}, nil
}
