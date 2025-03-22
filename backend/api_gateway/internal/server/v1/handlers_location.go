package v1

import (
	"context"
	"github.com/labstack/echo/v4"
	"net/http"

	"github.com/Slava02/SaintDiego/backend/api_gateway/internal/models"
	locations "github.com/Slava02/SaintDiego/backend/api_gateway/internal/usecases/locations"
)

type ILocationsUC interface {
	GetLocations(ctx context.Context) ([]*models.Location, error)
	CreateLocation(ctx context.Context, req *locations.CreateLocationRequest) (*models.Location, error)
}

func (h Handlers) GetLocations(ctx echo.Context) error {
	locations, err := h.locationsUC.GetLocations(ctx.Request().Context())
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}

	return ctx.JSON(http.StatusOK, locations)
}

func (h Handlers) PostLocations(ctx echo.Context) error {
	var req locations.CreateLocationRequest
	if err := ctx.Bind(&req); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}

	location, err := h.locationsUC.CreateLocation(ctx.Request().Context(), &req)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}

	return ctx.JSON(http.StatusCreated, location)
}
