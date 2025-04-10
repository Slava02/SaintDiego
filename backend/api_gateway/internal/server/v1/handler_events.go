package v1

import (
	"context"
	"net/http"

	"github.com/Slava02/SaintDiego/backend/api_gateway/internal/models"
	"github.com/Slava02/SaintDiego/backend/api_gateway/internal/usecases/events"
	"github.com/labstack/echo/v4"
)

type IEventsUC interface {
	GetEvents(ctx context.Context, req *events.GetEventsParams) ([]*models.Event, error)
	GetEvent(ctx context.Context, id int64) (*models.Event, error)
	UpdateEvent(ctx context.Context, req *events.UpdateEventRequest) (*models.Event, error)
	DeleteEvent(ctx context.Context, id int64) (*models.Event, error)
}

func (h Handlers) GetEvents(c echo.Context, params GetEventsParams) error {
	var req events.GetEventsParams
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, err.Error())
	}

	if err := c.Validate(&req); err != nil {
		return c.JSON(http.StatusBadRequest, err.Error())
	}

	events, err := h.eventsUC.GetEvents(c.Request().Context(), &req)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, err.Error())
	}

	return c.JSON(http.StatusOK, events)
}

func (h Handlers) GetEventsId(c echo.Context, id int64) error {
	event, err := h.eventsUC.GetEvent(c.Request().Context(), id)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, err.Error())
	}

	return c.JSON(http.StatusOK, event)
}

func (h Handlers) PutEventsId(c echo.Context, id int64) error {
	var req events.UpdateEventRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, err.Error())
	}

	if err := c.Validate(&req); err != nil {
		return c.JSON(http.StatusBadRequest, err.Error())
	}

	req.ID = id

	event, err := h.eventsUC.UpdateEvent(c.Request().Context(), &req)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, err.Error())
	}

	return c.JSON(http.StatusOK, event)
}

func (h Handlers) DeleteEventsId(c echo.Context, id int64) error {
	event, err := h.eventsUC.DeleteEvent(c.Request().Context(), id)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, err.Error())
	}

	return c.JSON(http.StatusOK, event)
}
