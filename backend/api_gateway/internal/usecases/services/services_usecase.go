package timeSlot

import (
	"context"
	"fmt"

	pb "github.com/Slava02/SaintDiego/backend/events/pkg/pb"
	"google.golang.org/grpc"

	"github.com/Slava02/SaintDiego/backend/api_gateway/internal/models"
)

//go:generate options-gen -out-filename=usecase_options.gen.go -from-struct=Options
type Options struct {
	EventsClient IEventsClient `option:"mandatory" validate:"required"`
}

type UseCase struct {
	eventsClient IEventsClient
}

func New(opts Options) (*UseCase, error) {
	if err := opts.Validate(); err != nil {
		return nil, fmt.Errorf("validate options: %v", err)
	}

	return &UseCase{
		eventsClient: opts.EventsClient,
	}, nil
}

type IEventsClient interface {
	GetServices(ctx context.Context, req *pb.GetServicesRequest, opts ...grpc.CallOption) (*pb.GetServicesResponse, error)
	GetServiceById(ctx context.Context, req *pb.GetServiceByIdRequest, opts ...grpc.CallOption) (*pb.ServiceType, error)
}

func (u UseCase) GetServices(ctx context.Context) ([]*models.Service, error) {
	resp, err := u.eventsClient.GetServices(ctx, &pb.GetServicesRequest{})
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
	resp, err := u.eventsClient.GetServiceById(ctx, &pb.GetServiceByIdRequest{
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
