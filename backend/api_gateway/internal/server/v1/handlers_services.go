package v1

import (
	"context"
	"net/http"

	"github.com/labstack/echo/v4"

	"github.com/Slava02/SaintDiego/backend/api_gateway/internal/models"
)

type IServicesUC interface {
	GetServices(ctx context.Context) ([]*models.Service, error)
	GetServicesId(ctx context.Context, id int64) (*models.Service, error)
}

func (h Handlers) GetServices(ctx echo.Context) error {
	services, err := h.servicesUC.GetServices(ctx.Request().Context())
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}

	return ctx.JSON(http.StatusOK, services)
}

func (h Handlers) GetServicesId(ctx echo.Context, id int64) error {
	service, err := h.servicesUC.GetServicesId(ctx.Request().Context(), id)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}

	return ctx.JSON(http.StatusOK, service)
}
