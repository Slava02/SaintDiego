package v1

import (
	"context"

	"github.com/labstack/echo/v4"

	"github.com/Slava02/SaintDiego/backend/api_gateway/internal/models"
)

type IServicesUC interface {
	GetServices(ctx context.Context) ([]*models.Service, error)
	GetServicesId(ctx context.Context, id int) (*models.Service, error)
}

func (h Handlers) GetServices(ctx echo.Context) error {
	// TODO implement me
	panic("implement me")
}

func (h Handlers) GetServicesId(ctx echo.Context, id int) error {
	// TODO implement me
	panic("implement me")
}
