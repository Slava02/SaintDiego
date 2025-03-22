package timeSlots

import (
	"github.com/Slava02/SaintDiego/backend/api_gateway/internal/models"
	pb "github.com/Slava02/SaintDiego/backend/events/pkg/pb"
)

func convertPBTimeSlotToModel(pbTimeSlot *pb.TimeSlot) *models.TimeSlot {
	timeSlot := &models.TimeSlot{
		ID:         pbTimeSlot.Id,
		Title:      pbTimeSlot.Title,
		Type:       pbTimeSlot.Type,
		LocationID: pbTimeSlot.LocationId,
		Capacity:   pbTimeSlot.Capacity,
		StartDate:  pbTimeSlot.StartDate.AsTime(),
		EndDate:    pbTimeSlot.EndDate.AsTime(),
		Status:     pbTimeSlot.Status,
		Services:   make([]models.TimeSlotService, len(pbTimeSlot.Services)),
	}

	for i, pbService := range pbTimeSlot.Services {
		timeSlot.Services[i] = models.TimeSlotService{
			ServiceTypeID: pbService.ServiceTypeId,
			Capacity:      pbService.Capacity,
			BookingWindow: pbService.BookingWindow,
			Time:          pbService.Time.AsTime(),
		}
	}

	if pbTimeSlot.Recurrence != nil {
		timeSlot.Recurrence = &models.Recurrence{
			Frequency: pbTimeSlot.Recurrence.Frequency,
			Interval:  pbTimeSlot.Recurrence.Interval,
			EndType:   pbTimeSlot.Recurrence.EndType,
		}
		if pbTimeSlot.Recurrence.EndValue != nil {
			endValue := pbTimeSlot.Recurrence.EndValue.AsTime()
			timeSlot.Recurrence.EndValue = &endValue
		}
	}

	return timeSlot
}
