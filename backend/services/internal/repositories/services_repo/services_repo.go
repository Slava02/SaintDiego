package services_repo

import (
	"context"
	"fmt"

	"github.com/Slava02/SaintDiego/backend/services/internal/models"
	"github.com/Slava02/SaintDiego/backend/services/internal/storage"
)

//go:generate options-gen -out-filename=services_repo_options.gen.go -from-struct=Options
type Options struct {
	DB *storage.Database `option:"mandatory" validate:"required"`
}

type ServiceRepository struct {
	db *storage.Database
}

func NewServiceRepository(opts Options) *ServiceRepository {
	return &ServiceRepository{db: opts.DB}
}

func (r *ServiceRepository) GetServices(ctx context.Context) ([]*models.ServiceType, error) {
	var services []*models.ServiceType

	err := r.db.Select(ctx, &services).Scan(ctx)
	if err != nil {
		return nil, fmt.Errorf("select services: %w", err)
	}

	return services, nil
}

func (r *ServiceRepository) GetServiceById(ctx context.Context, id int64) (*models.ServiceType, error) {
	service := &models.ServiceType{}

	err := r.db.Select(ctx, service).
		Where("id = ?", id).
		Scan(ctx)
	if err != nil {
		return nil, fmt.Errorf("select service by id: %w", err)
	}

	return service, nil
}

func (r *ServiceRepository) CreateServiceTypeSettings(ctx context.Context, req *models.ServiceTypeSettings) (*models.ServiceTypeSettings, error) {
	serviceTypeSettings := &models.ServiceTypeSettings{}

	err := r.db.Insert(ctx, serviceTypeSettings).
		Model(req).
		Scan(ctx)
	if err != nil {
		return nil, fmt.Errorf("insert service type settings: %w", err)
	}

	return serviceTypeSettings, nil
}
