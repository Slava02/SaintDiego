package v1

import (
	"context"
	"fmt"
	"net/http"

	"github.com/labstack/echo/v4"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"

	"github.com/Slava02/SaintDiego/backend/api_gateway/internal/models"
	timeSlots "github.com/Slava02/SaintDiego/backend/api_gateway/internal/usecases/timeSlots"
)

// TODO: нужно возвращать ответы сгенерированными модельками

type ITimeSlotsUC interface {
	CreateTimeSlot(ctx context.Context, req *timeSlots.CreateTimeSlotReq) (*models.TimeSlot, error)
	GetTimeSlots(ctx context.Context, req *timeSlots.GetTimeSlotsReq) ([]*models.TimeSlot, error)
	GetTimeSlot(ctx context.Context, id int64) (*models.TimeSlot, error)
	DeleteTimeSlot(ctx context.Context, id int64) error
	ActivateTimeSlot(ctx context.Context, id int64) error
	ArchiveTimeSlot(ctx context.Context, id int64) error
	UpdateTimeSlot(ctx context.Context, req *models.TimeSlot) (*models.TimeSlot, error)
}

func (h Handlers) GetTimeSlotsId(ctx echo.Context, id int64) error {
	timeSlot, err := h.timeSlotUC.GetTimeSlot(ctx.Request().Context(), id)
	if err != nil {
		if e, ok := status.FromError(err); ok {
			switch e.Code() {
			case codes.NotFound:
				return ctx.JSON(http.StatusNotFound, Err("Time slot not found", ""))
			}
		}
		return echo.NewHTTPError(http.StatusInternalServerError, Err("Internal server error", err.Error()))
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
		if e, ok := status.FromError(err); ok {
			switch e.Code() {
			case codes.NotFound:
				return ctx.JSON(http.StatusNotFound, Err("Time slot not found", ""))
			}
		}
		return echo.NewHTTPError(http.StatusInternalServerError, Err("Internal server error", err.Error()))
	}

	return ctx.JSON(http.StatusOK, timeSlots)
}

func (h Handlers) PostTimeSlots(ctx echo.Context) error {
	var req timeSlots.CreateTimeSlotReq
	if err := ctx.Bind(&req); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, Err("Bad request", err.Error()))
	}

	if err := validateTimeSlotCapacity(&req); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, Err("Bad request", err.Error()))
	}

	timeSlot, err := h.timeSlotUC.CreateTimeSlot(ctx.Request().Context(), &req)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, Err("Internal server error", err.Error()))
	}

	return ctx.JSON(http.StatusCreated, timeSlot)
}

func (h Handlers) DeleteTimeSlotsId(ctx echo.Context, id int64) error {
	if err := h.timeSlotUC.DeleteTimeSlot(ctx.Request().Context(), id); err != nil {
		if e, ok := status.FromError(err); ok {
			switch e.Code() {
			case codes.NotFound:
				return ctx.JSON(http.StatusNotFound, Err("Time slot not found", ""))
			}
		}
		return echo.NewHTTPError(http.StatusInternalServerError, Err("Internal server error", err.Error()))
	}

	return ctx.NoContent(http.StatusNoContent)
}

func (h Handlers) PutTimeSlotsId(ctx echo.Context, id int64) error {
	var req models.TimeSlot
	if err := ctx.Bind(&req); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, Err("Bad request", err.Error()))
	}

	req.ID = id
	timeSlot, err := h.timeSlotUC.UpdateTimeSlot(ctx.Request().Context(), &req)
	if err != nil {
		if e, ok := status.FromError(err); ok {
			switch e.Code() {
			case codes.NotFound:
				return ctx.JSON(http.StatusNotFound, Err("Time slot not found", ""))
			}
		}
		return echo.NewHTTPError(http.StatusInternalServerError, Err("Internal server error", err.Error()))
	}

	return ctx.JSON(http.StatusOK, timeSlot)
}

func (h Handlers) PatchTimeSlotsIdActivate(ctx echo.Context, id int64) error {
	if err := h.timeSlotUC.ActivateTimeSlot(ctx.Request().Context(), id); err != nil {
		if e, ok := status.FromError(err); ok {
			switch e.Code() {
			case codes.NotFound:
				return ctx.JSON(http.StatusNotFound, Err("Time slot not found", ""))
			}
		}
		return echo.NewHTTPError(http.StatusInternalServerError, Err("Internal server error", err.Error()))
	}

	return ctx.NoContent(http.StatusNoContent)
}

func (h Handlers) PatchTimeSlotsIdArchive(ctx echo.Context, id int64) error {
	if err := h.timeSlotUC.ArchiveTimeSlot(ctx.Request().Context(), id); err != nil {
		if e, ok := status.FromError(err); ok {
			switch e.Code() {
			case codes.NotFound:
				return ctx.JSON(http.StatusNotFound, Err("Time slot not found", ""))
			}
		}
		return echo.NewHTTPError(http.StatusInternalServerError, Err("Internal server error", err.Error()))
	}

	return ctx.NoContent(http.StatusNoContent)
}

func validateTimeSlotCapacity(req *timeSlots.CreateTimeSlotReq) error {
	if req.Capacity < 0 {
		return fmt.Errorf("capacity must be greater than 0")
	}

	var totalServiceCapacity int32 = 0

	for _, service := range req.Services {
		totalServiceCapacity += service.Capacity
	}

	if totalServiceCapacity/int32(len(req.Services)) > req.Capacity {
		return fmt.Errorf("average services capacity must be less than time slot capacity")
	}

	return nil
}
