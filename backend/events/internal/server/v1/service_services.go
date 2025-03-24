package v1

import (
	"context"

	"github.com/Slava02/SaintDiego/backend/events/internal/models"
	"github.com/Slava02/SaintDiego/backend/events/pkg/pb"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
)

type IServicesUC interface {
	GetServices(ctx context.Context) ([]*models.ServiceType, error)
	GetServicesId(ctx context.Context, id int64) (*models.ServiceType, error)
}

func (i *Implementation) GetServices(ctx context.Context, _ *pb.GetServicesRequest) (*pb.GetServicesResponse, error) {
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
