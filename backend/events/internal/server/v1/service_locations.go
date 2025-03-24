package v1

import (
	"context"

	"github.com/Slava02/SaintDiego/backend/events/internal/models"
	"github.com/Slava02/SaintDiego/backend/events/internal/usecases/locations"
	"github.com/Slava02/SaintDiego/backend/events/pkg/pb"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
)

type ILocationsUC interface {
	GetLocations(ctx context.Context) ([]*models.Location, error)
	CreateLocation(ctx context.Context, req *locations.CreateLocationRequest) (*models.Location, error)
}

func (i *Implementation) GetLocations(ctx context.Context, _ *pb.GetLocationsRequest) (*pb.GetLocationsResponse, error) {
	locations, err := i.locationsUC.GetLocations(ctx)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to get locations: %v", err)
	}

	pbLocations := make([]*pb.Location, len(locations))
	for i, location := range locations {
		pbLocations[i] = &pb.Location{
			Id:          location.ID,
			Name:        location.Name,
			Address:     location.Address,
			Description: "", // Not used in the current implementation
		}
	}

	return &pb.GetLocationsResponse{
		Locations: pbLocations,
	}, nil
}

func (i *Implementation) CreateLocation(ctx context.Context, req *pb.CreateLocationRequest) (*pb.Location, error) {
	location, err := i.locationsUC.CreateLocation(ctx, &locations.CreateLocationRequest{
		Name:    req.Name,
		Address: req.Address,
	})
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to create location: %v", err)
	}

	return &pb.Location{
		Id:          location.ID,
		Name:        location.Name,
		Address:     location.Address,
		Description: "", // Not used in the current implementation
	}, nil
}
