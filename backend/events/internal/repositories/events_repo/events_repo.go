package events_repo

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"time"

	"github.com/Slava02/SaintDiego/backend/common/storage"
	"github.com/Slava02/SaintDiego/backend/events/internal/models"
	"github.com/uptrace/bun"
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
	query := r.db.Select(ctx, &models.Event{}).
		ColumnExpr("e.*, COUNT(ec.id) as participants_count").
		Join("LEFT JOIN event_client ec ON e.id = ec.event_id").
		Group("e.id")

	// Применяем фильтры к обоим запросам
	if params.LocationID != nil {
		joinClause := "JOIN time_slot_service ON e.time_slot_service_id = time_slot_service.id JOIN time_slot ON time_slot_service.time_slot_id = time_slot.id JOIN service_type ON e.service_type_id = service_type.id"
		query = query.Join(joinClause)
		query = query.Where("time_slot.location_id = ?", *params.LocationID)
	}

	// TODO: потестить
	if params.ParticipantID != nil {
		query = query.Where("ec.client_id = ?", *params.ParticipantID)
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
	err := r.db.Select(ctx, &event).
		ColumnExpr("e.*, COUNT(ec.id) as participants_count").
		Join("LEFT JOIN event_client ec ON e.id = ec.event_id").
		Group("e.id").
		Where("e.id = ?", id).
		Scan(ctx)
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

func (r *EventRepository) AddParticipantToEvent(ctx context.Context, eventID, clientID, volunteerID int64) error {
	_, err := r.db.Insert(ctx, &models.EventClient{
		EventID:     eventID,
		ClientID:    clientID,
		VolunteerID: volunteerID,
	}).Exec(ctx)
	if err != nil {
		return fmt.Errorf("add participant to event: %w", err)
	}
	return nil
}

func (r *EventRepository) GetParticipantsByEventId(ctx context.Context, eventID int64, page int64, perPage int64) ([]*models.Participant, int64, error) {
	offset := (page - 1) * perPage

	query := r.db.Select(ctx, &models.Client{}).
		ColumnExpr(`
			c.id, 
			c.photo_name, 
			c.birth_date, 
			c.gender, 
			c.firstname AS first_name, 
			c.middlename AS middle_name, 
			c.lastname AS last_name, 
			v.tg_id AS volunteer_tg, 
			v.tg_login AS volunteer_tg_login, 
			v.first_name AS volounteer_first_name,
			v.middle_name AS volounteer_middle_name,
			v.last_name AS volounteer_last_name`).
		Join("JOIN event_client ec ON ec.client_id = c.id").
		Join("JOIN volunteer v ON ec.volunteer_id = v.tg_id").
		Where("ec.event_id = ?", eventID).
		Limit(int(perPage)).
		Offset(int(offset))

	var participants []*models.Participant

	total, err := query.ScanAndCount(ctx, &participants)
	if err != nil {
		return nil, 0, fmt.Errorf("get participants: %w", err)
	}

	return participants, int64(total), nil
}

// Список событий по serviceID, с учетом окна бронирования и количества участников
func (r *EventRepository) GetEventsByServiceId(ctx context.Context, serviceID int64, page int64, perPage int64) ([]*models.Event, int64, error) {
	var events []*models.Event

	offset := (page - 1) * perPage

	total, err := r.db.Select(ctx, &events).
		ColumnExpr("e.*, COUNT(ec.id) as participants_count").
		Join("LEFT JOIN event_client ec ON e.id = ec.event_id").
		Join("JOIN time_slot_service tss ON e.time_slot_service_id = tss.id").
		Group("e.id").
		Where("e.service_type_id = ?", serviceID).
		Where("e.datetime <= DATE_ADD(CURDATE(), INTERVAL tss.booking_window DAY)").
		Having("COUNT(ec.id) < e.capacity").
		Limit(int(perPage)).
		Offset(int(offset)).
		ScanAndCount(ctx, &events)

	if err != nil {
		return nil, 0, fmt.Errorf("get events by service id: %w", err)
	}

	return events, int64(total), nil
}

func (r *EventRepository) GetTimeSlotIDByEventID(ctx context.Context, eventID int64) (int64, error) {
	type TimeSlotID struct {
		bun.BaseModel `bun:"table:time_slot,alias:ts"`
		ID            int64 `bun:"id"`
	}

	var timeSlotID TimeSlotID
	err := r.db.Select(ctx, &timeSlotID).
		ColumnExpr("ts.id").
		Join("JOIN time_slot_service tss ON ts.id = tss.time_slot_id").
		Join("JOIN event e ON tss.id = e.time_slot_service_id").
		Where("e.id = ?", eventID).
		Scan(ctx)
	if err != nil {
		return 0, fmt.Errorf("get time slot id: %w", err)
	}
	return timeSlotID.ID, nil
}

func (r *EventRepository) GetTimeSlotWithParticipantCount(ctx context.Context, timeSlotServiceID int64) (*models.TimeSlotWithParticipantCount, error) {
	var timeSlot models.TimeSlotWithParticipantCount
	err := r.db.Select(ctx, &timeSlot).
		ColumnExpr("ts.id, ts.capacity, COUNT(ec.id) as participant_count").
		Join("JOIN time_slot_service tss ON ts.id = tss.time_slot_id").
		Join("JOIN event e ON tss.id = e.time_slot_service_id").
		Join("LEFT JOIN event_client ec ON e.id = ec.event_id").
		Where("ts.id = ?", timeSlotServiceID).
		Group("ts.id").
		Scan(ctx)
	if err != nil {
		return nil, fmt.Errorf("get time slot: %w", err)
	}

	return &timeSlot, nil
}

func (r *EventRepository) DeleteParticipantFromEvent(ctx context.Context, eventID, participantID int64) error {
	_, err := r.db.Delete(ctx, &models.EventClient{
		EventID:  eventID,
		ClientID: participantID,
	}).Where("event_id = ? AND client_id = ?", eventID, participantID).Exec(ctx)
	if err != nil {
		return fmt.Errorf("delete participant from event: %w", err)
	}
	return nil
}

func (r *EventRepository) GetClientsIdEvents(ctx context.Context, clientID int64, page int64, perPage int64) ([]*models.Event, int64, error) {
	var events []*models.Event

	offset := (page - 1) * perPage

	total, err := r.db.Select(ctx, &events).
		ColumnExpr("e.*, COUNT(ec.id) as participants_count").
		Join("LEFT JOIN event_client ec ON e.id = ec.event_id").
		Where("ec.client_id = ?", clientID).
		Limit(int(perPage)).
		Offset(int(offset)).
		ScanAndCount(ctx, &events)

	if err != nil {
		return nil, 0, fmt.Errorf("get clients id events: %w", err)
	}

	return events, int64(total), nil
}
