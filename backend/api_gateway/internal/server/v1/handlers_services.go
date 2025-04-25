package v1

import (
	"context"
	"math"
	"net/http"

	"github.com/labstack/echo/v4"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"

	"github.com/Slava02/SaintDiego/backend/api_gateway/internal/models"
	"github.com/Slava02/SaintDiego/backend/api_gateway/internal/usecases/services"
)

type IServicesUC interface {
	GetServiceTypes(ctx context.Context, req *services.GetServicesParams) ([]*models.ServiceType, error)
	GetServiceTypeById(ctx context.Context, id int64) (*models.ServiceType, error)
	UpdateServiceType(ctx context.Context, req *services.UpdateServiceTypeReq) (*models.ServiceType, error)
}

func (h Handlers) GetServices(ctx echo.Context, params GetServicesParams) error {
	req := &services.GetServicesParams{
		RegistrationAvailable: params.RegistrationAvailable,
		Page:                  params.Page,
		PerPage:               params.PerPage,
	}

	services, err := h.servicesUC.GetServiceTypes(ctx.Request().Context(), req)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, Err("Internal server error", err.Error()))
	}

	total := len(services)
	totalPages := int32(math.Ceil(float64(total) / float64(req.PerPage)))

	return ctx.JSON(http.StatusOK, GetServicesResponse{
		Items:      convertServicesToResponse(services),
		Total:      int32(total),
		Page:       req.Page,
		PerPage:    req.PerPage,
		TotalPages: totalPages,
	})
}

func (h Handlers) GetServicesId(ctx echo.Context, id int64) error {
	service, err := h.servicesUC.GetServiceTypeById(ctx.Request().Context(), id)
	if err != nil {
		if e, ok := status.FromError(err); ok {
			switch e.Code() {
			case codes.NotFound:
				return ctx.JSON(http.StatusNotFound, Err("Service not found", err.Error()))
			default:
				return ctx.JSON(http.StatusInternalServerError, Err("Internal server error", err.Error()))
			}
		}

		return ctx.JSON(http.StatusInternalServerError, Err("Internal server error", err.Error()))
	}

	return ctx.JSON(http.StatusOK, service)
}

func (h Handlers) PutServicesId(ctx echo.Context, id int64) error {
	req := &services.UpdateServiceTypeReq{}
	if err := ctx.Bind(req); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, Err("Bad request", err.Error()))
	}

	req.ServiceTypeID = id

	serviceTypeSettings, err := h.servicesUC.UpdateServiceType(ctx.Request().Context(), req)
	if err != nil {
		if e, ok := status.FromError(err); ok {
			switch e.Code() {
			case codes.NotFound:
				return ctx.JSON(http.StatusNotFound, Err("Service not found", err.Error()))
			}
		}
		return echo.NewHTTPError(http.StatusInternalServerError, Err("Internal server error", err.Error()))
	}

	return ctx.JSON(http.StatusOK, serviceTypeSettings)
}

func convertServicesToResponse(services []*models.ServiceType) []ServiceType {
	response := make([]ServiceType, len(services))
	for i, service := range services {
		response[i] = ServiceType{
			Id:                    service.ID,
			Name:                  service.Name,
			MinPeriodDays:         int32(service.MinPeriodDays),
			RegistrationAvailable: service.RegistrationAvailable,
		}
	}
	return response
}
