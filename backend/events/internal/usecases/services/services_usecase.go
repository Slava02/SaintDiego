package services

import (
	"context"
	"fmt"

	"github.com/Slava02/SaintDiego/backend/events/internal/models"
)

type IServiceRepository interface {
	GetServices(ctx context.Context) ([]*models.ServiceType, error)
	GetServiceById(ctx context.Context, id int64) (*models.ServiceType, error)
}

//go:generate options-gen -out-filename=usecase_options.gen.go -from-struct=Options
type Options struct {
	ServiceRepository IServiceRepository `option:"mandatory" validate:"required"`
}

type UseCase struct {
	serviceRepository IServiceRepository
}

func New(opts Options) (*UseCase, error) {
	if err := opts.Validate(); err != nil {
		return nil, fmt.Errorf("validate options: %v", err)
	}

	return &UseCase{
		serviceRepository: opts.ServiceRepository,
	}, nil
}

func (u UseCase) GetServices(ctx context.Context) ([]*models.ServiceType, error) {
	return u.serviceRepository.GetServices(ctx)
}

func (u UseCase) GetServicesId(ctx context.Context, id int64) (*models.ServiceType, error) {
	return u.serviceRepository.GetServiceById(ctx, id)
}
