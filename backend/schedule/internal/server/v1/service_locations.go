package v1

import (
	"context"
	"errors"

	"github.com/Slava02/SaintDiego/backend/schedule/internal/models"
	"github.com/Slava02/SaintDiego/backend/schedule/internal/usecases/locations"
	"github.com/Slava02/SaintDiego/backend/schedule/pkg/pb"
	"github.com/opentracing/opentracing-go"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
)

type ILocationsUC interface {
	GetLocations(ctx context.Context) ([]*models.Location, error)
	CreateLocation(ctx context.Context, req *locations.CreateLocationRequest) (*models.Location, error)
	UpdateLocation(ctx context.Context, req *locations.UpdateLocationRequest) (*models.Location, error)
	DeleteLocation(ctx context.Context, id int64) error
}

func (i *Implementation) GetLocations(ctx context.Context, _ *pb.GetLocationsRequest) (*pb.GetLocationsResponse, error) {
	span, ctx := opentracing.StartSpanFromContext(ctx, "GetLocations")
	defer span.Finish()

	locations, err := i.locationsUC.GetLocations(ctx)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to get locations: %v", err)
	}

	pbLocations := make([]*pb.Location, len(locations))
	for i, location := range locations {
		pbLocations[i] = &pb.Location{
			Id:      location.ID,
			Name:    location.Name,
			Address: location.Address,
		}
	}

	return &pb.GetLocationsResponse{
		Locations: pbLocations,
	}, nil
}

func (i *Implementation) CreateLocation(ctx context.Context, req *pb.CreateLocationRequest) (*pb.Location, error) {
	span, ctx := opentracing.StartSpanFromContext(ctx, "CreateLocation")
	defer span.Finish()

	location, err := i.locationsUC.CreateLocation(ctx, &locations.CreateLocationRequest{
		Name:    req.Name,
		Address: req.Address,
	})
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to create location: %v", err)
	}

	return &pb.Location{
		Id:      location.ID,
		Name:    location.Name,
		Address: location.Address,
	}, nil
}

func (i *Implementation) UpdateLocation(ctx context.Context, req *pb.UpdateLocationRequest) (*pb.Location, error) {
	span, ctx := opentracing.StartSpanFromContext(ctx, "UpdateLocation")
	defer span.Finish()

	location, err := i.locationsUC.UpdateLocation(ctx, &locations.UpdateLocationRequest{
		ID:      req.Id,
		Name:    req.Name,
		Address: req.Address,
	})
	if err != nil {
		if errors.Is(err, locations.ErrLocationNotFound) {
			return nil, status.Errorf(codes.NotFound, "location not found")
		}
		return nil, status.Errorf(codes.Internal, "failed to update location: %v", err)
	}

	return &pb.Location{
		Id:      location.ID,
		Name:    location.Name,
		Address: location.Address,
	}, nil
}

func (i *Implementation) DeleteLocation(ctx context.Context, req *pb.DeleteLocationRequest) (*pb.DeleteLocationResponse, error) {
	span, ctx := opentracing.StartSpanFromContext(ctx, "DeleteLocation")
	defer span.Finish()

	err := i.locationsUC.DeleteLocation(ctx, req.Id)
	if err != nil {
		if errors.Is(err, locations.ErrLocationNotFound) {
			return nil, status.Errorf(codes.NotFound, "location not found")
		}
		return nil, status.Errorf(codes.Internal, "failed to delete location: %v", err)
	}

	return &pb.DeleteLocationResponse{}, nil
}
