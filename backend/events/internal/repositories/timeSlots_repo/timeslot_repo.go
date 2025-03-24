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
	_, err := r.db.NewInsert().Model(req).Exec(ctx)
	if err != nil {
		return nil, fmt.Errorf("insert time slot: %w", err)
	}

	return req, nil
}

func (r *TimeSlotRepository) GetTimeSlots(ctx context.Context, status string, startDate, endDate time.Time) ([]*models.TimeSlot, error) {
	var timeSlots []*models.TimeSlot

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

	err := query.Scan(ctx)
	if err != nil {
		return nil, fmt.Errorf("select time slots: %w", err)
	}

	return timeSlots, nil
}

func (r *TimeSlotRepository) GetTimeSlot(ctx context.Context, id int64) (*models.TimeSlot, error) {
	timeSlot := &models.TimeSlot{}

	err := r.db.NewSelect().Model(timeSlot).Where("id = ?", id).Scan(ctx)
	if err != nil {
		return nil, fmt.Errorf("select time slot: %w", err)
	}

	return timeSlot, nil
}

func (r *TimeSlotRepository) DeleteTimeSlot(ctx context.Context, id int64) error {
	_, err := r.db.NewDelete().Model((*models.TimeSlot)(nil)).Where("id = ?", id).Exec(ctx)
	if err != nil {
		return fmt.Errorf("delete time slot: %w", err)
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

func (r *TimeSlotRepository) CreateTimeSlotService(ctx context.Context, service *models.TimeSlotService) error {
	_, err := r.db.NewInsert().Model(service).Exec(ctx)
	if err != nil {
		return fmt.Errorf("insert time slot service: %w", err)
	}

	return nil
}

func (r *TimeSlotRepository) DeleteTimeSlotServices(ctx context.Context, timeSlotID int64) error {
	_, err := r.db.NewDelete().
		Model((*models.TimeSlotService)(nil)).
		Where("time_slot_id = ?", timeSlotID).
		Exec(ctx)
	if err != nil {
		return fmt.Errorf("delete time slot services: %w", err)
	}

	return nil
}

func (r *TimeSlotRepository) CreateTimeSlotRecurrence(ctx context.Context, recurrence *models.TimeSlotRecurrence) error {
	_, err := r.db.NewInsert().Model(recurrence).Exec(ctx)
	if err != nil {
		return fmt.Errorf("insert time slot recurrence: %w", err)
	}

	return nil
}

func (r *TimeSlotRepository) DeleteTimeSlotRecurrence(ctx context.Context, timeSlotID int64) error {
	_, err := r.db.NewDelete().
		Model((*models.TimeSlotRecurrence)(nil)).
		Where("time_slot_id = ?", timeSlotID).
		Exec(ctx)
	if err != nil {
		return fmt.Errorf("delete time slot recurrence: %w", err)
	}

	return nil
}
