package timeSlots

import (
	"time"

	"github.com/Slava02/SaintDiego/backend/api_gateway/internal/models"
)

// requests.
type CreateTimeSlotReq struct {
	Title      string                   `json:"title" validate:"required,max=255"`
	Type       string                   `json:"type" validate:"required,oneof=single recurring"`
	LocationID int64                    `json:"locationId" validate:"required"`
	Capacity   int32                    `json:"capacity" validate:"required,min=1"`
	StartDate  time.Time                `json:"startDate" validate:"required"`
	EndDate    time.Time                `json:"endDate" validate:"required,gtfield=StartDate"`
	Services   []models.TimeSlotService `json:"services" validate:"required,dive,min=1"`
	Recurrence *models.Recurrence       `json:"recurrence,omitempty" validate:"omitempty,required_if=Type recurring"`
}

type GetTimeSlotsReq struct {
	Status    string    `json:"status" validate:"required,oneof=active archived"`
	StartDate time.Time `json:"startDate" validate:"required"`
	EndDate   time.Time `json:"endDate" validate:"required,gtfield=StartDate"`
}

type UpdateTimeSlotReq struct {
	TimeSlot models.TimeSlot `json:"timeSlot" validate:"required"`
}
