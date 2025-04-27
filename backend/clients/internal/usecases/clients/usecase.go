package clients

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/Slava02/SaintDiego/backend/clients/internal/models"
	"github.com/Slava02/SaintDiego/backend/clients/internal/repositories/clients_repo"
	"github.com/Slava02/SaintDiego/backend/common/pointer"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
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

type IEventsClient interface {
	GetAvailableEventsForClientByServiceId(ctx context.Context, serviceID int64, clientID int64) ([]*models.Event, error)
}

const (
	ReinterviewClientAvailableServiceTypeID      = 20
	PrimaryInterviewClientAvailableServiceTypeID = 15
)

var (
	ErrClientNotFound      = errors.New("client not found")
	ErrServiceTypeNotFound = errors.New("service type not found")
)

//go:generate options-gen -out-filename=usecase_options.gen.go -from-struct=Options
type Options struct {
	ClientsRepository IClientsRepository `option:"mandatory" validate:"required"`
	ServicesClient    IServicesClient    `option:"mandatory" validate:"required"`
	EventsClient      IEventsClient      `option:"mandatory" validate:"required"`
}

type UseCase struct {
	clientsRepository IClientsRepository
	servicesClient    IServicesClient
	eventsClient      IEventsClient
}

func New(opts Options) (*UseCase, error) {
	if err := opts.Validate(); err != nil {
		return nil, fmt.Errorf("validate options: %w", err)
	}

	return &UseCase{
		clientsRepository: opts.ClientsRepository,
		servicesClient:    opts.ServicesClient,
		eventsClient:      opts.EventsClient,
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
		if errors.Is(err, clients_repo.ErrClientNotFound) {
			return nil, fmt.Errorf("get client by id: %w", ErrClientNotFound)
		}
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

	client, err := u.clientsRepository.CreateClient(ctx, client)
	if err != nil {
		return nil, fmt.Errorf("create client: %w", err)
	}

	return client, nil
}

func (u *UseCase) BlockClient(ctx context.Context, req *BlockClientReq) (*models.Client, error) {
	if req.IsBlocked {
		client, err := u.clientsRepository.BlockClient(ctx, req.ID, req.BlockReason)
		if err != nil {
			if errors.Is(err, clients_repo.ErrClientNotFound) {
				return nil, fmt.Errorf("block client: %w", ErrClientNotFound)
			}
			return nil, fmt.Errorf("block client: %w", err)
		}

		return client, nil
	}

	client, err := u.clientsRepository.UnblockClient(ctx, req.ID)
	if err != nil {
		if errors.Is(err, clients_repo.ErrClientNotFound) {
			return nil, fmt.Errorf("unblock client: %w", ErrClientNotFound)
		}
		return nil, fmt.Errorf("unblock client: %w", err)
	}

	return client, nil
}

// TODO: нужно вовзращать только услуги, на которые есть события для записи
func (u *UseCase) GetClientServices(ctx context.Context, req *GetClientServicesReq) ([]*models.ServiceTypes, int64, error) {

	client, err := u.clientsRepository.GetClientByID(ctx, req.ClientID)
	if err != nil {
		if errors.Is(err, clients_repo.ErrClientNotFound) {
			return nil, 0, fmt.Errorf("get client by id: %w", ErrClientNotFound)
		}
		return nil, 0, fmt.Errorf("get client by id: %w", err)
	}

	// Если клиент заблокирован или не посещал центр более года, то ему доступна услуга "Повторное собеседование"
	if pointer.Indirect(client.IsBlocked) || clientLastVisitMoreThanYearAgo(client) {
		serviceType, err := u.servicesClient.GetServiceTypeById(ctx, ReinterviewClientAvailableServiceTypeID)
		if err != nil {
			return nil, 0, fmt.Errorf("get service type by id: %w", err)
		}

		return []*models.ServiceTypes{serviceType}, 1, nil
	}

	// Если клиент новый, то ему доступна услуга "Первичное собеседование"
	if clientIsNew(client) {
		serviceType, err := u.servicesClient.GetServiceTypeById(ctx, PrimaryInterviewClientAvailableServiceTypeID)
		if err != nil {
			if e, ok := status.FromError(err); ok {
				switch e.Code() {
				case codes.NotFound:
					return nil, 0, fmt.Errorf("get service type by id: %w", ErrServiceTypeNotFound)
				}
			}

			return nil, 0, fmt.Errorf("get service type by id: %w", err)
		}

		return []*models.ServiceTypes{serviceType}, 1, nil
	}

	services, total, err := u.clientsRepository.GetClientServices(ctx, client.Id, req.Page, req.PerPage)
	if err != nil {
		if errors.Is(err, clients_repo.ErrClientNotFound) {
			return nil, 0, fmt.Errorf("get client services: %w", ErrClientNotFound)
		}
		return nil, 0, fmt.Errorf("get client services: %w", err)
	}

	availableServices := make([]*models.ServiceTypes, 0)
	var busyServices int64

	for _, service := range services {
		events, err := u.eventsClient.GetAvailableEventsForClientByServiceId(ctx, service.Id, client.Id)
		if err != nil {
			return nil, 0, fmt.Errorf("get events by service id: %w", err)
		}

		// Проверяем, есть ли хотя бы одно событие со свободными местами
		hasAvailableSpots := false
		for _, event := range events {
			if event.ParticipantsCount < event.Capacity {
				hasAvailableSpots = true
				break
			}
		}

		// Добавляем услугу только если есть хотя бы одно событие со свободными местами
		if hasAvailableSpots {
			availableServices = append(availableServices, service)
		} else {
			busyServices++
		}
	}

	// TODO: неправильно считается общее количество услуг

	return availableServices, total - busyServices, nil
}

func clientIsNew(client *models.Client) bool {
	return pointer.Indirect(client.UpdatedByID) == 0 && pointer.Indirect(client.CreatedByID) == 0
}

func clientLastVisitMoreThanYearAgo(client *models.Client) bool {
	var zeroTime time.Time
	return pointer.Indirect(client.LastServiceDt) != zeroTime && time.Since(*client.LastServiceDt) > 365*24*time.Hour
}
