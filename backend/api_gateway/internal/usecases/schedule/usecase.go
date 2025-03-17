//nolint:gosec // G115: integer overflow checks are handled with explicit checks before conversions
package schedule

import (
	"context"
	"errors"
	"fmt"
	"math"
	"time"

	"google.golang.org/protobuf/types/known/timestamppb"

	"github.com/Slava02/SaintDiego/internal/models"
	v1 "github.com/Slava02/SaintDiego/internal/server/v1"
	"github.com/Slava02/SaintDiego/internal/types"
	"github.com/Slava02/SaintDiego/proto/events"
)

//go:generate options-gen -out-filename=usecase_options.gen.go -from-struct=Options
type Options struct {
	client events.EventServiceClient `option:"mandatory" validate:"required"`
}

type UseCase struct {
	client events.EventServiceClient
}

const (
	statusActive   = "active"
	statusArchived = "archived"
)

var _ v1.IScheduleUseCase = (*UseCase)(nil)

func New(opts Options) (*UseCase, error) {
	if err := opts.Validate(); err != nil {
		return nil, fmt.Errorf("validate options: %v", err)
	}

	return &UseCase{
		client: opts.client,
	}, nil
}

//nolint:godox // Legitimate TODO for future implementation
// TODO: Add status field validation.

// TODO Add status.
//
//nolint:godox // Legitimate TODO for future implementation
func (u *UseCase) CreateTimeSlot(ctx context.Context, req *models.CreateTimeSlotRequest) (*models.TimeSlot, error) {
	if req.Capacity > math.MaxInt32 {
		return nil, errors.New("capacity exceeds maximum allowed value")
	}

	// Create the request
	protoReq := &events.CreateTimeSlotRequest{
		Title:      req.Title,
		Type:       events.TimeSlotType(events.TimeSlotType_value[req.Type]),
		LocationId: req.LocationID.String(),
		Capacity:   int32(req.Capacity),
		StartDate:  timestamppb.New(req.StartDate),
		EndDate:    timestamppb.New(req.EndDate),
		Services:   make([]*events.TimeSlotService, 0, len(req.Services)),
	}

	// Convert services
	for _, svc := range req.Services {
		if svc.Capacity > math.MaxInt32 || svc.BookingWindow > math.MaxInt32 {
			return nil, errors.New("service capacity or booking window exceeds maximum allowed value")
		}
		protoReq.Services = append(protoReq.Services, &events.TimeSlotService{
			ServiceTypeId: svc.ServiceTypeID.String(),
			Capacity:      int32(svc.Capacity),
			BookingWindow: int32(svc.BookingWindow),
			Time:          timestamppb.New(svc.Time),
		})
	}

	// Convert recurrence if present
	if req.Recurrence != nil {
		if req.Recurrence.Interval > math.MaxInt32 {
			return nil, errors.New("recurrence interval exceeds maximum allowed value")
		}
		var endValue *timestamppb.Timestamp
		if req.Recurrence.EndValue != nil {
			endValue = timestamppb.New(*req.Recurrence.EndValue)
		}

		protoReq.Recurrence = &events.Recurrence{
			Frequency: events.RecurrenceFrequency(events.RecurrenceFrequency_value[req.Recurrence.Frequency]),
			Interval:  int32(req.Recurrence.Interval),
			EndType:   events.RecurrenceEndType(events.RecurrenceEndType_value[req.Recurrence.EndType]),
			EndValue:  endValue,
		}
	}

	// Call the service
	resp, err := u.client.CreateTimeSlot(ctx, protoReq)
	if err != nil {
		return nil, fmt.Errorf("failed to create time slot: %w", err)
	}

	// Convert response back to model
	result := &models.TimeSlot{
		ID:         types.MustParse[types.TimeSlotID](resp.Id),
		Title:      resp.Title,
		Type:       req.Type,
		LocationID: req.LocationID,
		Capacity:   int(resp.Capacity),
		StartDate:  resp.StartDate.AsTime(),
		EndDate:    resp.EndDate.AsTime(),
		Status:     models.TimeSlotStatusActive,
		Services:   make([]models.TimeSlotService, 0, len(resp.Services)),
	}

	// Convert services in response
	for _, svc := range resp.Services {
		result.Services = append(result.Services, models.TimeSlotService{
			ServiceTypeID: types.MustParse[types.ServiceTypeID](svc.ServiceTypeId),
			Capacity:      int(svc.Capacity),
			BookingWindow: int(svc.BookingWindow),
			Time:          svc.Time.AsTime(),
		})
	}

	// Convert recurrence in response if present
	if resp.Recurrence != nil {
		var endValue *time.Time
		if resp.Recurrence.EndValue != nil {
			t := resp.Recurrence.EndValue.AsTime()
			endValue = &t
		}

		result.Recurrence = &models.Recurrence{
			Frequency: req.Recurrence.Frequency,
			Interval:  int(resp.Recurrence.Interval),
			EndType:   req.Recurrence.EndType,
			EndValue:  endValue,
		}
	}

	return result, nil
}

func (u *UseCase) GetTimeSlots(ctx context.Context, req *models.GetTimeSlotsRequest) ([]*models.TimeSlot, error) {
	// Create the request
	var status events.TimeSlotStatus
	switch req.Status {
	case statusActive:
		status = events.TimeSlotStatus_TIME_SLOT_STATUS_ACTIVE
	case statusArchived:
		status = events.TimeSlotStatus_TIME_SLOT_STATUS_ARCHIVED
	default:
		status = events.TimeSlotStatus_TIME_SLOT_STATUS_ACTIVE
	}

	protoReq := &events.GetTimeSlotsRequest{
		Status:    status,
		StartDate: timestamppb.New(req.StartDate),
		EndDate:   timestamppb.New(req.EndDate),
	}

	resp, err := u.client.GetTimeSlots(ctx, protoReq)
	if err != nil {
		return nil, fmt.Errorf("failed to get time slots: %w", err)
	}

	result := make([]*models.TimeSlot, 0, len(resp.TimeSlots))
	for _, ts := range resp.TimeSlots {
		timeSlotID := types.MustParse[types.TimeSlotID](ts.Id)
		locationID := types.MustParse[types.LocationID](ts.LocationId)

		timeSlot := &models.TimeSlot{
			ID:         timeSlotID,
			Title:      ts.Title,
			Type:       getTimeSlotTypeString(ts.Type),
			LocationID: locationID,
			Capacity:   int(ts.Capacity),
			StartDate:  ts.StartDate.AsTime(),
			EndDate:    ts.EndDate.AsTime(),
			Status:     getTimeSlotStatusString(ts.Status),
			Services:   make([]models.TimeSlotService, 0, len(ts.Services)),
		}

		// Convert services
		for _, svc := range ts.Services {
			timeSlot.Services = append(timeSlot.Services, models.TimeSlotService{
				ServiceTypeID: types.MustParse[types.ServiceTypeID](svc.ServiceTypeId),
				Capacity:      int(svc.Capacity),
				BookingWindow: int(svc.BookingWindow),
				Time:          svc.Time.AsTime(),
			})
		}

		// Convert recurrence if present
		if ts.Recurrence != nil {
			var endValue *time.Time
			if ts.Recurrence.EndValue != nil {
				t := ts.Recurrence.EndValue.AsTime()
				endValue = &t
			}

			timeSlot.Recurrence = &models.Recurrence{
				Frequency: getRecurrenceFrequencyString(ts.Recurrence.Frequency),
				Interval:  int(ts.Recurrence.Interval),
				EndType:   getRecurrenceEndTypeString(ts.Recurrence.EndType),
				EndValue:  endValue,
			}
		}

		result = append(result, timeSlot)
	}

	return result, nil
}

func (u *UseCase) GetTimeSlot(ctx context.Context, id types.TimeSlotID) (*models.TimeSlot, error) {
	// Get all time slots and filter by ID
	resp, err := u.client.GetTimeSlots(ctx, &events.GetTimeSlotsRequest{})
	if err != nil {
		return nil, fmt.Errorf("failed to get time slot: %w", err)
	}

	// Find the time slot with matching ID
	var ts *events.TimeSlot
	for _, slot := range resp.TimeSlots {
		if slot.Id == id.String() {
			ts = slot
			break
		}
	}
	if ts == nil {
		return nil, fmt.Errorf("time slot not found: %s", id)
	}

	timeSlotID := types.MustParse[types.TimeSlotID](ts.Id)
	locationID := types.MustParse[types.LocationID](ts.LocationId)

	result := &models.TimeSlot{
		ID:         timeSlotID,
		Title:      ts.Title,
		Type:       getTimeSlotTypeString(ts.Type),
		LocationID: locationID,
		Capacity:   int(ts.Capacity),
		StartDate:  ts.StartDate.AsTime(),
		EndDate:    ts.EndDate.AsTime(),
		Status:     getTimeSlotStatusString(ts.Status),
		Services:   make([]models.TimeSlotService, 0, len(ts.Services)),
	}

	// Convert services
	for _, svc := range ts.Services {
		result.Services = append(result.Services, models.TimeSlotService{
			ServiceTypeID: types.MustParse[types.ServiceTypeID](svc.ServiceTypeId),
			Capacity:      int(svc.Capacity),
			BookingWindow: int(svc.BookingWindow),
			Time:          svc.Time.AsTime(),
		})
	}

	// Convert recurrence if present
	if ts.Recurrence != nil {
		var endValue *time.Time
		if ts.Recurrence.EndValue != nil {
			t := ts.Recurrence.EndValue.AsTime()
			endValue = &t
		}

		result.Recurrence = &models.Recurrence{
			Frequency: getRecurrenceFrequencyString(ts.Recurrence.Frequency),
			Interval:  int(ts.Recurrence.Interval),
			EndType:   getRecurrenceEndTypeString(ts.Recurrence.EndType),
			EndValue:  endValue,
		}
	}

	return result, nil
}

func (u *UseCase) DeleteTimeSlot(ctx context.Context, id types.TimeSlotID) error {
	_, err := u.client.DeleteTimeSlot(ctx, &events.DeleteTimeSlotRequest{
		Id: id.String(),
	})
	return err
}

func (u *UseCase) ActivateTimeSlot(ctx context.Context, id types.TimeSlotID) error {
	_, err := u.client.ActivateTimeSlot(ctx, &events.ActivateTimeSlotRequest{
		Id: id.String(),
	})
	return err
}

func (u *UseCase) ArchiveTimeSlot(ctx context.Context, id types.TimeSlotID) error {
	_, err := u.client.ArchiveTimeSlot(ctx, &events.ArchiveTimeSlotRequest{
		Id: id.String(),
	})
	return err
}

func (u *UseCase) UpdateTimeSlot(ctx context.Context, req *models.TimeSlot) (*models.TimeSlot, error) {
	if req.Capacity > math.MaxInt32 {
		return nil, errors.New("capacity exceeds maximum allowed value")
	}

	// Create the request
	protoReq := &events.UpdateTimeSlotRequest{
		TimeSlot: &events.TimeSlot{
			Id:         req.ID.String(),
			Title:      req.Title,
			Type:       events.TimeSlotType(events.TimeSlotType_value[req.Type]),
			LocationId: req.LocationID.String(),
			Capacity:   int32(req.Capacity),
			StartDate:  timestamppb.New(req.StartDate),
			EndDate:    timestamppb.New(req.EndDate),
			Status:     events.TimeSlotStatus(events.TimeSlotStatus_value[req.Status]),
			Services:   make([]*events.TimeSlotService, 0, len(req.Services)),
		},
	}

	// Convert services
	for _, svc := range req.Services {
		if svc.Capacity > math.MaxInt32 || svc.BookingWindow > math.MaxInt32 {
			return nil, errors.New("service capacity or booking window exceeds maximum allowed value")
		}
		protoReq.TimeSlot.Services = append(protoReq.TimeSlot.Services, &events.TimeSlotService{
			ServiceTypeId: svc.ServiceTypeID.String(),
			Capacity:      int32(svc.Capacity),
			BookingWindow: int32(svc.BookingWindow),
			Time:          timestamppb.New(svc.Time),
		})
	}

	// Convert recurrence if present
	if req.Recurrence != nil {
		if req.Recurrence.Interval > math.MaxInt32 {
			return nil, errors.New("recurrence interval exceeds maximum allowed value")
		}
		var endValue *timestamppb.Timestamp
		if req.Recurrence.EndValue != nil {
			endValue = timestamppb.New(*req.Recurrence.EndValue)
		}

		protoReq.TimeSlot.Recurrence = &events.Recurrence{
			Frequency: events.RecurrenceFrequency(events.RecurrenceFrequency_value[req.Recurrence.Frequency]),
			Interval:  int32(req.Recurrence.Interval),
			EndType:   events.RecurrenceEndType(events.RecurrenceEndType_value[req.Recurrence.EndType]),
			EndValue:  endValue,
		}
	}

	// Call the service
	resp, err := u.client.UpdateTimeSlot(ctx, protoReq)
	if err != nil {
		return nil, fmt.Errorf("failed to update time slot: %w", err)
	}

	// Convert response back to model
	result := &models.TimeSlot{
		ID:         types.MustParse[types.TimeSlotID](resp.Id),
		Title:      resp.Title,
		Type:       getTimeSlotTypeString(resp.Type),
		LocationID: types.MustParse[types.LocationID](resp.LocationId),
		Capacity:   int(resp.Capacity),
		StartDate:  resp.StartDate.AsTime(),
		EndDate:    resp.EndDate.AsTime(),
		Status:     getTimeSlotStatusString(resp.Status),
		Services:   make([]models.TimeSlotService, 0, len(resp.Services)),
	}

	// Convert services in response
	for _, svc := range resp.Services {
		result.Services = append(result.Services, models.TimeSlotService{
			ServiceTypeID: types.MustParse[types.ServiceTypeID](svc.ServiceTypeId),
			Capacity:      int(svc.Capacity),
			BookingWindow: int(svc.BookingWindow),
			Time:          svc.Time.AsTime(),
		})
	}

	// Convert recurrence in response if present
	if resp.Recurrence != nil {
		var endValue *time.Time
		if resp.Recurrence.EndValue != nil {
			t := resp.Recurrence.EndValue.AsTime()
			endValue = &t
		}

		result.Recurrence = &models.Recurrence{
			Frequency: getRecurrenceFrequencyString(resp.Recurrence.Frequency),
			Interval:  int(resp.Recurrence.Interval),
			EndType:   getRecurrenceEndTypeString(resp.Recurrence.EndType),
			EndValue:  endValue,
		}
	}

	return result, nil
}

func (u *UseCase) GetServices(ctx context.Context) ([]*models.Service, error) {
	resp, err := u.client.GetServices(ctx, &events.GetServicesRequest{})
	if err != nil {
		return nil, fmt.Errorf("failed to get services: %w", err)
	}

	result := make([]*models.Service, 0, len(resp.Services))
	for _, svc := range resp.Services {
		desc := svc.Description // Convert to pointer
		result = append(result, &models.Service{
			ID:          types.MustParse[types.ServiceTypeID](svc.Id),
			Name:        svc.Name,
			Description: &desc,
		})
	}

	return result, nil
}

func (u *UseCase) GetLocations(ctx context.Context) ([]*models.Location, error) {
	resp, err := u.client.GetLocations(ctx, &events.GetLocationsRequest{})
	if err != nil {
		return nil, fmt.Errorf("failed to get locations: %w", err)
	}

	result := make([]*models.Location, 0, len(resp.Locations))
	for _, loc := range resp.Locations {
		result = append(result, &models.Location{
			ID:      loc.Id,
			Name:    loc.Name,
			Address: loc.Address,
		})
	}

	return result, nil
}

func (u *UseCase) CreateLocation(ctx context.Context, req *models.CreateLocationRequest) (*models.Location, error) {
	resp, err := u.client.CreateLocation(ctx, &events.CreateLocationRequest{
		Name:    req.Name,
		Address: req.Address,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to create location: %w", err)
	}

	return &models.Location{
		ID:      resp.Id,
		Name:    resp.Name,
		Address: resp.Address,
	}, nil
}

// Helper functions to convert enum values to strings.
func getTimeSlotTypeString(t events.TimeSlotType) string {
	switch t {
	case events.TimeSlotType_TIME_SLOT_TYPE_SINGLE:
		return "single"
	case events.TimeSlotType_TIME_SLOT_TYPE_RECURRING:
		return "recurring"
	default:
		return "single"
	}
}

func getTimeSlotStatusString(s events.TimeSlotStatus) string {
	switch s {
	case events.TimeSlotStatus_TIME_SLOT_STATUS_ACTIVE:
		return "active"
	case events.TimeSlotStatus_TIME_SLOT_STATUS_ARCHIVED:
		return "archived"
	default:
		return "active"
	}
}

func getRecurrenceFrequencyString(f events.RecurrenceFrequency) string {
	switch f {
	case events.RecurrenceFrequency_RECURRENCE_FREQUENCY_DAILY:
		return "daily"
	case events.RecurrenceFrequency_RECURRENCE_FREQUENCY_WEEKLY:
		return "weekly"
	default:
		return "daily"
	}
}

func getRecurrenceEndTypeString(t events.RecurrenceEndType) string {
	switch t {
	case events.RecurrenceEndType_RECURRENCE_END_TYPE_NEVER:
		return "never"
	case events.RecurrenceEndType_RECURRENCE_END_TYPE_DATE:
		return "date"
	default:
		return "never"
	}
}
