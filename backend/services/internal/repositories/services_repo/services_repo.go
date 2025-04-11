package services_repo

import (
	"context"
	"fmt"

	"github.com/Slava02/SaintDiego/backend/common/storage"
	"github.com/Slava02/SaintDiego/backend/services/internal/models"
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

func (r *ServiceRepository) GetServiceTypes(ctx context.Context, registrationAvailableFilter bool) ([]*models.ServiceType, error) {
	var services []*models.ServiceType

	query := r.db.Select(ctx, &services)

	if registrationAvailableFilter {
		query = query.Where("registration_available = ?", registrationAvailableFilter)
	}

	err := query.Scan(ctx)

	if err != nil {
		return nil, fmt.Errorf("select services: %w", err)
	}

	return services, nil
}

func (r *ServiceRepository) GetServiceTypeById(ctx context.Context, id int64) (*models.ServiceType, error) {
	service := &models.ServiceType{}

	err := r.db.Select(ctx, service).
		Where("id = ?", id).
		Scan(ctx)
	if err != nil {
		return nil, fmt.Errorf("select service by id: %w", err)
	}

	return service, nil
}

func (r *ServiceRepository) UpdateServiceType(ctx context.Context, id int64, minPeriodDays int64, registrationAvailable bool) (*models.ServiceType, error) {
	serviceType := &models.ServiceType{}

	_, err := r.db.Update(ctx, serviceType).
		Model(serviceType).
		Set("min_period_days = ?", minPeriodDays).
		Set("registration_available = ?", registrationAvailable).
		Where("id = ?", id).
		Exec(ctx)
	if err != nil {
		return nil, fmt.Errorf("update service type: %w", err)
	}

	err = r.db.Select(ctx, serviceType).
		Where("id = ?", id).
		Scan(ctx)
	if err != nil {
		return nil, fmt.Errorf("select service type: %w", err)
	}

	return serviceType, nil
}
