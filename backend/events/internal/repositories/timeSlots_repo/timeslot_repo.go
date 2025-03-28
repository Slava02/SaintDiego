package timeslots_repo

import (
	"context"
	"fmt"
	"time"

	"github.com/Slava02/SaintDiego/backend/events/internal/models"
	"github.com/Slava02/SaintDiego/backend/events/internal/storage"
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

func (r *TimeSlotRepository) CreateTimeSlot(ctx context.Context, timeSlot *models.TimeSlot) (*models.TimeSlot, error) {
	// Create time slot
	_, err := r.db.Insert(ctx, timeSlot).Exec(ctx)
	if err != nil {
		return nil, fmt.Errorf("create time slot: %w", err)
	}

	// Create services and get their IDs
	for _, service := range timeSlot.Services {
		service.TimeSlotID = timeSlot.ID
		_, err = r.db.Insert(ctx, service).Exec(ctx)
		if err != nil {
			return nil, fmt.Errorf("create service: %w", err)
		}

	}

	// Create recurrence if it's a recurring time slot
	if timeSlot.Type == "recurring" && timeSlot.Recurrence != nil {
		timeSlot.Recurrence.TimeSlotID = timeSlot.ID
		_, err = r.db.Insert(ctx, timeSlot.Recurrence).Exec(ctx)
		if err != nil {
			return nil, fmt.Errorf("create recurrence: %w", err)
		}
	}

	return timeSlot, nil
}

func (r *TimeSlotRepository) CreateEvents(ctx context.Context, events []*models.Event) error {
	_, err := r.db.Insert(ctx, &events).Exec(ctx)
	if err != nil {
		return fmt.Errorf("create events: %w", err)
	}
	return nil
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
		return nil, fmt.Errorf("select time slot recurrence: %w", err)
	}
	timeSlot.Recurrence = recurrence

	return timeSlot, nil
}

func (r *TimeSlotRepository) DeleteTimeSlot(ctx context.Context, id int64) error {

	_, err := r.db.Delete(ctx, (*models.TimeSlot)(nil)).Where("id = ?", id).Exec(ctx)
	if err != nil {
		return fmt.Errorf("delete time slot: %w", err)
	}

	_, err = r.db.Delete(ctx, (*models.TimeSlotRecurrence)(nil)).
		Where("time_slot_id = ?", id).
		Exec(ctx)
	if err != nil {
		return fmt.Errorf("delete time slot recurrence: %w", err)
	}

	_, err = r.db.Delete(ctx, (*models.TimeSlotService)(nil)).
		Where("time_slot_id = ?", id).
		Exec(ctx)
	if err != nil {
		return fmt.Errorf("delete time slot services: %w", err)
	}

	return nil
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

func (r *TimeSlotRepository) UpdateTimeSlot(ctx context.Context, req *models.TimeSlot) (*models.TimeSlot, error) {

	_, err := r.db.Update(ctx, req).
		Column("title", "type", "location_id", "capacity", "start_date", "end_date", "status", "created_by_id", "updated_by_id").
		Where("id = ?", req.ID).
		Exec(ctx)
	if err != nil {
		return nil, fmt.Errorf("update time slot: %w", err)
	}

	if len(req.Services) > 0 {
		for i := range req.Services {
			req.Services[i].TimeSlotID = req.ID
		}
		_, err = r.db.Insert(ctx, req.Services).
			On("DUPLICATE KEY UPDATE").
			Set("capacity = VALUES(capacity)").
			Set("booking_window = VALUES(booking_window)").
			Set("time = VALUES(time)").
			Exec(ctx)
		if err != nil {
			return nil, fmt.Errorf("upsert time slot services: %w", err)
		}
	}

	if req.Recurrence != nil {
		req.Recurrence.TimeSlotID = req.ID
		_, err = r.db.Insert(ctx, req.Recurrence).
			On("DUPLICATE KEY UPDATE").
			Set("frequency = VALUES(frequency)").
			Set("interval = VALUES(interval)").
			Set("end_type = VALUES(end_type)").
			Set("end_value = VALUES(end_value)").
			Exec(ctx)
		if err != nil {
			return nil, fmt.Errorf("upsert time slot recurrence: %w", err)
		}
	}

	return req, nil
}
