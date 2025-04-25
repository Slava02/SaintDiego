package services

import (
	"context"
	"errors"
	"fmt"

	"github.com/Slava02/SaintDiego/backend/services/internal/models"
	"github.com/Slava02/SaintDiego/backend/services/internal/repositories/services_repo"
)

type IServiceRepository interface {
	GetServiceTypes(ctx context.Context, registrationAvailableFilter *bool, page, perPage int32) ([]*models.ServiceType, error)
	GetServiceTypeById(ctx context.Context, id int64) (*models.ServiceType, error)
	UpdateServiceType(ctx context.Context, id int64, minPeriodDays int64, registrationAvailable bool) (*models.ServiceType, error)
}

var (
	ErrServiceTypeNotFound = errors.New("service type not found")
)

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
	serviceTypes, err := u.serviceRepository.GetServiceTypes(ctx, req.RegistrationAvailable, req.Page, req.PerPage)
	if err != nil {
		return nil, fmt.Errorf("get service types: %w", err)
	}

	return serviceTypes, nil
}

func (u UseCase) GetServiceTypeById(ctx context.Context, id int64) (*models.ServiceType, error) {
	serviceType, err := u.serviceRepository.GetServiceTypeById(ctx, id)
	if err != nil {
		if errors.Is(err, services_repo.ErrServiceTypeNotFound) {
			return nil, fmt.Errorf("get service type by id: %w", ErrServiceTypeNotFound)
		}
		return nil, fmt.Errorf("get service type by id: %w", err)
	}

	return serviceType, nil
}

func (u UseCase) UpdateServiceType(ctx context.Context, req *UpdateServiceTypeReq) (*models.ServiceType, error) {
	_, err := u.GetServiceTypeById(ctx, req.ServiceTypeID)
	if err != nil {
		return nil, fmt.Errorf("get service type by id: %w", err)
	}

	serviceType, err := u.serviceRepository.UpdateServiceType(ctx, req.ServiceTypeID, req.MinPeriodDays, req.RegistrationAvailable)
	if err != nil {
		return nil, fmt.Errorf("update service type: %w", err)
	}

	return serviceType, nil
}
