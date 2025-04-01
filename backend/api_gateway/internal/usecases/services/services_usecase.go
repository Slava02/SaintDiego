package services

import (
	"context"
	"fmt"

	pb "github.com/Slava02/SaintDiego/backend/services/pkg/pb"

	"github.com/Slava02/SaintDiego/backend/api_gateway/internal/models"
)

type IServicesClient interface {
	CreateServiceTypeSettings(ctx context.Context, req *pb.CreateServiceTypeSettingsRequest) (*pb.ServiceTypeSettings, error)
	GetServices(ctx context.Context, req *pb.GetServicesRequest) (*pb.GetServicesResponse, error)
	GetServiceById(ctx context.Context, req *pb.GetServiceByIdRequest) (*pb.ServiceType, error)
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

func (u UseCase) GetServices(ctx context.Context) ([]*models.Service, error) {
	resp, err := u.servicesClient.GetServices(ctx, &pb.GetServicesRequest{})
	if err != nil {
		return nil, err
	}

	services := make([]*models.Service, len(resp.Services))
	for i, service := range resp.Services {
		services[i] = &models.Service{
			ID:          service.Id,
			Name:        service.Name,
			Description: &service.Description,
		}
	}

	return services, nil
}

func (u UseCase) GetServicesId(ctx context.Context, id int64) (*models.Service, error) {
	resp, err := u.servicesClient.GetServiceById(ctx, &pb.GetServiceByIdRequest{
		Id: id,
	})
	if err != nil {
		return nil, err
	}

	return &models.Service{
		ID:          resp.Id,
		Name:        resp.Name,
		Description: &resp.Description,
	}, nil
}

func (u UseCase) CreateServiceTypeSettings(ctx context.Context, req *CreateServiceTypeSettingsReq) (*models.ServiceTypeSettings, error) {
	resp, err := u.servicesClient.CreateServiceTypeSettings(ctx, &pb.CreateServiceTypeSettingsRequest{
		PeriodDays: req.PeriodDays,
	})
	if err != nil {
		return nil, err
	}

	return &models.ServiceTypeSettings{
		ID:            resp.Id,
		PeriodDays:    resp.PeriodDays,
		ServiceTypeID: resp.ServiceTypeId,
	}, nil
}
