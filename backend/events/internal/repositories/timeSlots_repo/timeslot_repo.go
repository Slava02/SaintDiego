package timeslots_repo

import (
	"context"
	"fmt"
	"time"

	"github.com/Slava02/SaintDiego/backend/events/internal/models"
	"github.com/uptrace/bun"
)

//go:generate options-gen -out-filename=timeslot_repo_options.gen.go -from-struct=Options
type Options struct {
	DB *bun.DB `option:"mandatory" validate:"required"`
}

type TimeSlotRepository struct {
	db *bun.DB
}

func NewTimeSlotRepository(opts Options) *TimeSlotRepository {
	return &TimeSlotRepository{db: opts.DB}
}

func (r *TimeSlotRepository) CreateTimeSlot(ctx context.Context, req *models.TimeSlot) (*models.TimeSlot, error) {
	tx, err := r.db.BeginTx(ctx, nil)
	if err != nil {
		return nil, fmt.Errorf("begin transaction: %w", err)
	}
	defer tx.Rollback()

	// Create base time slot without relations
	timeSlot := &models.TimeSlot{
		Title:      req.Title,
		Type:       req.Type,
		LocationID: req.LocationID,
		Capacity:   req.Capacity,
		StartDate:  req.StartDate,
		EndDate:    req.EndDate,
		Status:     req.Status,
	}

	_, err = tx.NewInsert().Model(timeSlot).Exec(ctx)
	if err != nil {
		return nil, fmt.Errorf("insert time slot: %w", err)
	}

	// Set TimeSlotID for each service and insert them
	if len(req.Services) > 0 {
		for i := range req.Services {
			req.Services[i].TimeSlotID = timeSlot.ID
		}
		timeSlot.Services = req.Services
		_, err = tx.NewInsert().Model(&timeSlot.Services).Exec(ctx)
		if err != nil {
			return nil, fmt.Errorf("insert time slot service: %w", err)
		}
	}

	// Set TimeSlotID for recurrence and insert it
	if req.Recurrence != nil {
		req.Recurrence.TimeSlotID = timeSlot.ID
		_, err = tx.NewInsert().Model(req.Recurrence).Exec(ctx)
		if err != nil {
			return nil, fmt.Errorf("insert time slot recurrence: %w", err)
		}
		timeSlot.Recurrence = req.Recurrence
	}

	if err := tx.Commit(); err != nil {
		return nil, fmt.Errorf("commit transaction: %w", err)
	}

	return timeSlot, nil
}

func (r *TimeSlotRepository) GetTimeSlots(ctx context.Context, status string, startDate, endDate time.Time) ([]*models.TimeSlot, error) {
	tx, err := r.db.BeginTx(ctx, nil)
	if err != nil {
		return nil, fmt.Errorf("begin transaction: %w", err)
	}
	defer tx.Rollback()

	var timeSlots []*models.TimeSlot

	// Get base time slots
	query := r.db.NewSelect().Model(&timeSlots)

	if status != "" {
		query = query.Where("status = ?", status)
	}
	if !startDate.IsZero() {
		query = query.Where("start_date >= ?", startDate)
	}
	if !endDate.IsZero() {
		query = query.Where("end_date <= ?", endDate)
	}

	err = query.Scan(ctx)
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

		err = r.db.NewSelect().
			Model(&services).
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

		err = r.db.NewSelect().
			Model(&recurrences).
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

	if err := tx.Commit(); err != nil {
		return nil, fmt.Errorf("commit transaction: %w", err)
	}

	return timeSlots, nil
}

func (r *TimeSlotRepository) GetTimeSlot(ctx context.Context, id int64) (*models.TimeSlot, error) {
	timeSlot := &models.TimeSlot{}

	err := r.db.NewSelect().
		Model(timeSlot).
		Relation("Services").
		Relation("Recurrence").
		Where("id = ?", id).
		Scan(ctx)
	if err != nil {
		return nil, fmt.Errorf("select time slot: %w", err)
	}

	return timeSlot, nil
}

func (r *TimeSlotRepository) DeleteTimeSlot(ctx context.Context, id int64) error {
	tx, err := r.db.BeginTx(ctx, nil)
	if err != nil {
		return fmt.Errorf("begin transaction: %w", err)
	}
	defer tx.Rollback()

	// Delete time slot
	_, err = tx.NewDelete().Model((*models.TimeSlot)(nil)).Where("id = ?", id).Exec(ctx)
	if err != nil {
		return fmt.Errorf("delete time slot: %w", err)
	}

	// Delete recurrence
	_, err = tx.NewDelete().
		Model((*models.TimeSlotRecurrence)(nil)).
		Where("time_slot_id = ?", id).
		Exec(ctx)
	if err != nil {
		return fmt.Errorf("delete time slot recurrence: %w", err)
	}

	// Delete services
	_, err = tx.NewDelete().
		Model((*models.TimeSlotService)(nil)).
		Where("time_slot_id = ?", id).
		Exec(ctx)
	if err != nil {
		return fmt.Errorf("delete time slot services: %w", err)
	}

	if err := tx.Commit(); err != nil {
		return fmt.Errorf("commit transaction: %w", err)
	}

	return nil
}

func (r *TimeSlotRepository) ActivateTimeSlot(ctx context.Context, id int64) error {
	_, err := r.db.NewUpdate().
		Model((*models.TimeSlot)(nil)).
		Set("status = ?", "active").
		Where("id = ?", id).
		Exec(ctx)
	if err != nil {
		return fmt.Errorf("activate time slot: %w", err)
	}

	return nil
}

func (r *TimeSlotRepository) ArchiveTimeSlot(ctx context.Context, id int64) error {
	_, err := r.db.NewUpdate().
		Model((*models.TimeSlot)(nil)).
		Set("status = ?", "archived").
		Where("id = ?", id).
		Exec(ctx)
	if err != nil {
		return fmt.Errorf("archive time slot: %w", err)
	}

	return nil
}

func (r *TimeSlotRepository) UpdateTimeSlot(ctx context.Context, req *models.TimeSlot) (*models.TimeSlot, error) {
	_, err := r.db.NewUpdate().Model(req).Where("id = ?", req.ID).Exec(ctx)
	if err != nil {
		return nil, fmt.Errorf("update time slot: %w", err)
	}

	return req, nil
}
