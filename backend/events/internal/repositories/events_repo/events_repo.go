package events_repo

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"time"

	"github.com/Slava02/SaintDiego/backend/common/storage"
	"github.com/Slava02/SaintDiego/backend/events/internal/models"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
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

func (r *EventRepository) GetEvents(ctx context.Context, params *GetEventsParams) ([]*models.Event, int64, error) {
	// Создаем основной запрос для получения данных
	query := r.db.Select(ctx, &models.Event{})

	// Применяем фильтры к обоим запросам
	if params.LocationID != nil {
		joinClause := "JOIN time_slot_service ON e.time_slot_service_id = time_slot_service.id JOIN time_slot ON time_slot_service.time_slot_id = time_slot.id JOIN service_type ON e.service_type_id = service_type.id"
		query = query.Join(joinClause)
		query = query.Where("time_slot.location_id = ?", *params.LocationID)
	}

	if params.ParticipantID != nil {
		query = query.Where("participant_id = ?", *params.ParticipantID)
	}

	if params.Upcoming {
		query = query.Where("datetime > ?", time.Now())
	}

	if params.Past {
		query = query.Where("datetime <= ?", time.Now())
	}

	if params.ServiceID != nil {
		query = query.Where("service_type_id = ?", *params.ServiceID)
	}

	if params.FromDate != nil {
		query = query.Where("datetime >= ?", *params.FromDate)
	}

	if params.ToDate != nil {
		query = query.Where("datetime <= ?", *params.ToDate)
	}

	// Применяем пагинацию
	if params.Page < 1 {
		params.Page = 1
	}
	if params.PerPage < 1 {
		params.PerPage = 20
	} else if params.PerPage > 100 {
		params.PerPage = 100
	}

	offset := (params.Page - 1) * params.PerPage
	query = query.Limit(int(params.PerPage)).Offset(int(offset))

	var events []*models.Event
	total, err := query.ScanAndCount(ctx, &events)
	if err != nil {
		return nil, 0, fmt.Errorf("get events: %v", err)
	}

	return events, int64(total), nil
}

func (r *EventRepository) GetEvent(ctx context.Context, id int64) (*models.Event, error) {
	var event models.Event
	err := r.db.Select(ctx, &event).Where("id = ?", id).Scan(ctx)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, status.Errorf(codes.NotFound, "event not found")
		}

		return nil, fmt.Errorf("scan event: %w", err)
	}
	return &event, nil
}

func (r *EventRepository) UpdateEvent(ctx context.Context, id int64, capacity int32, datetime time.Time) (*models.Event, error) {
	existingEvent := &models.Event{}

	err := r.db.Select(ctx, existingEvent).Where("id = ?", id).Scan(ctx)
	if err != nil {
		return nil, fmt.Errorf("get existing event: %w", err)
	}

	// Update only capacity and datetime
	_, err = r.db.Update(ctx, &models.Event{}).
		Column("capacity").
		Column("datetime").
		Where("id = ?", id).
		Exec(ctx)
	if err != nil {
		return nil, fmt.Errorf("update event: %w", err)
	}

	return &models.Event{
		ID:                id,
		Capacity:          capacity,
		Datetime:          datetime,
		TimeSlotServiceID: existingEvent.TimeSlotServiceID,
		ServiceTypeID:     existingEvent.ServiceTypeID,
	}, nil
}

func (r *EventRepository) DeleteEvent(ctx context.Context, id int64) error {
	_, err := r.db.Delete(ctx, &models.Event{ID: id}).Where("id = ?", id).Exec(ctx)
	if err != nil {
		return fmt.Errorf("delete event: %w", err)
	}
	return nil
}
