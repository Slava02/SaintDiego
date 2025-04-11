package services

import (
	"context"
	"fmt"

	pb "github.com/Slava02/SaintDiego/backend/services/pkg/pb"

	"github.com/Slava02/SaintDiego/backend/api_gateway/internal/models"
)

type IServicesClient interface {
	GetServiceTypes(ctx context.Context, req *pb.GetServiceTypesRequest) (*pb.GetServiceTypesResponse, error)
	GetServiceTypeById(ctx context.Context, req *pb.GetServiceTypeByIdRequest) (*pb.ServiceType, error)
	UpdateServiceType(ctx context.Context, req *pb.UpdateServiceTypeRequest) (*pb.ServiceType, error)
}

//go:generate options-gen -out-filename=usecase_options.gen.go -from-struct=Options
type Options struct {
	ServicesClient IServicesClient `option:"mandatory" validate:"required"`
}

type UseCase struct {
	servicesClient IServicesClient
}

func New(opts Options) (*UseCase, error) {
	if err := opts.Validate(); err != nil {
		return nil, fmt.Errorf("validate options: %v", err)
	}

	return &UseCase{
		servicesClient: opts.ServicesClient,
	}, nil
}

func (u UseCase) GetServiceTypes(ctx context.Context, req *GetServicesParams) ([]*models.ServiceType, error) {
	resp, err := u.servicesClient.GetServiceTypes(ctx, &pb.GetServiceTypesRequest{
		RegistrationAvailable: req.RegistrationAvailable,
		Page:                  req.Page,
		PerPage:               req.PerPage,
	})
	if err != nil {
		return nil, err
	}

	services := make([]*models.ServiceType, len(resp.ServiceTypes))
	for i, service := range resp.ServiceTypes {
		services[i] = &models.ServiceType{
			ID:                    service.Id,
			Name:                  service.Name,
			MinPeriodDays:         service.MinPeriodDays,
			RegistrationAvailable: service.RegistrationAvailable,
		}
	}

	return services, nil
}

func (u UseCase) GetServiceTypeById(ctx context.Context, id int64) (*models.ServiceType, error) {
	resp, err := u.servicesClient.GetServiceTypeById(ctx, &pb.GetServiceTypeByIdRequest{
		Id: id,
	})
	if err != nil {
		return nil, err
	}

	return &models.ServiceType{
		ID:                    resp.Id,
		Name:                  resp.Name,
		MinPeriodDays:         resp.MinPeriodDays,
		RegistrationAvailable: resp.RegistrationAvailable,
	}, nil
}

func (u UseCase) UpdateServiceType(ctx context.Context, req *UpdateServiceTypeReq) (*models.ServiceType, error) {
	resp, err := u.servicesClient.UpdateServiceType(ctx, &pb.UpdateServiceTypeRequest{
		Id:                    req.ServiceTypeID,
		MinPeriodDays:         req.MinPeriodDays,
		RegistrationAvailable: req.RegistrationAvailable,
	})
	if err != nil {
		return nil, err
	}

	return &models.ServiceType{
		ID:                    resp.Id,
		Name:                  resp.Name,
		MinPeriodDays:         resp.MinPeriodDays,
		RegistrationAvailable: resp.RegistrationAvailable,
	}, nil
}
