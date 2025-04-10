package events_repo

import (
	"context"
	"fmt"
	"time"

	"github.com/Slava02/SaintDiego/backend/common/storage"
	"github.com/Slava02/SaintDiego/backend/events/internal/models"
)

//go:generate options-gen -out-filename=events_repo_options.gen.go -from-struct=Options
type Options struct {
	DB *storage.Database `option:"mandatory" validate:"required"`
}

type EventRepository struct {
	db *storage.Database
}

func NewEventRepository(opts Options) (*EventRepository, error) {
	if err := opts.Validate(); err != nil {
		return nil, fmt.Errorf("validate options: %w", err)
	}

	return &EventRepository{db: opts.DB}, nil
}

func (r *EventRepository) GetEvents(ctx context.Context, params *GetEventsParams) ([]*models.Event, error) {
	query := r.db.Select(ctx, &models.Event{})

	if params.ParticipantID != nil {
		query = query.Where("participant_id = ?", params.ParticipantID)
	}

	if params.Status != nil {
		query = query.Where("status = ?", params.Status)
	}

	if params.Location != nil {
		query = query.Where("location = ?", params.Location)
	}

	if params.ServiceID != nil {
		query = query.Where("service_type_id = ?", params.ServiceID)
	}

	if params.FromDate != nil {
		query = query.Where("datetime >= ?", params.FromDate)
	}

	if params.ToDate != nil {
		query = query.Where("datetime <= ?", params.ToDate)
	}

	var events []*models.Event
	err := query.Scan(ctx, &events)
	if err != nil {
		return nil, fmt.Errorf("scan events: %w", err)
	}
	return events, nil
}

func (r *EventRepository) GetEvent(ctx context.Context, id int64) (*models.Event, error) {
	var event models.Event
	err := r.db.Select(ctx, &event).Where("id = ?", id).Scan(ctx)
	if err != nil {
		return nil, fmt.Errorf("scan event: %w", err)
	}
	return &event, nil
}

func (r *EventRepository) UpdateEvent(ctx context.Context, id int64, capacity int32, datetime time.Time) (*models.Event, error) {
	_, err := r.db.Update(ctx, &models.Event{ID: id, Capacity: capacity, Datetime: datetime}).Where("id = ?", id).Exec(ctx)
	if err != nil {
		return nil, fmt.Errorf("update event: %w", err)
	}
	return &models.Event{ID: id, Capacity: capacity, Datetime: datetime}, nil
}

func (r *EventRepository) DeleteEvent(ctx context.Context, id int64) error {
	_, err := r.db.Delete(ctx, &models.Event{ID: id}).Where("id = ?", id).Exec(ctx)
	if err != nil {
		return fmt.Errorf("delete event: %w", err)
	}
	return nil
}
