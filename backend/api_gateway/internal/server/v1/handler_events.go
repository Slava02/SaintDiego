package v1

import (
	"context"
	"math"
	"net/http"
	"time"

	"github.com/Slava02/SaintDiego/backend/api_gateway/internal/models"
	"github.com/Slava02/SaintDiego/backend/api_gateway/internal/usecases/events"
	"github.com/Slava02/SaintDiego/backend/common/pointer"
	"github.com/labstack/echo/v4"
)

type IEventsUC interface {
	GetEvents(ctx context.Context, req *events.GetEventsParams) ([]*models.Event, int32, error)
	GetEvent(ctx context.Context, id int64) (*models.Event, error)
	UpdateEvent(ctx context.Context, req *events.UpdateEventRequest) (*models.Event, error)
	DeleteEvent(ctx context.Context, id int64) error
}

func (h Handlers) GetEvents(c echo.Context, params GetEventsParams) error {
	var req struct {
		Page          int32   `query:"page" json:"page" validate:"omitempty,min=1"`
		PerPage       int32   `query:"per_page" json:"per_page" validate:"omitempty,min=1,max=100"`
		ParticipantID *int64  `query:"participant_id" json:"participant_id" validate:"omitempty,min=1"`
		Status        *string `query:"status" json:"status" validate:"omitempty,oneof=upcoming past"`
		LocationID    *int64  `query:"location_id" json:"location_id" validate:"omitempty,min=1"`
		ServiceID     *int64  `query:"service_id" json:"service_id" validate:"omitempty,min=1"`
		FromDate      string  `query:"from_date" json:"from_date" validate:"omitempty"`
		ToDate        string  `query:"to_date" json:"to_date" validate:"omitempty"`
	}
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, err.Error())
	}

	var (
		fromDate, toDate time.Time
		err              error
	)

	if req.FromDate != "" {
		fromDate, err = time.Parse(time.DateOnly, req.FromDate)
		if err != nil {
			return c.JSON(http.StatusBadRequest, err.Error())
		}
	}

	if req.ToDate != "" {
		toDate, err = time.Parse(time.DateOnly, req.ToDate)
		if err != nil {
			return c.JSON(http.StatusBadRequest, err.Error())
		}
	}

	events, total, err := h.eventsUC.GetEvents(c.Request().Context(), &events.GetEventsParams{
		ParticipantID: req.ParticipantID,
		Status:        req.Status,
		LocationID:    req.LocationID,
		ServiceID:     req.ServiceID,
		FromDate:      pointer.PtrWithZeroAsNil(fromDate),
		ToDate:        pointer.PtrWithZeroAsNil(toDate),
		Page:          req.Page,
		PerPage:       req.PerPage,
	})
	if err != nil {
		return c.JSON(http.StatusInternalServerError, err.Error())
	}

	// Рассчитываем общее количество страниц
	totalPages := int32(math.Ceil(float64(total) / float64(req.PerPage)))

	return c.JSON(http.StatusOK, GetEventsResponse{
		Items:      convertEventsToResponse(events),
		Total:      int64(total),
		Page:       req.Page,
		PerPage:    req.PerPage,
		TotalPages: totalPages,
	})
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

	req.ID = id

	event, err := h.eventsUC.UpdateEvent(c.Request().Context(), &req)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, err.Error())
	}

	return c.JSON(http.StatusOK, event)
}

func (h Handlers) DeleteEventsId(c echo.Context, id int64) error {
	err := h.eventsUC.DeleteEvent(c.Request().Context(), id)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, err.Error())
	}

	return c.NoContent(http.StatusNoContent)
}

func convertEventsToResponse(events []*models.Event) []Event {
	response := make([]Event, len(events))
	for i, event := range events {
		response[i] = Event{
			Id:                pointer.Ptr(event.ID),
			TimeSlotServiceId: event.TimeSlotServiceID,
			Capacity:          event.Capacity,
			Datetime:          event.Datetime,
			ServiceTypeId:     pointer.Ptr(event.ServiceTypeID),
		}
	}
	return response
}
