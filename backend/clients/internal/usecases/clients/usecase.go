package clients

import (
	"context"
	"fmt"

	"github.com/Slava02/SaintDiego/backend/clients/internal/models"
)

type IClientsRepository interface {
	GetClients(ctx context.Context, page, perPage int32) ([]*models.Client, int64, error)
	GetClientByID(ctx context.Context, id int64) (*models.Client, error)
	CreateClient(ctx context.Context, client *models.Client) (*models.Client, error)
	BlockClient(ctx context.Context, id int64, blockReason *string) (*models.Client, error)
	UnblockClient(ctx context.Context, id int64) (*models.Client, error)
	GetClientServices(ctx context.Context, clientID int64, page, perPage int32) ([]*models.ServiceTypes, int64, error)
}

//go:generate options-gen -out-filename=usecase_options.gen.go -from-struct=Options
type Options struct {
	ClientsRepository IClientsRepository `option:"mandatory" validate:"required"`
}

type UseCase struct {
	clientsRepository IClientsRepository
}

func New(opts Options) (*UseCase, error) {
	if err := opts.Validate(); err != nil {
		return nil, fmt.Errorf("validate options: %v", err)
	}

	return &UseCase{
		clientsRepository: opts.ClientsRepository,
	}, nil
}

func (u *UseCase) GetClients(ctx context.Context, req *GetClientsReq) ([]*models.Client, int64, error) {
	return u.clientsRepository.GetClients(ctx, req.Page, req.PerPage)
}

func (u *UseCase) GetClientByID(ctx context.Context, id int64) (*models.Client, error) {
	return u.clientsRepository.GetClientByID(ctx, id)
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
	return u.clientsRepository.GetClientServices(ctx, req.ClientID, req.Page, req.PerPage)
}
