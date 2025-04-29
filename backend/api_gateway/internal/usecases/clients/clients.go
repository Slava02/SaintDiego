package clients

import (
	"context"
	"errors"
	"fmt"

	"github.com/Slava02/SaintDiego/backend/api_gateway/internal/models"
	"github.com/Slava02/SaintDiego/backend/clients/pkg/pb"
	"github.com/Slava02/SaintDiego/backend/common/pointer"
)

type IClientsClient interface {
	GetClients(ctx context.Context, req *pb.GetClientsRequest) (*pb.GetClientsResponse, error)
	GetClientById(ctx context.Context, req *pb.GetClientByIdRequest) (*pb.Client, error)
	CreateClient(ctx context.Context, req *pb.CreateClientRequest) (*pb.Client, error)
	BlockClient(ctx context.Context, req *pb.BlockClientRequest) (*pb.Client, error)
	GetClientServices(ctx context.Context, req *pb.GetClientServicesRequest) (*pb.GetClientServicesResponse, error)
}

const (
	ReinterviewClientAvailableServiceTypeID      = 20
	PrimaryInterviewClientAvailableServiceTypeID = 15
	BlockedClientStatus                          = "BLOCKED"
	TooLongAgoClientStatus                       = "TOO_LONG_AGO"
)

var (
	ErrClientIsBlocked  = errors.New("client is blocked")
	ErrClientTooLongAgo = errors.New("client too long ago")
)

//go:generate options-gen -out-filename=usecase_options.gen.go -from-struct=Options
type Options struct {
	ClientsClient IClientsClient `option:"mandatory" validate:"required"`
}

type UseCase struct {
	clientsClient IClientsClient
}

func New(opts Options) (*UseCase, error) {
	if err := opts.Validate(); err != nil {
		return nil, fmt.Errorf("validate options: %w", err)
	}

	return &UseCase{
		clientsClient: opts.ClientsClient,
	}, nil
}

func (u *UseCase) GetClients(ctx context.Context, params *GetClientParams) ([]*models.Client, int32, error) {
	pbReq := &pb.GetClientsRequest{
		Page:    int64(params.Page),
		PerPage: int64(params.PerPage),
	}

	pbRes, err := u.clientsClient.GetClients(ctx, pbReq)
	if err != nil {
		return nil, 0, fmt.Errorf("get clients: %w", err)
	}

	clients := make([]*models.Client, len(pbRes.Clients))
	for i, client := range pbRes.Clients {
		clients[i] = convertClientToResponse(client)
	}

	return clients, int32(pbRes.Total), nil
}

func (u *UseCase) GetClientsId(ctx context.Context, id int64) (*models.Client, error) {
	pbReq := &pb.GetClientByIdRequest{
		Id: id,
	}

	pbRes, err := u.clientsClient.GetClientById(ctx, pbReq)
	if err != nil {
		return nil, fmt.Errorf("get client by id: %w", err)
	}

	return convertClientToResponse(pbRes), nil
}

func (u *UseCase) PostClients(ctx context.Context, req *CreateClientRequest) (*models.Client, error) {
	pbReq := &pb.CreateClientRequest{
		FirstName:  req.FirstName,
		MiddleName: req.MiddleName,
		LastName:   req.LastName,
	}

	pbRes, err := u.clientsClient.CreateClient(ctx, pbReq)
	if err != nil {
		return nil, fmt.Errorf("create client: %w", err)
	}

	return convertClientToResponse(pbRes), nil
}

func (u *UseCase) PutClientsId(ctx context.Context, req *BlockClientRequest) (*models.Client, error) {
	pbReq := &pb.BlockClientRequest{
		Id:          req.ID,
		IsBlocked:   req.IsBlocked,
		BlockReason: req.BlockReason,
	}

	pbRes, err := u.clientsClient.BlockClient(ctx, pbReq)
	if err != nil {
		return nil, fmt.Errorf("block client: %w", err)
	}

	return convertClientToResponse(pbRes), nil
}

func (u *UseCase) GetClientsIdServices(ctx context.Context, params *GetClientsIdServicesParams) ([]*models.ServiceType, int32, string, error) {
	pbReq := &pb.GetClientServicesRequest{
		Id:      params.ID,
		Page:    int64(params.Page),
		PerPage: int64(params.PerPage),
	}

	pbRes, err := u.clientsClient.GetClientServices(ctx, pbReq)
	if err != nil {
		return nil, 0, "", fmt.Errorf("get client services: %w", err)
	}

	services := make([]*models.ServiceType, len(pbRes.Services))
	for i, service := range pbRes.Services {
		services[i] = &models.ServiceType{
			ID:                    service.Id,
			Name:                  service.Name,
			MinPeriodDays:         service.MinPeriodDays,
			RegistrationAvailable: service.RegistrationAvailable,
		}
	}

	// TODO: это надо попрпавить, вынести на уровень сервис и поменять протом, пока просто возвращааю toolng и чекаю потом не blovked ли
	if len(services) == 1 {
		if services[0].ID == ReinterviewClientAvailableServiceTypeID {
			return services, int32(pbRes.Total), TooLongAgoClientStatus, nil
		}
	}

	return services, int32(pbRes.Total), "", nil
}

func convertClientToResponse(client *pb.Client) *models.Client {
	return &models.Client{
		Id:            client.Id,
		FirstName:     client.FirstName,
		MiddleName:    client.MiddleName,
		LastName:      client.LastName,
		BirthDate:     pointer.PtrWithZeroAsNil(client.BirthDate.AsTime()),
		Gender:        client.Gender,
		PhotoName:     client.PhotoName,
		IsHomeless:    client.IsHomeless,
		IsNew:         client.IsNew,
		IsBlocked:     client.IsBlocked,
		BlockedReason: client.BlockedReason,
	}
}
