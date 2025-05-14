package locations

import (
	"context"
	"fmt"

	pb "github.com/Slava02/SaintDiego/backend/schedule/pkg/pb"

	"github.com/Slava02/SaintDiego/backend/api_gateway/internal/models"
)

type IEventsClient interface {
	GetLocations(ctx context.Context, req *pb.GetLocationsRequest) (*pb.GetLocationsResponse, error)
	CreateLocation(ctx context.Context, req *pb.CreateLocationRequest) (*pb.Location, error)
	UpdateLocation(ctx context.Context, req *pb.UpdateLocationRequest) (*pb.Location, error)
	DeleteLocation(ctx context.Context, req *pb.DeleteLocationRequest) (*pb.DeleteLocationResponse, error)
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

func (u UseCase) GetLocationById(ctx context.Context, id int64) (*models.Location, error) {
	resp, err := u.eventsClient.GetLocationById(ctx, &pb.GetLocationByIdRequest{Id: id})
	if err != nil {
		return nil, fmt.Errorf("get location by id: %w", err)
	}

	return &models.Location{
		ID:      resp.Location.Id,
		Name:    resp.Location.Name,
		Address: resp.Location.Address,
	}, nil
}

func (u UseCase) GetLocations(ctx context.Context) ([]*models.Location, error) {
	resp, err := u.eventsClient.GetLocations(ctx, &pb.GetLocationsRequest{})
	if err != nil {
		return nil, fmt.Errorf("get locations: %w", err)
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
		return nil, fmt.Errorf("create location: %w", err)
	}

	return &models.Location{
		ID:      resp.Id,
		Name:    resp.Name,
		Address: resp.Address,
	}, nil
}

func (u UseCase) UpdateLocation(ctx context.Context, req *UpdateLocationRequest) (*models.Location, error) {
	resp, err := u.eventsClient.UpdateLocation(ctx, &pb.UpdateLocationRequest{
		Id:      req.ID,
		Name:    req.Name,
		Address: req.Address,
	})
	if err != nil {
		return nil, fmt.Errorf("update location: %w", err)
	}

	return &models.Location{
		ID:      resp.Id,
		Name:    resp.Name,
		Address: resp.Address,
	}, nil
}

func (u UseCase) DeleteLocation(ctx context.Context, id int64) error {
	_, err := u.eventsClient.DeleteLocation(ctx, &pb.DeleteLocationRequest{Id: id})
	if err != nil {
		return fmt.Errorf("delete location: %w", err)
	}

	return nil
}
