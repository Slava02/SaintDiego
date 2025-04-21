package clients

import (
	"context"
	"fmt"
	"time"

	"github.com/Slava02/SaintDiego/backend/clients/internal/models"
	"github.com/Slava02/SaintDiego/backend/common/pointer"
)

type IClientsRepository interface {
	GetClients(ctx context.Context, page, perPage int32) ([]*models.Client, int64, error)
	GetClientByID(ctx context.Context, id int64) (*models.Client, error)
	CreateClient(ctx context.Context, client *models.Client) (*models.Client, error)
	BlockClient(ctx context.Context, id int64, blockReason *string) (*models.Client, error)
	UnblockClient(ctx context.Context, id int64) (*models.Client, error)
	GetClientServices(ctx context.Context, clientID int64, page, perPage int32) ([]*models.ServiceTypes, int64, error)
}

type IServicesClient interface {
	GetServiceTypeById(ctx context.Context, id int64) (*models.ServiceTypes, error)
}

const (
	ReinterviewClientAvailableServiceTypeID      = 20
	PrimaryInterviewClientAvailableServiceTypeID = 15
)

//go:generate options-gen -out-filename=usecase_options.gen.go -from-struct=Options
type Options struct {
	ClientsRepository IClientsRepository `option:"mandatory" validate:"required"`
	ServicesClient    IServicesClient    `option:"mandatory" validate:"required"`
}

type UseCase struct {
	clientsRepository IClientsRepository
	servicesClient    IServicesClient
}

func New(opts Options) (*UseCase, error) {
	if err := opts.Validate(); err != nil {
		return nil, fmt.Errorf("validate options: %v", err)
	}

	return &UseCase{
		clientsRepository: opts.ClientsRepository,
		servicesClient:    opts.ServicesClient,
	}, nil
}

func (u *UseCase) GetClients(ctx context.Context, req *GetClientsReq) ([]*models.Client, int64, error) {
	clients, total, err := u.clientsRepository.GetClients(ctx, req.Page, req.PerPage)
	if err != nil {
		return nil, 0, fmt.Errorf("get clients: %w", err)
	}

	for _, client := range clients {
		client.IsNew = clientIsNew(client)
	}

	return clients, total, nil
}

func (u *UseCase) GetClientByID(ctx context.Context, id int64) (*models.Client, error) {
	client, err := u.clientsRepository.GetClientByID(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("get client by id: %w", err)
	}

	client.IsNew = clientIsNew(client)
	return client, nil
}

func (u *UseCase) CreateClient(ctx context.Context, req *CreateClientReq) (*models.Client, error) {
	client := &models.Client{
		FirstName:  req.FirstName,
		LastName:   req.LastName,
		MiddleName: req.MiddleName,
	}

	return u.clientsRepository.CreateClient(ctx, client)
}

func (u *UseCase) BlockClient(ctx context.Context, req *BlockClientReq) (*models.Client, error) {
	if req.IsBlocked {
		return u.clientsRepository.BlockClient(ctx, req.ID, req.BlockReason)
	}

	return u.clientsRepository.UnblockClient(ctx, req.ID)
}

func (u *UseCase) GetClientServices(ctx context.Context, req *GetClientServicesReq) ([]*models.ServiceTypes, int64, error) {

	client, err := u.clientsRepository.GetClientByID(ctx, req.ClientID)
	if err != nil {
		return nil, 0, fmt.Errorf("get client by id: %w", err)
	}

	// Если клиент заблокирован или не посещал центр более года, то ему доступна услуга "Повторное собеседование"
	// TODO: тут нужно вернуть ошибку, что клиент заблокирован или не посещал центр более года
	if pointer.Indirect(client.IsBlocked) || clientLastVisitMoreThanYearAgo(client) {
		serviceType, err := u.servicesClient.GetServiceTypeById(ctx, ReinterviewClientAvailableServiceTypeID)
		if err != nil {
			return nil, 0, fmt.Errorf("get service type by id: %w", err)
		}

		return []*models.ServiceTypes{serviceType}, 1, nil
	}

	// Если клиент новый, то ему доступна услуга "Первичное собеседование"
	// TODO: тут нужно вернуть ошибку, что клиент новый
	if clientIsNew(client) {
		serviceType, err := u.servicesClient.GetServiceTypeById(ctx, PrimaryInterviewClientAvailableServiceTypeID)
		if err != nil {
			return nil, 0, fmt.Errorf("get service type by id: %w", err)
		}

		return []*models.ServiceTypes{serviceType}, 1, nil
	}

	services, total, err := u.clientsRepository.GetClientServices(ctx, client.Id, req.Page, req.PerPage)
	if err != nil {
		return nil, 0, fmt.Errorf("get client services: %w", err)
	}

	return services, total, nil
}

func clientIsNew(client *models.Client) bool {
	return pointer.Indirect(client.UpdatedByID) == 0 && pointer.Indirect(client.CreatedByID) == 0
}

func clientLastVisitMoreThanYearAgo(client *models.Client) bool {
	var zeroTime time.Time
	return pointer.Indirect(client.LastServiceDt) != zeroTime && time.Since(*client.LastServiceDt) > 365*24*time.Hour
}
