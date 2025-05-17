package v1

import (
	"bytes"
	"context"
	"fmt"
	"math"
	"net/http"

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
	GetParticipantsByEventIdReport(ctx context.Context, eventID int64) ([]byte, string, error)
}

func (h Handlers) GetEvents(c echo.Context, params GetEventsParams) error {
	events, total, err := h.eventsUC.GetEvents(c.Request().Context(), &events.GetEventsParams{
		ParticipantID:       params.ParticipantId,
		Status:              pointer.Ptr(string(pointer.Indirect(params.Status))),
		LocationID:          params.LocationId,
		ServiceID:           params.ServiceId,
		FromDate:            params.FromDate,
		ToDate:              params.ToDate,
		Page:                params.Page,
		PerPage:             params.PerPage,
		OpenForRegistration: params.OpenForRegistration,
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
	totalPages := int32(math.Ceil(float64(total) / float64(params.PerPage)))

	return c.JSON(http.StatusOK, GetEventsResponse{
		Items:      convertEventsToResponse(events),
		Total:      int32(total),
		Page:       params.Page,
		PerPage:    params.PerPage,
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
	req.Page = params.Page
	req.PerPage = params.PerPage

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

func (h Handlers) GetEventsIdParticipantsReport(c echo.Context, id int64) error {
	report, filename, err := h.eventsUC.GetParticipantsByEventIdReport(c.Request().Context(), id)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, Err("Internal server error", err.Error()))
	}

	c.Response().Header().Set("Content-Disposition", fmt.Sprintf("attachment; filename=%s", filename))
	c.Response().Header().Set("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
	c.Response().Header().Set("Content-Length", fmt.Sprintf("%d", len(report)))

	return c.Stream(http.StatusOK, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", bytes.NewReader(report))
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

func (h Handlers) GetClientsIdEvents(ctx echo.Context, id int64, params GetClientsIdEventsParams) error {
	var req events.GetClientsIdEventsParams
	if err := ctx.Bind(&req); err != nil {
		return ctx.JSON(http.StatusBadRequest, Err("Bad request", err.Error()))
	}

	req.ID = id
	req.Page = int32(*params.Page)
	req.PerPage = int32(*params.PerPage)

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
		Location:          convertLocationToResponse(event.Location),
	}
}

func convertLocationToResponse(location *models.Location) Location {
	if location == nil {
		return Location{}
	}

	return Location{
		Id:      location.ID,
		Name:    location.Name,
		Address: location.Address,
	}
}
