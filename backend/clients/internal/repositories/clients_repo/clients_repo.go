package clients_repo

import (
	"context"
	"database/sql"
	"errors"
	"fmt"

	"github.com/Slava02/SaintDiego/backend/clients/internal/models"
	"github.com/Slava02/SaintDiego/backend/common/storage"
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

	offset := (page - 1) * perPage
	query := r.db.Select(ctx, &clients).
		Limit(int(perPage)).
		Offset(int(offset))

	total, err := query.ScanAndCount(ctx, &clients)
	if err != nil {
		return nil, 0, fmt.Errorf("get clients: %w", err)
	}

	return clients, int64(total), nil
}

func (r *ClientsRepository) GetClientByID(ctx context.Context, id int64) (*models.Client, error) {
	var client models.Client
	err := r.db.Select(ctx, &client).Where("id = ?", id).Scan(ctx)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, status.Errorf(codes.NotFound, "client not found")
		}
		return nil, fmt.Errorf("get client: %w", err)
	}
	return &client, nil
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
		Set("block_reason = ?", blockReason).
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

	offset := (page - 1) * perPage
	query := r.db.Select(ctx, &services).
		Join("JOIN client_service cs ON cs.service_type_id = st.id").
		Where("cs.client_id = ?", clientID).
		Limit(int(perPage)).
		Offset(int(offset))

	total, err := query.ScanAndCount(ctx, &services)
	if err != nil {
		return nil, 0, fmt.Errorf("get client services: %w", err)
	}

	return services, int64(total), nil
}
