package locations

import (
	"context"
	"fmt"

	"github.com/Slava02/SaintDiego/backend/schedule/internal/models"
)

type ILocationRepository interface {
	GetLocations(ctx context.Context) ([]*models.Location, error)
	CreateLocation(ctx context.Context, req *models.Location) (*models.Location, error)
	UpdateLocation(ctx context.Context, id int64, name, address string) (*models.Location, error)
	DeleteLocation(ctx context.Context, id int64) error
}

//go:generate options-gen -out-filename=usecase_options.gen.go -from-struct=Options
type Options struct {
	LocationRepository ILocationRepository `option:"mandatory" validate:"required"`
}

type UseCase struct {
	locationRepository ILocationRepository
}

func New(opts Options) (*UseCase, error) {
	if err := opts.Validate(); err != nil {
		return nil, fmt.Errorf("validate options: %v", err)
	}

	return &UseCase{
		locationRepository: opts.LocationRepository,
	}, nil
}

func (u UseCase) GetLocations(ctx context.Context) ([]*models.Location, error) {
	return u.locationRepository.GetLocations(ctx)
}

func (u UseCase) CreateLocation(ctx context.Context, req *CreateLocationRequest) (*models.Location, error) {
	return u.locationRepository.CreateLocation(ctx, &models.Location{
		Name:    req.Name,
		Address: req.Address,
	})
}

func (u UseCase) UpdateLocation(ctx context.Context, req *UpdateLocationRequest) (*models.Location, error) {
	return u.locationRepository.UpdateLocation(ctx, req.ID, req.Name, req.Address)
}

func (u UseCase) DeleteLocation(ctx context.Context, id int64) error {
	return u.locationRepository.DeleteLocation(ctx, id)
}
