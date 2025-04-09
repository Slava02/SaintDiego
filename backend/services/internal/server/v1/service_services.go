package v1

import (
	"context"

	"github.com/Slava02/SaintDiego/backend/services/internal/models"
	"github.com/Slava02/SaintDiego/backend/services/internal/usecases/services"
	"github.com/Slava02/SaintDiego/backend/services/pkg/pb"
	"github.com/opentracing/opentracing-go"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
)

type IServicesUC interface {
	GetServiceTypes(ctx context.Context, req *services.GetServicesParams) ([]*models.ServiceType, error)
	GetServiceTypeById(ctx context.Context, id int64) (*models.ServiceType, error)
	UpdateServiceType(ctx context.Context, req *services.UpdateServiceTypeReq) (*models.ServiceType, error)
}

func (i *Implementation) GetServiceTypes(ctx context.Context, req *pb.GetServiceTypesRequest) (*pb.GetServiceTypesResponse, error) {
	span, ctx := opentracing.StartSpanFromContext(ctx, "GetServiceTypes")
	defer span.Finish()

	services, err := i.servicesUC.GetServiceTypes(ctx, &services.GetServicesParams{
		RegistrationAvailable: req.RegistrationAvailable,
	})
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to get services: %v", err)
	}

	pbServices := make([]*pb.ServiceType, len(services))
	for i, service := range services {
		pbServices[i] = &pb.ServiceType{
			Id:                    service.ID,
			Name:                  service.Name,
			MinPeriodDays:         service.MinPeriodDays,
			RegistrationAvailable: service.RegistrationAvailable,
		}
	}

	return &pb.GetServiceTypesResponse{
		ServiceTypes: pbServices,
	}, nil
}

func (i *Implementation) GetServiceTypeById(ctx context.Context, req *pb.GetServiceTypeByIdRequest) (*pb.ServiceType, error) {
	span, ctx := opentracing.StartSpanFromContext(ctx, "GetServiceTypeById")
	defer span.Finish()

	span.SetTag("id", req.Id)

	service, err := i.servicesUC.GetServiceTypeById(ctx, req.Id)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to get service: %v", err)
	}

	return &pb.ServiceType{
		Id:                    service.ID,
		Name:                  service.Name,
		MinPeriodDays:         service.MinPeriodDays,
		RegistrationAvailable: service.RegistrationAvailable,
	}, nil
}

func (i *Implementation) UpdateServiceType(ctx context.Context, req *pb.UpdateServiceTypeRequest) (*pb.ServiceType, error) {
	span, ctx := opentracing.StartSpanFromContext(ctx, "UpdateServiceType")
	defer span.Finish()

	serviceType, err := i.servicesUC.UpdateServiceType(ctx, &services.UpdateServiceTypeReq{
		ServiceTypeID:         req.Id,
		MinPeriodDays:         req.MinPeriodDays,
		RegistrationAvailable: req.RegistrationAvailable,
	})
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to update service type: %v", err)
	}

	return &pb.ServiceType{
		Id:                    serviceType.ID,
		Name:                  serviceType.Name,
		MinPeriodDays:         serviceType.MinPeriodDays,
		RegistrationAvailable: serviceType.RegistrationAvailable,
	}, nil
}
