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
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
)

type IEventsUC interface {
	GetEvents(ctx context.Context, req *events.GetEventsParams) ([]*models.Event, int32, error)
	GetEvent(ctx context.Context, id int64) (*models.Event, error)
	UpdateEvent(ctx context.Context, req *events.UpdateEventRequest) (*models.Event, error)
	DeleteEvent(ctx context.Context, id int64) error
	AddParticipantToEvent(ctx context.Context, req *events.AddParticipantToEventRequest) error
	GetParticipantsByEventId(ctx context.Context, params *events.GetEventsIdParticipantsParams) ([]*models.Participant, int32, error)
	GetEventsByServiceId(ctx context.Context, params *events.GetEventsServicesIdParams) ([]*models.Event, int32, error)
	GetClientsIdEvents(ctx context.Context, params *events.GetClientsIdEventsParams) ([]*models.Event, int32, error)
	DeleteParticipantFromEvent(ctx context.Context, req *events.DeleteParticipantFromEventRequest) error
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
		return c.JSON(http.StatusBadRequest, Err("Bad request", err.Error()))
	}

	var (
		fromDate, toDate time.Time
		err              error
	)

	if req.FromDate != "" {
		fromDate, err = time.Parse(time.DateOnly, req.FromDate)
		if err != nil {
			return c.JSON(http.StatusBadRequest, Err("Bad request", err.Error()))
		}
	}

	if req.ToDate != "" {
		toDate, err = time.Parse(time.DateOnly, req.ToDate)
		if err != nil {
			return c.JSON(http.StatusBadRequest, Err("Bad request", err.Error()))
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
		switch status.Code(err) {
		case codes.NotFound:
			return c.JSON(http.StatusNotFound, Err("Client not found", err.Error()))
		default:
			return c.JSON(http.StatusInternalServerError, Err("Internal server error", err.Error()))
		}
	}

	// Рассчитываем общее количество страниц
	totalPages := int32(math.Ceil(float64(total) / float64(req.PerPage)))

	return c.JSON(http.StatusOK, GetEventsResponse{
		Items:      convertEventsToResponse(events),
		Total:      int32(total),
		Page:       req.Page,
		PerPage:    req.PerPage,
		TotalPages: totalPages,
	})
}

func (h Handlers) GetEventsId(c echo.Context, id int64) error {
	event, err := h.eventsUC.GetEvent(c.Request().Context(), id)
	if err != nil {
		switch status.Code(err) {
		case codes.NotFound:
			return c.JSON(http.StatusNotFound, Err("Event not found", err.Error()))
		default:
			return c.JSON(http.StatusInternalServerError, Err("Internal server error", err.Error()))
		}
	}

	return c.JSON(http.StatusOK, convertEventToResponse(event))
}

func (h Handlers) PutEventsId(c echo.Context, id int64) error {
	var req events.UpdateEventRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, Err("Bad request", err.Error()))
	}

	req.ID = id

	event, err := h.eventsUC.UpdateEvent(c.Request().Context(), &req)
	if err != nil {
		switch status.Code(err) {
		case codes.NotFound:
			return c.JSON(http.StatusNotFound, Err("Event not found", err.Error()))
		default:
			return c.JSON(http.StatusInternalServerError, Err("Internal server error", err.Error()))
		}
	}

	return c.JSON(http.StatusOK, convertEventToResponse(event))
}

func (h Handlers) DeleteEventsId(c echo.Context, id int64) error {
	err := h.eventsUC.DeleteEvent(c.Request().Context(), id)
	if err != nil {
		switch status.Code(err) {
		case codes.NotFound:
			return c.JSON(http.StatusNotFound, Err("Event not found", err.Error()))
		default:
			return c.JSON(http.StatusInternalServerError, Err("Internal server error", err.Error()))
		}
	}

	return c.NoContent(http.StatusOK)
}

func (h Handlers) PutEventsIdParticipants(c echo.Context, id int64) error {
	var req events.AddParticipantToEventRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, Err("Bad request", err.Error()))
	}

	req.EventID = id

	err := h.eventsUC.AddParticipantToEvent(c.Request().Context(), &req)
	if err != nil {
		switch status.Code(err) {
		case codes.NotFound:
			return c.JSON(http.StatusNotFound, Err("Event not found", err.Error()))
		case codes.ResourceExhausted:
			return c.JSON(http.StatusConflict, Err("Event is full", err.Error()))
		case codes.AlreadyExists:
			return c.JSON(http.StatusUnprocessableEntity, Err("Client already participant", err.Error()))
		default:
			return c.JSON(http.StatusInternalServerError, Err("Internal server error", err.Error()))
		}
	}

	return c.NoContent(http.StatusNoContent)
}

func (h Handlers) GetEventsIdParticipants(c echo.Context, id int64, params GetEventsIdParticipantsParams) error {
	var req events.GetEventsIdParticipantsParams
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, Err("Bad request", err.Error()))
	}

	req.EventID = id

	participants, total, err := h.eventsUC.GetParticipantsByEventId(c.Request().Context(), &req)
	if err != nil {
		switch status.Code(err) {
		case codes.NotFound:
			return c.JSON(http.StatusNotFound, Err("Event not found", ""))
		default:
			return c.JSON(http.StatusInternalServerError, Err("Internal server error", err.Error()))
		}
	}

	return c.JSON(http.StatusOK, GetParticipantsResponse{
		Participants: convertParticipantsToResponse(participants),
		Total:        total,
		Page:         req.Page,
		PerPage:      req.PerPage,
		TotalPages:   int32(math.Ceil(float64(total) / float64(req.PerPage))),
	})
}

// TODO: move to clients (only handler)
func (h Handlers) GetClientsIdServicesServiceIdEvents(c echo.Context, id int64, serviceId int64, params GetClientsIdServicesServiceIdEventsParams) error {
	var req events.GetEventsServicesIdParams
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, Err("Bad request", err.Error()))
	}

	req.ServiceID = serviceId
	req.ClientID = id
	req.Page = params.Page
	req.PerPage = params.PerPage

	events, total, err := h.eventsUC.GetEventsByServiceId(c.Request().Context(), &req)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, Err("Internal server error", err.Error()))
	}

	return c.JSON(http.StatusOK, GetEventsResponse{
		Items:      convertEventsToResponse(events),
		Total:      int32(total),
		Page:       req.Page,
		PerPage:    req.PerPage,
		TotalPages: int32(math.Ceil(float64(total) / float64(req.PerPage))),
	})
}

// TODO: DEPRECATED USE get clients/{id}/services/{service_id}/events
func (h Handlers) GetEventsServicesId(c echo.Context, id int64, params GetEventsServicesIdParams) error {
	var req events.GetEventsServicesIdParams
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, Err("Bad request", err.Error()))
	}

	req.ServiceID = id

	events, total, err := h.eventsUC.GetEventsByServiceId(c.Request().Context(), &req)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, Err("Internal server error", err.Error()))
	}

	return c.JSON(http.StatusOK, GetEventsResponse{
		Items:      convertEventsToResponse(events),
		Total:      int32(total),
		Page:       req.Page,
		PerPage:    req.PerPage,
		TotalPages: int32(math.Ceil(float64(total) / float64(req.PerPage))),
	})
}

func (h Handlers) GetClientsIdEvents(ctx echo.Context, id int64, params GetClientsIdEventsParams) error {
	var req events.GetClientsIdEventsParams
	if err := ctx.Bind(&req); err != nil {
		return ctx.JSON(http.StatusBadRequest, Err("Bad request", err.Error()))
	}

	req.ID = id

	events, total, err := h.eventsUC.GetClientsIdEvents(ctx.Request().Context(), &req)
	if err != nil {
		switch status.Code(err) {
		case codes.NotFound:
			return ctx.JSON(http.StatusNotFound, Err("Client not found", err.Error()))
		default:
			return ctx.JSON(http.StatusInternalServerError, Err("Internal server error", err.Error()))
		}
	}

	return ctx.JSON(http.StatusOK, GetEventsResponse{
		Items:      convertEventsToResponse(events),
		Total:      int32(total),
		Page:       req.Page,
		PerPage:    req.PerPage,
		TotalPages: int32(math.Ceil(float64(total) / float64(req.PerPage))),
	})
}

func (h Handlers) DeleteEventsIdParticipantsParticipantId(c echo.Context, id int64, participantId int64) error {
	err := h.eventsUC.DeleteParticipantFromEvent(c.Request().Context(), &events.DeleteParticipantFromEventRequest{
		EventID:       id,
		ParticipantID: participantId,
	})
	if err != nil {
		switch status.Code(err) {
		case codes.NotFound:
			return c.JSON(http.StatusNotFound, Err("Client not found", err.Error()))
		default:
			return c.JSON(http.StatusInternalServerError, Err("Internal server error", err.Error()))
		}
	}

	return c.NoContent(http.StatusNoContent)
}

func convertParticipantsToResponse(participants []*models.Participant) []Participant {
	response := make([]Participant, len(participants))
	for i, participant := range participants {
		response[i] = Participant{
			Id:                   participant.ID,
			PhotoName:            participant.PhotoName,
			FirstName:            participant.FirstName,
			MiddleName:           participant.MiddleName,
			LastName:             participant.LastName,
			BirthDate:            participant.BirthDate,
			VolunteerTg:          participant.VolunteerTG,
			VolunteerTgLogin:     participant.VolunteerTgLogin,
			VolounteerFirstName:  participant.VolounteerFirstName,
			VolounteerMiddleName: participant.VolounteerMiddleName,
			VolounteerLastName:   participant.VolounteerLastName,
		}
	}
	return response
}

func convertEventsToResponse(events []*models.Event) []Event {
	response := make([]Event, len(events))
	for i, event := range events {
		response[i] = convertEventToResponse(event)
	}
	return response
}

func convertEventToResponse(event *models.Event) Event {
	return Event{
		Id:                event.ID,
		TimeSlotServiceId: event.TimeSlotServiceID,
		Capacity:          event.Capacity,
		Datetime:          event.Datetime,
		ServiceTypeId:     event.ServiceTypeID,
		ParticipantsCount: event.ParticipantsCount,
		ServiceName:       event.ServiceName,
	}
}
