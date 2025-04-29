package v1

import (
	"context"
	"errors"

	"github.com/Slava02/SaintDiego/backend/clients/internal/models"
	"github.com/Slava02/SaintDiego/backend/clients/internal/usecases/clients"
	"github.com/Slava02/SaintDiego/backend/clients/pkg/pb"
	"github.com/opentracing/opentracing-go"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
	"google.golang.org/protobuf/types/known/timestamppb"
)

type IClientsUC interface {
	GetClients(ctx context.Context, req *clients.GetClientsReq) ([]*models.Client, int64, error)
	GetClientByID(ctx context.Context, id int64) (*models.Client, error)
	CreateClient(ctx context.Context, req *clients.CreateClientReq) (*models.Client, error)
	BlockClient(ctx context.Context, req *clients.BlockClientReq) (*models.Client, error)
	GetClientServices(ctx context.Context, req *clients.GetClientServicesReq) ([]*models.ServiceTypes, int64, error)
}

func (i *Implementation) GetClients(ctx context.Context, req *pb.GetClientsRequest) (*pb.GetClientsResponse, error) {
	span, ctx := opentracing.StartSpanFromContext(ctx, "GetClients")
	defer span.Finish()

	clients, total, err := i.clientsUC.GetClients(ctx, &clients.GetClientsReq{
		Page:    int32(req.Page),
		PerPage: int32(req.PerPage),
	})
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to get clients: %v", err)
	}

	pbClients := make([]*pb.Client, len(clients))
	for i, client := range clients {
		pbClients[i] = convertModelClientToPB(client)
	}

	return &pb.GetClientsResponse{
		Clients: pbClients,
		Total:   total,
	}, nil
}

func (i *Implementation) GetClientById(ctx context.Context, req *pb.GetClientByIdRequest) (*pb.Client, error) {
	span, ctx := opentracing.StartSpanFromContext(ctx, "GetClientById")
	defer span.Finish()

	span.SetTag("id", req.Id)

	client, err := i.clientsUC.GetClientByID(ctx, req.Id)
	if err != nil {
		switch {
		case errors.Is(err, clients.ErrClientNotFound):
			return nil, status.Errorf(codes.NotFound, "client not found")
		default:
			return nil, status.Errorf(codes.Internal, "failed to get client: %v", err)
		}
	}

	return convertModelClientToPB(client), nil
}

func (i *Implementation) CreateClient(ctx context.Context, req *pb.CreateClientRequest) (*pb.Client, error) {
	span, ctx := opentracing.StartSpanFromContext(ctx, "CreateClient")
	defer span.Finish()

	client, err := i.clientsUC.CreateClient(ctx, &clients.CreateClientReq{
		FirstName:  req.FirstName,
		LastName:   req.LastName,
		MiddleName: req.MiddleName,
	})
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to create client: %v", err)
	}

	return convertModelClientToPB(client), nil
}

func (i *Implementation) BlockClient(ctx context.Context, req *pb.BlockClientRequest) (*pb.Client, error) {
	span, ctx := opentracing.StartSpanFromContext(ctx, "BlockClient")
	defer span.Finish()

	span.SetTag("id", req.Id)

	client, err := i.clientsUC.BlockClient(ctx, &clients.BlockClientReq{
		ID:          req.Id,
		IsBlocked:   req.IsBlocked,
		BlockReason: req.BlockReason,
	})
	if err != nil {
		switch {
		case errors.Is(err, clients.ErrClientNotFound):
			return nil, status.Errorf(codes.NotFound, "client not found")
		default:
			return nil, status.Errorf(codes.Internal, "failed to block client: %v", err)
		}
	}

	return convertModelClientToPB(client), nil
}

func (i *Implementation) GetClientServices(ctx context.Context, req *pb.GetClientServicesRequest) (*pb.GetClientServicesResponse, error) {
	span, ctx := opentracing.StartSpanFromContext(ctx, "GetClientServices")
	defer span.Finish()

	span.SetTag("client_id", req.Id)

	services, total, err := i.clientsUC.GetClientServices(ctx, &clients.GetClientServicesReq{
		ClientID: req.Id,
		Page:     int32(req.Page),
		PerPage:  int32(req.PerPage),
	})
	if err != nil {
		switch {
		case errors.Is(err, clients.ErrClientNotFound):
			return nil, status.Errorf(codes.NotFound, "client not found")
		case errors.Is(err, clients.ErrServiceTypeNotFound):
			return nil, status.Errorf(codes.NotFound, "service type not found")
		case errors.Is(err, clients.ErrAlreadyBookedEvents):
			return nil, status.Errorf(codes.AlreadyExists, "client already booked events")
		default:
			return nil, status.Errorf(codes.Internal, "failed to get client services: %v", err)
		}
	}

	pbServices := make([]*pb.ServiceType, len(services))
	for i, service := range services {
		pbServices[i] = convertModelServiceTypeToPB(service)
	}

	return &pb.GetClientServicesResponse{
		Services: pbServices,
		Total:    total,
	}, nil
}

// Helper function to convert model client to protobuf client
func convertModelClientToPB(client *models.Client) *pb.Client {
	if client == nil {
		return nil
	}

	var birthDate *timestamppb.Timestamp
	if !client.BirthDate.IsZero() {
		birthDate = timestamppb.New(client.BirthDate)
	}

	return &pb.Client{
		Id:            client.Id,
		FirstName:     client.FirstName,
		LastName:      client.LastName,
		MiddleName:    client.MiddleName,
		BirthDate:     birthDate,
		Gender:        client.Gender,
		IsBlocked:     client.IsBlocked,
		IsHomeless:    client.IsHomeless,
		IsNew:         client.IsNew,
		PhotoName:     client.PhotoName,
		BlockedReason: client.BlockedReason,
	}
}

func convertModelServiceTypeToPB(service *models.ServiceTypes) *pb.ServiceType {
	return &pb.ServiceType{
		Id:                    service.Id,
		Name:                  service.Name,
		RegistrationAvailable: service.RegistrationAvailable,
		MinPeriodDays:         int64(service.MinPeriodDays),
	}
}
