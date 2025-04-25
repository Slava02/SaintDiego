package v1

import (
	"context"
	"net/http"

	"github.com/labstack/echo/v4"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"

	"github.com/Slava02/SaintDiego/backend/api_gateway/internal/models"
	locations "github.com/Slava02/SaintDiego/backend/api_gateway/internal/usecases/locations"
)

type ILocationsUC interface {
	GetLocations(ctx context.Context) ([]*models.Location, error)
	CreateLocation(ctx context.Context, req *locations.CreateLocationRequest) (*models.Location, error)
	UpdateLocation(ctx context.Context, req *locations.UpdateLocationRequest) (*models.Location, error)
	DeleteLocation(ctx context.Context, id int64) error
}

func (h Handlers) GetLocations(ctx echo.Context) error {
	locations, err := h.locationsUC.GetLocations(ctx.Request().Context())
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, Err("Internal server error", err.Error()))
	}

	return ctx.JSON(http.StatusOK, locations)
}

func (h Handlers) PostLocations(ctx echo.Context) error {
	var req locations.CreateLocationRequest
	if err := ctx.Bind(&req); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, Err("Bad request", err.Error()))
	}

	location, err := h.locationsUC.CreateLocation(ctx.Request().Context(), &req)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, Err("Internal server error", err.Error()))
	}

	return ctx.JSON(http.StatusCreated, location)
}

func (h Handlers) PutLocationsId(ctx echo.Context, id int64) error {
	var req locations.UpdateLocationRequest
	if err := ctx.Bind(&req); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, Err("Bad request", err.Error()))
	}

	req.ID = id

	location, err := h.locationsUC.UpdateLocation(ctx.Request().Context(), &req)
	if err != nil {
		if e, ok := status.FromError(err); ok {
			switch e.Code() {
			case codes.NotFound:
				return ctx.JSON(http.StatusNotFound, Err("Location not found", ""))
			default:
				return ctx.JSON(http.StatusInternalServerError, Err("Internal server error", err.Error()))
			}
		}

		return ctx.JSON(http.StatusInternalServerError, Err("Internal server error", err.Error()))
	}

	return ctx.JSON(http.StatusOK, location)
}

func (h Handlers) DeleteLocationsId(ctx echo.Context, id int64) error {
	err := h.locationsUC.DeleteLocation(ctx.Request().Context(), id)
	if err != nil {
		if e, ok := status.FromError(err); ok {
			switch e.Code() {
			case codes.NotFound:
				return ctx.JSON(http.StatusNotFound, Err("Location not found", ""))
			}
		}
		return echo.NewHTTPError(http.StatusInternalServerError, Err("Internal server error", err.Error()))
	}

	return ctx.NoContent(http.StatusOK)
}
