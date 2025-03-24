package locations

import (
	"context"
	"fmt"
	"math/rand"

	"github.com/Slava02/SaintDiego/backend/events/internal/models"
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
		return nil, fmt.Errorf("validate options: %v", err)
	}

	return &UseCase{
		locationRepository: opts.LocationRepository,
	}, nil
}

type ILocationRepository interface {
	GetLocations(ctx context.Context) ([]*models.Location, error)
	CreateLocation(ctx context.Context, req *models.Location) (*models.Location, error)
}

func (u UseCase) GetLocations(ctx context.Context) ([]*models.Location, error) {
	return u.locationRepository.GetLocations(ctx)
}

func (u UseCase) CreateLocation(ctx context.Context, req *CreateLocationRequest) (*models.Location, error) {
	id := rand.Int63() // Generate a random number for location ID

	return u.locationRepository.CreateLocation(ctx, &models.Location{
		ID:      id,
		Name:    req.Name,
		Address: req.Address,
	})
}
