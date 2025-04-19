package clients_repo

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"time"

	"github.com/Slava02/SaintDiego/backend/clients/internal/models"
	"github.com/Slava02/SaintDiego/backend/common/storage"
	"github.com/uptrace/bun"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
)

//go:generate options-gen -out-filename=repo_options.gen.go -from-struct=Options
type Options struct {
	DB *storage.Database `option:"mandatory" validate:"required"`
}

type ClientsRepository struct {
	db *storage.Database
}

func NewClientsRepository(opts Options) *ClientsRepository {
	return &ClientsRepository{db: opts.DB}
}

func (r *ClientsRepository) GetClients(ctx context.Context, page, perPage int32) ([]*models.Client, int64, error) {
	var clients []*models.Client

	diedClients := r.db.Select(ctx, (*models.ClientFieldValue)(nil)).
		ColumnExpr("client_id").
		Where("option_id = 949")

	offset := (page - 1) * perPage
	query := r.db.Select(ctx, &clients).
		Where("id NOT IN (?)", diedClients).
		Limit(int(perPage)).
		Offset(int(offset))

	total, err := query.ScanAndCount(ctx, &clients)
	if err != nil {
		return nil, 0, fmt.Errorf("get clients: %w", err)
	}

	return clients, int64(total), nil
}

func (r *ClientsRepository) GetClientByID(ctx context.Context, id int64) (*models.Client, error) {
	var client struct {
		models.Client `bun:",extend"`
		LastServiceDt *time.Time `bun:"last_service_dt"`
	}

	lastVisitSubquery := r.db.Select(ctx, (*models.Service)(nil)).
		ColumnExpr("GREATEST(MAX(created_at), MAX(COALESCE(updated_at, '0000-00-00 00:00:00')))").
		Where("s.client_id = c.id")

	err := r.db.Select(ctx, &client).
		Column("c.birth_date").
		Column("c.firstname").
		Column("c.gender").
		Column("c.id").
		Column("c.is_blocked").
		Column("c.is_homeless").
		Column("c.lastname").
		Column("c.middlename").
		Column("c.photo_name").
		Column("c.blocked_reason").
		Column("c.updated_by_id").
		Column("c.created_by_id").
		ColumnExpr("(?) as last_service_dt", lastVisitSubquery).
		Where("c.id = ?", id).
		Scan(ctx)

	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, status.Errorf(codes.NotFound, "client not found")
		}
		return nil, fmt.Errorf("get client: %w", err)
	}

	client.Client.LastServiceDt = client.LastServiceDt

	return &client.Client, nil
}

func (r *ClientsRepository) CreateClient(ctx context.Context, client *models.Client) (*models.Client, error) {
	_, err := r.db.Insert(ctx, client).Exec(ctx)
	if err != nil {
		return nil, fmt.Errorf("create client: %w", err)
	}
	return client, nil
}

func (r *ClientsRepository) BlockClient(ctx context.Context, id int64, blockReason *string) (*models.Client, error) {
	client := &models.Client{}

	err := r.db.Select(ctx, client).Where("id = ?", id).Scan(ctx)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, status.Errorf(codes.NotFound, "client not found")
		}
		return nil, fmt.Errorf("get client: %w", err)
	}

	isBlocked := true
	_, err = r.db.Update(ctx, &models.Client{}).
		Set("is_blocked = ?", isBlocked).
		Set("blocked_reason = ?", blockReason).
		Where("id = ?", id).
		Exec(ctx)
	if err != nil {
		return nil, fmt.Errorf("block client: %w", err)
	}

	client.IsBlocked = &isBlocked
	return client, nil
}

func (r *ClientsRepository) UnblockClient(ctx context.Context, id int64) (*models.Client, error) {
	client := &models.Client{}

	err := r.db.Select(ctx, client).Where("id = ?", id).Scan(ctx)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, status.Errorf(codes.NotFound, "client not found")
		}
		return nil, fmt.Errorf("get client: %w", err)
	}

	isBlocked := false
	_, err = r.db.Update(ctx, &models.Client{}).
		Set("is_blocked = ?", isBlocked).
		Where("id = ?", id).
		Exec(ctx)
	if err != nil {
		return nil, fmt.Errorf("unblock client: %w", err)
	}

	client.IsBlocked = &isBlocked
	return client, nil
}

func (r *ClientsRepository) GetClientServices(ctx context.Context, clientID int64, page, perPage int32) ([]*models.ServiceTypes, int64, error) {
	var services []*models.ServiceTypes

	// CTE для получения последних дат получения услуг
	lastServiceDate := r.db.Select(ctx, (*models.Service)(nil)).
		ColumnExpr("type_id").
		ColumnExpr("GREATEST(MAX(created_at), MAX(COALESCE(updated_at, '0000-00-00 00:00:00'))) as last_service_date").
		Where("client_id = ?", clientID).
		Group("type_id")

	offset := (page - 1) * perPage
	query := r.db.Select(ctx, &services).
		Column("st.id").
		Column("st.name").
		Column("st.registration_available").
		Column("st.min_period_days").
		Join("LEFT JOIN (?) lsd ON st.id = lsd.type_id", lastServiceDate).
		Where("st.registration_available = true").
		WhereGroup(" AND ", func(q *bun.SelectQuery) *bun.SelectQuery {
			return q.
				WhereOr("lsd.last_service_date IS NULL").
				WhereOr("st.min_period_days IS NULL").
				WhereOr("st.min_period_days = 0").
				WhereOr("DATEDIFF(CURRENT_DATE, lsd.last_service_date) >= st.min_period_days")
		}).
		OrderExpr("st.sort ASC, st.name ASC").
		Limit(int(perPage)).
		Offset(int(offset))

	total, err := query.ScanAndCount(ctx, &services)
	if err != nil {
		return nil, 0, fmt.Errorf("get client services: %w", err)
	}

	return services, int64(total), nil
}
