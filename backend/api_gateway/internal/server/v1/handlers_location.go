package v1

import (
	"context"

	"github.com/labstack/echo/v4"

	"github.com/Slava02/SaintDiego/internal/models"
	locations "github.com/Slava02/SaintDiego/internal/usecases/locations"
)

type ILocationsUC interface {
	GetLocations(ctx context.Context) ([]*models.Location, error)
	CreateLocation(ctx context.Context, req *locations.CreateLocationRequest) (*models.Location, error)
}

func (h Handlers) GetLocations(ctx echo.Context) error {
	// TODO implement me
	panic("implement me")
}

func (h Handlers) PostLocations(ctx echo.Context) error {
	// TODO implement me
	panic("implement me")
}
