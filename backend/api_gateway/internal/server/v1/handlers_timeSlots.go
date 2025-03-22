package v1

import (
	"context"
	"net/http"

	"github.com/labstack/echo/v4"

	"github.com/Slava02/SaintDiego/backend/api_gateway/internal/models"
	timeSlots "github.com/Slava02/SaintDiego/backend/api_gateway/internal/usecases/timeSlots"
)

type ITimeSlotsUC interface {
	CreateTimeSlot(ctx context.Context, req *timeSlots.CreateTimeSlotReq) (*models.TimeSlot, error)
	GetTimeSlots(ctx context.Context, req *timeSlots.GetTimeSlotsReq) ([]*models.TimeSlot, error)
	GetTimeSlot(ctx context.Context, id int64) (*models.TimeSlot, error)
	DeleteTimeSlot(ctx context.Context, id int64) error
	ActivateTimeSlot(ctx context.Context, id int64) error
	ArchiveTimeSlot(ctx context.Context, id int64) error
	UpdateTimeSlot(ctx context.Context, req *timeSlots.UpdateTimeSlotReq) (*models.TimeSlot, error)
}

func (h Handlers) GetTimeSlotsId(ctx echo.Context, id int64) error {
	timeSlot, err := h.timeSlotUC.GetTimeSlot(ctx.Request().Context(), id)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}

	return ctx.JSON(http.StatusOK, timeSlot)
}

func (h Handlers) GetTimeSlots(ctx echo.Context, params GetTimeSlotsParams) error {
	req := &timeSlots.GetTimeSlotsReq{}

	if params.Status != nil {
		req.Status = string(*params.Status)
	}
	if params.StartDate != nil {
		req.StartDate = *params.StartDate
	}
	if params.EndDate != nil {
		req.EndDate = *params.EndDate
	}

	timeSlots, err := h.timeSlotUC.GetTimeSlots(ctx.Request().Context(), req)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}

	return ctx.JSON(http.StatusOK, timeSlots)
}

func (h Handlers) PostTimeSlots(ctx echo.Context) error {
	var req timeSlots.CreateTimeSlotReq
	if err := ctx.Bind(&req); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}

	timeSlot, err := h.timeSlotUC.CreateTimeSlot(ctx.Request().Context(), &req)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}

	return ctx.JSON(http.StatusCreated, timeSlot)
}

func (h Handlers) DeleteTimeSlotsId(ctx echo.Context, id int64) error {
	if err := h.timeSlotUC.DeleteTimeSlot(ctx.Request().Context(), id); err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}

	return ctx.NoContent(http.StatusNoContent)
}

func (h Handlers) PutTimeSlotsId(ctx echo.Context, id int64) error {
	var req timeSlots.UpdateTimeSlotReq
	if err := ctx.Bind(&req); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}

	req.TimeSlot.ID = id
	timeSlot, err := h.timeSlotUC.UpdateTimeSlot(ctx.Request().Context(), &req)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}

	return ctx.JSON(http.StatusOK, timeSlot)
}

func (h Handlers) PatchTimeSlotsIdActivate(ctx echo.Context, id int64) error {
	if err := h.timeSlotUC.ActivateTimeSlot(ctx.Request().Context(), id); err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}

	return ctx.NoContent(http.StatusNoContent)
}

func (h Handlers) PatchTimeSlotsIdArchive(ctx echo.Context, id int64) error {
	if err := h.timeSlotUC.ArchiveTimeSlot(ctx.Request().Context(), id); err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}

	return ctx.NoContent(http.StatusNoContent)
}
