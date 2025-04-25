package locations

import (
	"context"
	"errors"
	"fmt"

	"github.com/Slava02/SaintDiego/backend/schedule/internal/models"
	locationsRepo "github.com/Slava02/SaintDiego/backend/schedule/internal/repositories/locations_repo"
)

type ILocationRepository interface {
	GetLocations(ctx context.Context) ([]*models.Location, error)
	CreateLocation(ctx context.Context, req *models.Location) (*models.Location, error)
	UpdateLocation(ctx context.Context, id int64, name, address string) (*models.Location, error)
	DeleteLocation(ctx context.Context, id int64) error
	GetLocationById(ctx context.Context, id int64) (*models.Location, error)
}

var (
	ErrLocationNotFound = errors.New("location not found")
)

//go:generate options-gen -out-filename=usecase_options.gen.go -from-struct=Options
type Options struct {
	LocationRepository ILocationRepository `option:"mandatory" validate:"required"`
}

type UseCase struct {
	locationRepository ILocationRepository
}

func New(opts Options) (*UseCase, error) {
	if err := opts.Validate(); err != nil {
		return nil, fmt.Errorf("validate options: %w", err)
	}

	return &UseCase{
		locationRepository: opts.LocationRepository,
	}, nil
}

func (u UseCase) GetLocations(ctx context.Context) ([]*models.Location, error) {
	locations, err := u.locationRepository.GetLocations(ctx)
	if err != nil {
		if errors.Is(err, locationsRepo.ErrLocationNotFound) {
			return nil, fmt.Errorf("get locations: %w", err)
		}
		return nil, fmt.Errorf("get locations: %w", err)
	}

	return locations, nil
}

func (u UseCase) CreateLocation(ctx context.Context, req *CreateLocationRequest) (*models.Location, error) {
	location, err := u.locationRepository.CreateLocation(ctx, &models.Location{
		Name:    req.Name,
		Address: req.Address,
	})
	if err != nil {
		return nil, fmt.Errorf("create location: %w", err)
	}

	return location, nil
}

func (u UseCase) UpdateLocation(ctx context.Context, req *UpdateLocationRequest) (*models.Location, error) {
	_, err := u.GetLocationById(ctx, req.ID)
	if err != nil {
		return nil, fmt.Errorf("get location: %w", err)
	}

	location, err := u.locationRepository.UpdateLocation(ctx, req.ID, req.Name, req.Address)
	if err != nil {
		return nil, fmt.Errorf("update location: %w", err)
	}

	return location, nil
}

func (u UseCase) DeleteLocation(ctx context.Context, id int64) error {
	_, err := u.GetLocationById(ctx, id)
	if err != nil {
		return fmt.Errorf("get location: %w", err)
	}

	return u.locationRepository.DeleteLocation(ctx, id)
}

func (u UseCase) GetLocationById(ctx context.Context, id int64) (*models.Location, error) {
	location, err := u.locationRepository.GetLocationById(ctx, id)
	if err != nil {
		if errors.Is(err, locationsRepo.ErrLocationNotFound) {
			return nil, fmt.Errorf("get location: %w", ErrLocationNotFound)
		}
		return nil, fmt.Errorf("get location: %w", err)
	}

	return location, nil
}
