package timeslots_repo

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"time"

	"github.com/Slava02/SaintDiego/backend/schedule/internal/models"
	"github.com/Slava02/SaintDiego/backend/schedule/internal/storage"
	"github.com/uptrace/bun"
)

//go:generate options-gen -out-filename=timeslot_repo_options.gen.go -from-struct=Options
type Options struct {
	DB *storage.Database `option:"mandatory" validate:"required"`
}

type TimeSlotRepository struct {
	db *storage.Database
}

func NewTimeSlotRepository(opts Options) *TimeSlotRepository {
	return &TimeSlotRepository{db: opts.DB}
}

func (r *TimeSlotRepository) InsertUpdateTimeSlot(ctx context.Context, timeSlot *models.TimeSlot) (*models.TimeSlot, error) {
	// Create time slot
	_, err := r.db.Insert(ctx, timeSlot).
		On("DUPLICATE KEY UPDATE").
		Set("start_date = ?", timeSlot.StartDate).
		Set("end_date = ?", timeSlot.EndDate).
		Set("status = ?", timeSlot.Status).
		Exec(ctx)
	if err != nil {
		return nil, fmt.Errorf("create time slot: %w", err)
	}

	// Create services and get their IDs
	for _, service := range timeSlot.Services {
		service.TimeSlotID = timeSlot.ID
		_, err = r.db.Insert(ctx, service).
			On("DUPLICATE KEY UPDATE").
			Set("capacity = ?", service.Capacity).
			Set("booking_window = ?", service.BookingWindow).
			Set("time = ?", service.Time).
			Exec(ctx)
		if err != nil {
			return nil, fmt.Errorf("create service: %w", err)
		}

	}

	// Create recurrence if it's a recurring time slot
	if timeSlot.Type == "recurring" && timeSlot.Recurrence != nil {
		timeSlot.Recurrence.TimeSlotID = timeSlot.ID
		_, err = r.db.Insert(ctx, timeSlot.Recurrence).
			On("DUPLICATE KEY UPDATE").
			Set("frequency = ?", timeSlot.Recurrence.Frequency).
			Set("`interval` = ?", timeSlot.Recurrence.Interval).
			Set("end_type = ?", timeSlot.Recurrence.EndType).
			Set("end_value = ?", timeSlot.Recurrence.EndValue).
			Exec(ctx)
		if err != nil {
			return nil, fmt.Errorf("create recurrence: %w", err)
		}
	}

	return timeSlot, nil
}

func (r *TimeSlotRepository) GetTimeSlots(ctx context.Context, status string, startDate, endDate time.Time) ([]*models.TimeSlot, error) {
	var timeSlots []*models.TimeSlot

	// Get base time slots
	query := r.db.Select(ctx, &timeSlots)

	if status != "" {
		query = query.Where("status = ?", status)
	}
	if !startDate.IsZero() {
		query = query.Where("start_date >= ?", startDate)
	}
	if !endDate.IsZero() {
		query = query.Where("end_date <= ?", endDate)
	}

	err := query.Scan(ctx)
	if err != nil {
		return nil, fmt.Errorf("select time slots: %w", err)
	}

	// Get services for all time slots
	if len(timeSlots) > 0 {
		var services []*models.TimeSlotService
		timeSlotIDs := make([]int64, len(timeSlots))
		for i, ts := range timeSlots {
			timeSlotIDs[i] = ts.ID
		}

		err = r.db.Select(ctx, &services).
			Where("time_slot_id IN (?)", bun.In(timeSlotIDs)).
			Scan(ctx)
		if err != nil {
			return nil, fmt.Errorf("select time slot services: %w", err)
		}

		// Map services to time slots
		servicesMap := make(map[int64][]*models.TimeSlotService)
		for _, service := range services {
			servicesMap[service.TimeSlotID] = append(servicesMap[service.TimeSlotID], service)
		}

		for _, timeSlot := range timeSlots {
			timeSlot.Services = servicesMap[timeSlot.ID]
		}
	}

	// Get recurrence for all time slots
	if len(timeSlots) > 0 {
		var recurrences []*models.TimeSlotRecurrence
		timeSlotIDs := make([]int64, len(timeSlots))
		for i, ts := range timeSlots {
			timeSlotIDs[i] = ts.ID
		}

		err = r.db.Select(ctx, &recurrences).
			Where("time_slot_id IN (?)", bun.In(timeSlotIDs)).
			Scan(ctx)
		if err != nil {
			return nil, fmt.Errorf("select time slot recurrences: %w", err)
		}

		// Map recurrences to time slots
		recurrenceMap := make(map[int64]*models.TimeSlotRecurrence)
		for _, recurrence := range recurrences {
			recurrenceMap[recurrence.TimeSlotID] = recurrence
		}

		for _, timeSlot := range timeSlots {
			timeSlot.Recurrence = recurrenceMap[timeSlot.ID]
		}
	}

	return timeSlots, nil
}

func (r *TimeSlotRepository) GetTimeSlot(ctx context.Context, id int64) (*models.TimeSlot, error) {

	timeSlot := &models.TimeSlot{}

	err := r.db.Select(ctx, timeSlot).
		Where("id = ?", id).
		Scan(ctx)
	if err != nil {
		return nil, fmt.Errorf("select time slot: %w", err)
	}

	var services []*models.TimeSlotService
	err = r.db.Select(ctx, &services).
		Where("time_slot_id = ?", id).
		Scan(ctx)
	if err != nil {
		return nil, fmt.Errorf("select time slot services: %w", err)
	}
	timeSlot.Services = services

	recurrence := &models.TimeSlotRecurrence{}
	err = r.db.Select(ctx, recurrence).
		Where("time_slot_id = ?", id).
		Scan(ctx)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return timeSlot, nil
		} else {
			return nil, fmt.Errorf("select time slot recurrence: %w", err)
		}
	}

	timeSlot.Recurrence = recurrence

	return timeSlot, nil
}

func (r *TimeSlotRepository) DeleteTimeSlot(ctx context.Context, id int64) error {
	return r.db.WithinTransaction(ctx, func(txCtx context.Context) error {
		// First, get all services for this time slot
		var services []*models.TimeSlotService
		err := r.db.Select(txCtx, &services).
			Where("time_slot_id = ?", id).
			Scan(txCtx)
		if err != nil {
			return fmt.Errorf("get time slot services: %w", err)
		}

		// Get all service IDs
		serviceIDs := make([]int64, len(services))
		for i, service := range services {
			serviceIDs[i] = service.ID
		}

		// Delete all events related to these services
		if len(serviceIDs) > 0 {
			_, err = r.db.Delete(txCtx, (*models.Event)(nil)).
				Where("time_slot_service_id IN (?)", bun.In(serviceIDs)).
				Exec(txCtx)
			if err != nil {
				return fmt.Errorf("delete events: %w", err)
			}
		}

		// Delete time slot services
		_, err = r.db.Delete(txCtx, (*models.TimeSlotService)(nil)).
			Where("time_slot_id = ?", id).
			Exec(txCtx)
		if err != nil {
			return fmt.Errorf("delete time slot services: %w", err)
		}

		// Delete time slot recurrence
		_, err = r.db.Delete(txCtx, (*models.TimeSlotRecurrence)(nil)).
			Where("time_slot_id = ?", id).
			Exec(txCtx)
		if err != nil {
			return fmt.Errorf("delete time slot recurrence: %w", err)
		}

		// Finally, delete the time slot itself
		_, err = r.db.Delete(txCtx, (*models.TimeSlot)(nil)).
			Where("id = ?", id).
			Exec(txCtx)
		if err != nil {
			return fmt.Errorf("delete time slot: %w", err)
		}

		return nil
	})
}

func (r *TimeSlotRepository) ActivateTimeSlot(ctx context.Context, id int64) error {
	_, err := r.db.Update(ctx, (*models.TimeSlot)(nil)).
		Set("status = ?", "active").
		Where("id = ?", id).
		Exec(ctx)
	if err != nil {
		return fmt.Errorf("activate time slot: %w", err)
	}

	return nil
}

func (r *TimeSlotRepository) ArchiveTimeSlot(ctx context.Context, id int64) error {
	_, err := r.db.Update(ctx, (*models.TimeSlot)(nil)).
		Set("status = ?", "archived").
		Where("id = ?", id).
		Exec(ctx)
	if err != nil {
		return fmt.Errorf("archive time slot: %w", err)
	}

	return nil
}

func (r *TimeSlotRepository) CreateTimeSlotServices(ctx context.Context, id int64, req []*models.TimeSlotService) ([]*models.TimeSlotService, error) {
	_, err := r.db.Insert(ctx, &req).Exec(ctx)
	if err != nil {
		return nil, fmt.Errorf("create time slot services: %w", err)
	}
	return req, nil
}

func (r *TimeSlotRepository) DeleteTimeSlotRecurrence(ctx context.Context, timeSlotID int64) error {
	_, err := r.db.Delete(ctx, (*models.TimeSlotRecurrence)(nil)).
		Where("time_slot_id = ?", timeSlotID).
		Exec(ctx)
	if err != nil {
		return fmt.Errorf("delete time slot recurrence: %w", err)
	}
	return nil
}

func (r *TimeSlotRepository) DeleteTimeSlotServicesByIds(ctx context.Context, serviceIds []int64) error {
	_, err := r.db.Delete(ctx, (*models.TimeSlotService)(nil)).
		Where("id IN (?)", bun.In(serviceIds)).
		Exec(ctx)
	if err != nil {
		return fmt.Errorf("delete time slot service: %w", err)
	}
	return nil
}

func (r *TimeSlotRepository) DeleteEventsByServiceIds(ctx context.Context, serviceIds []int64) error {
	_, err := r.db.Delete(ctx, (*models.Event)(nil)).
		Where("time_slot_service_id IN (?)", bun.In(serviceIds)).
		Exec(ctx)
	if err != nil {
		return fmt.Errorf("delete events: %w", err)
	}
	return nil
}

func (r *TimeSlotRepository) GetEventsByServiceIds(ctx context.Context, serviceIds []int64) ([]*models.Event, error) {
	var events []*models.Event
	err := r.db.Select(ctx, &events).
		Where("time_slot_service_id IN (?)", bun.In(serviceIds)).
		Scan(ctx)
	if err != nil {
		return nil, fmt.Errorf("select events: %w", err)
	}
	return events, nil
}

func (r *TimeSlotRepository) InsertUpdateEvents(ctx context.Context, events []*models.Event) error {
	for _, event := range events {
		_, err := r.db.Insert(ctx, event).
			On("DUPLICATE KEY UPDATE").
			Set("capacity = ?", event.Capacity).
			Set("datetime = ?", event.DateTime).
			Set("time_slot_service_id = ?", event.TimeSlotServiceID).
			Exec(ctx)
		if err != nil {
			return fmt.Errorf("create events: %w", err)
		}
	}
	return nil
}
