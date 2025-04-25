package v1

import (
	"context"
	"math"
	"net/http"

	"github.com/Slava02/SaintDiego/backend/api_gateway/internal/models"
	"github.com/Slava02/SaintDiego/backend/api_gateway/internal/usecases/clients"
	"github.com/labstack/echo/v4"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
)

type IClientUC interface {
	GetClients(ctx context.Context, params *clients.GetClientParams) ([]*models.Client, int32, error)
	PostClients(ctx context.Context, req *clients.CreateClientRequest) (*models.Client, error)
	GetClientsId(ctx context.Context, id int64) (*models.Client, error)
	PutClientsId(ctx context.Context, req *clients.BlockClientRequest) (*models.Client, error)
	GetClientsIdServices(ctx context.Context, params *clients.GetClientsIdServicesParams) ([]*models.ServiceType, int32, error)
}

func (h Handlers) GetClients(ctx echo.Context, params GetClientsParams) error {
	var req clients.GetClientParams
	if err := ctx.Bind(&req); err != nil {
		return ctx.JSON(http.StatusBadRequest, Err("Bad request", err.Error()))
	}

	clients, total, err := h.clientUC.GetClients(ctx.Request().Context(), &req)
	if err != nil {
		return ctx.JSON(http.StatusInternalServerError, Err("Internal server error", err.Error()))
	}

	totalPages := int32(math.Ceil(float64(total) / float64(req.PerPage)))

	return ctx.JSON(http.StatusOK, GetClientsResponse{
		Clients:    convertClientsToResponse(clients),
		Total:      int32(total),
		Page:       req.Page,
		PerPage:    req.PerPage,
		TotalPages: totalPages,
	})
}

func (h Handlers) PostClients(ctx echo.Context) error {
	var req clients.CreateClientRequest
	if err := ctx.Bind(&req); err != nil {
		return ctx.JSON(http.StatusBadRequest, Err("Bad request", err.Error()))
	}

	client, err := h.clientUC.PostClients(ctx.Request().Context(), &req)
	if err != nil {
		return ctx.JSON(http.StatusInternalServerError, Err("Internal server error", err.Error()))
	}

	return ctx.JSON(http.StatusCreated, convertClientToResponse(client))
}

func (h Handlers) GetClientsId(ctx echo.Context, id int64) error {
	client, err := h.clientUC.GetClientsId(ctx.Request().Context(), id)
	if err != nil {
		switch status.Code(err) {
		case codes.NotFound:
			return ctx.JSON(http.StatusNotFound, Err("Client not found", err.Error()))
		default:
			return ctx.JSON(http.StatusInternalServerError, Err("Internal server error", err.Error()))
		}
	}

	return ctx.JSON(http.StatusOK, convertClientToResponse(client))
}

func (h Handlers) PutClientsId(ctx echo.Context, id int64) error {
	var req clients.BlockClientRequest
	if err := ctx.Bind(&req); err != nil {
		return ctx.JSON(http.StatusBadRequest, Err("Bad request", err.Error()))
	}

	req.ID = id

	client, err := h.clientUC.PutClientsId(ctx.Request().Context(), &req)
	if err != nil {
		switch status.Code(err) {
		case codes.NotFound:
			return ctx.JSON(http.StatusNotFound, Err("Client not found", err.Error()))
		default:
			return ctx.JSON(http.StatusInternalServerError, Err("Internal server error", err.Error()))
		}
	}

	return ctx.JSON(http.StatusOK, convertClientToResponse(client))
}

func (h Handlers) GetClientsIdServices(ctx echo.Context, id int64, params GetClientsIdServicesParams) error {
	var req clients.GetClientsIdServicesParams
	if err := ctx.Bind(&req); err != nil {
		return ctx.JSON(http.StatusBadRequest, Err("Bad request", err.Error()))
	}

	req.ID = id

	services, total, err := h.clientUC.GetClientsIdServices(ctx.Request().Context(), &req)
	if err != nil {
		switch status.Code(err) {
		case codes.NotFound:
			return ctx.JSON(http.StatusNotFound, Err("Client not found", err.Error()))
		default:
			return ctx.JSON(http.StatusInternalServerError, Err("Internal server error", err.Error()))
		}
	}

	return ctx.JSON(http.StatusOK, GetServicesResponse{
		Items:      convertServicesToResponse(services),
		Total:      int32(total),
		Page:       req.Page,
		PerPage:    req.PerPage,
		TotalPages: int32(math.Ceil(float64(total) / float64(req.PerPage))),
	})
}

func convertClientsToResponse(clients []*models.Client) []Client {
	response := make([]Client, len(clients))
	for i, client := range clients {
		response[i] = convertClientToResponse(client)
	}

	return response
}

func convertClientToResponse(client *models.Client) Client {
	return Client{
		Id:            client.Id,
		FirstName:     client.FirstName,
		LastName:      client.LastName,
		MiddleName:    client.MiddleName,
		BirthDate:     client.BirthDate,
		Gender:        client.Gender,
		PhotoName:     client.PhotoName,
		IsBlocked:     client.IsBlocked,
		IsNew:         client.IsNew,
		IsHomeless:    client.IsHomeless,
		BlockedReason: client.BlockedReason,
	}
}
