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
	GetServices(ctx context.Context) ([]*models.ServiceType, error)
	GetServicesId(ctx context.Context, id int64) (*models.ServiceType, error)
	CreateServiceTypeSettings(ctx context.Context, req *services.CreateServiceTypeSettingsRequest) (*models.ServiceTypeSettings, error)
}

func (i *Implementation) GetServices(ctx context.Context, _ *pb.GetServicesRequest) (*pb.GetServicesResponse, error) {
	span, ctx := opentracing.StartSpanFromContext(ctx, "GetServices")
	defer span.Finish()

	services, err := i.servicesUC.GetServices(ctx)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to get services: %v", err)
	}

	pbServices := make([]*pb.ServiceType, len(services))
	for i, service := range services {
		pbServices[i] = &pb.ServiceType{
			Id:          service.ID,
			Name:        service.Name,
			Description: "", // Not used in the current implementation
		}
	}

	return &pb.GetServicesResponse{
		Services: pbServices,
	}, nil
}

func (i *Implementation) GetServiceById(ctx context.Context, req *pb.GetServiceByIdRequest) (*pb.ServiceType, error) {
	span, ctx := opentracing.StartSpanFromContext(ctx, "GetServiceById")
	defer span.Finish()

	span.SetTag("id", req.Id)

	service, err := i.servicesUC.GetServicesId(ctx, req.Id)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to get service: %v", err)
	}

	return &pb.ServiceType{
		Id:          service.ID,
		Name:        service.Name,
		Description: "", // Not used in the current implementation
	}, nil
}

func (i *Implementation) CreateServiceTypeSettings(ctx context.Context, req *pb.CreateServiceTypeSettingsRequest) (*pb.ServiceTypeSettings, error) {
	span, ctx := opentracing.StartSpanFromContext(ctx, "CreateServiceTypeSettings")
	defer span.Finish()

	serviceTypeSettings, err := i.servicesUC.CreateServiceTypeSettings(ctx, &services.CreateServiceTypeSettingsRequest{
		ServiceTypeID: req.ServiceTypeId,
		PeriodDays:    req.PeriodDays,
	})
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to create service type settings: %v", err)
	}

	return &pb.ServiceTypeSettings{
		Id:            serviceTypeSettings.ID,
		ServiceTypeId: serviceTypeSettings.ServiceTypeID,
		PeriodDays:    serviceTypeSettings.PeriodDays,
	}, nil
}
