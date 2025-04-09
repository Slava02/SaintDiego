package services

import (
	"context"
	"fmt"

	"github.com/Slava02/SaintDiego/backend/services/internal/models"
)

type IServiceRepository interface {
	GetServiceTypes(ctx context.Context, registrationAvailableFilter bool) ([]*models.ServiceType, error)
	GetServiceTypeById(ctx context.Context, id int64) (*models.ServiceType, error)
	UpdateServiceType(ctx context.Context, id int64, minPeriodDays int64, registrationAvailable bool) (*models.ServiceType, error)
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

func (u UseCase) GetServiceTypes(ctx context.Context, req *GetServicesParams) ([]*models.ServiceType, error) {
	return u.serviceRepository.GetServiceTypes(ctx, req.RegistrationAvailable)
}

func (u UseCase) GetServiceTypeById(ctx context.Context, id int64) (*models.ServiceType, error) {
	return u.serviceRepository.GetServiceTypeById(ctx, id)
}

func (u UseCase) UpdateServiceType(ctx context.Context, req *UpdateServiceTypeReq) (*models.ServiceType, error) {
	return u.serviceRepository.UpdateServiceType(ctx, req.ServiceTypeID, req.MinPeriodDays, req.RegistrationAvailable)
}
