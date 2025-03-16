package v1

import (
	"net/http"
	"time"

	"github.com/labstack/echo/v4"

	"github.com/Slava02/SaintDiego/internal/models"
	"github.com/Slava02/SaintDiego/internal/types"
)

func (h *Handlers) GetTimeSlots(ctx echo.Context, params GetTimeSlotsParams) error {
	var status string
	if params.Status != nil {
		status = string(*params.Status)
	}

	var endDate time.Time
	if params.EndDate != nil {
		endDate = *params.EndDate
	}

	response, err := h.scheduleUseCase.GetTimeSlots(ctx.Request().Context(), &models.GetTimeSlotsRequest{
		Status:    status,
		StartDate: *params.StartDate,
		EndDate:   endDate,
	})
	if err != nil {
		return ctx.JSON(http.StatusInternalServerError, err.Error())
	}

	return ctx.JSON(http.StatusOK, response)
}

func (h *Handlers) PostTimeSlots(ctx echo.Context) error {
	var req PostTimeSlotsJSONRequestBody
	if err := ctx.Bind(&req); err != nil {
		return ctx.JSON(http.StatusBadRequest, err.Error())
	}

	response, err := h.scheduleUseCase.CreateTimeSlot(ctx.Request().Context(), &models.CreateTimeSlotRequest{
		Title:      req.Title,
		Type:       string(req.Type),
		LocationID: req.LocationId,
		Capacity:   req.Capacity,
		StartDate:  req.StartDate,
		EndDate:    req.EndDate,
		Services:   convertAPIToModelServices(req.Services),
		Recurrence: convertAPIToModelRecurrence(req.Recurrence),
	})
	if err != nil {
		return ctx.JSON(http.StatusInternalServerError, err.Error())
	}

	return ctx.JSON(http.StatusCreated, response)
}

func (h *Handlers) DeleteTimeSlotsId(ctx echo.Context, id string) error { //nolint:all // Сгенерировалось так
	timeSlotID, err := types.Parse[types.TimeSlotID](id)
	if err != nil {
		return ctx.JSON(http.StatusBadRequest, err.Error())
	}

	err = h.scheduleUseCase.DeleteTimeSlot(ctx.Request().Context(), timeSlotID)
	if err != nil {
		return ctx.JSON(http.StatusInternalServerError, err.Error())
	}

	return ctx.JSON(http.StatusOK, "ok")
}

func (h *Handlers) PutTimeSlotsId(ctx echo.Context, id string) error { //nolint:all // Сгенерировалось так
	var req PutTimeSlotsIdJSONRequestBody
	if err := ctx.Bind(&req); err != nil {
		return ctx.JSON(http.StatusBadRequest, err.Error())
	}

	timeSlotID, err := types.Parse[types.TimeSlotID](id)
	if err != nil {
		return ctx.JSON(http.StatusInternalServerError, err.Error())
	}

	response, err := h.scheduleUseCase.UpdateTimeSlot(ctx.Request().Context(), &models.TimeSlot{
		ID:         timeSlotID,
		Title:      req.Title,
		Type:       string(req.Type),
		LocationID: req.LocationId,
		Capacity:   req.Capacity,
		StartDate:  req.StartDate,
		EndDate:    req.EndDate,
		Services:   convertAPIToModelServices(req.Services),
		Recurrence: convertAPIToModelRecurrence(req.Recurrence),
	})
	if err != nil {
		return ctx.JSON(http.StatusInternalServerError, err.Error())
	}

	return ctx.JSON(http.StatusOK, response)
}

func (h *Handlers) PatchTimeSlotsIdActivate(ctx echo.Context, id string) error { //nolint:all // Сгенерировалось так
	timeSlotID, err := types.Parse[types.TimeSlotID](id)
	if err != nil {
		return ctx.JSON(http.StatusInternalServerError, err.Error())
	}

	err = h.scheduleUseCase.ActivateTimeSlot(ctx.Request().Context(), timeSlotID)
	if err != nil {
		return ctx.JSON(http.StatusInternalServerError, err.Error())
	}

	return ctx.JSON(http.StatusOK, "ok")
}

func (h *Handlers) PatchTimeSlotsIdArchive(ctx echo.Context, id string) error { //nolint:all // Сгенерировалось так
	timeSlotID, err := types.Parse[types.TimeSlotID](id)
	if err != nil {
		return ctx.JSON(http.StatusInternalServerError, err.Error())
	}

	err = h.scheduleUseCase.ArchiveTimeSlot(ctx.Request().Context(), timeSlotID)
	if err != nil {
		return ctx.JSON(http.StatusInternalServerError, err.Error())
	}

	return ctx.JSON(http.StatusOK, "ok")
}

// TODO: Добавить пагинацию.
//
//nolint:godox // Legitimate TODO for future implementation
func (h *Handlers) GetServices(ctx echo.Context) error {
	response, err := h.scheduleUseCase.GetServices(ctx.Request().Context())
	if err != nil {
		return ctx.JSON(http.StatusInternalServerError, err.Error())
	}

	return ctx.JSON(http.StatusOK, response)
}

// Helper functions to convert between API and model types.
func convertAPIToModelServices(apiServices []TimeSlotService) []models.TimeSlotService {
	modelServices := make([]models.TimeSlotService, len(apiServices))
	for i, svc := range apiServices {
		modelServices[i] = models.TimeSlotService{
			ServiceTypeID: svc.ServiceTypeId,
			Capacity:      svc.Capacity,
			BookingWindow: svc.BookingWindow,
			Time:          svc.Time,
		}
	}
	return modelServices
}

func convertAPIToModelRecurrence(apiRecurrence *Recurrence) *models.Recurrence {
	if apiRecurrence == nil {
		return nil
	}
	return &models.Recurrence{
		Frequency: string(apiRecurrence.Frequency),
		Interval:  apiRecurrence.Interval,
		EndType:   string(apiRecurrence.EndType),
		EndValue:  apiRecurrence.EndValue,
	}
}
