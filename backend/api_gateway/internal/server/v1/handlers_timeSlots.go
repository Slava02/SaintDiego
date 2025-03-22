package v1

import (
	"context"

	"github.com/labstack/echo/v4"

	"github.com/Slava02/SaintDiego/backend/api_gateway/internal/models"
	timeSlots "github.com/Slava02/SaintDiego/backend/api_gateway/internal/usecases/timeSlots"
)

type ITimeSlotsUC interface {
	CreateTimeSlot(ctx context.Context, req *timeSlots.CreateTimeSlotReq) (*models.TimeSlot, error)
	GetTimeSlots(ctx context.Context, req *timeSlots.GetTimeSlotsReq) ([]*models.TimeSlot, error)
	GetTimeSlot(ctx context.Context, id int) (*models.TimeSlot, error)
	DeleteTimeSlot(ctx context.Context, id int) error
	ActivateTimeSlot(ctx context.Context, id int) error
	ArchiveTimeSlot(ctx context.Context, id int) error
	UpdateTimeSlot(ctx context.Context, req *timeSlots.UpdateTimeSlotReq) (*models.TimeSlot, error)
}

func (h Handlers) GetTimeSlotsId(ctx echo.Context, id int) error {
	// TODO implement me
	panic("implement me")
}

func (h Handlers) GetTimeSlots(ctx echo.Context, params GetTimeSlotsParams) error {
	// TODO implement me
	panic("implement me")
}

func (h Handlers) PostTimeSlots(ctx echo.Context) error {
	// TODO implement me
	panic("implement me")
}

func (h Handlers) DeleteTimeSlotsId(ctx echo.Context, id int) error {
	// TODO implement me
	panic("implement me")
}

func (h Handlers) PutTimeSlotsId(ctx echo.Context, id int) error {
	// TODO implement me
	panic("implement me")
}

func (h Handlers) PatchTimeSlotsIdActivate(ctx echo.Context, id int) error {
	// TODO implement me
	panic("implement me")
}

func (h Handlers) PatchTimeSlotsIdArchive(ctx echo.Context, id int) error {
	// TODO implement me
	panic("implement me")
}
