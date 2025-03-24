package services_repo

import (
	"context"
	"fmt"

	"github.com/Slava02/SaintDiego/backend/events/internal/models"
	"github.com/uptrace/bun"
)

//go:generate options-gen -out-filename=services_repo_options.gen.go -from-struct=Options
type Options struct {
	DB *bun.DB `option:"mandatory" validate:"required"`
}

type ServiceRepository struct {
	db *bun.DB
}

func NewServiceRepository(opts Options) *ServiceRepository {
	return &ServiceRepository{db: opts.DB}
}

func (r *ServiceRepository) GetServices(ctx context.Context) ([]*models.ServiceType, error) {
	var services []*models.ServiceType

	err := r.db.NewSelect().Model(&services).Scan(ctx)
	if err != nil {
		return nil, fmt.Errorf("select services: %w", err)
	}

	return services, nil
}

func (r *ServiceRepository) GetServiceById(ctx context.Context, id int64) (*models.ServiceType, error) {
	service := &models.ServiceType{}

	err := r.db.NewSelect().Model(service).Where("id = ?", id).Scan(ctx)
	if err != nil {
		return nil, fmt.Errorf("select service by id: %w", err)
	}

	return service, nil
}
