package v1

import (
	"context"
	"net/http"

	"github.com/labstack/echo/v4"

	"github.com/Slava02/SaintDiego/backend/api_gateway/internal/models"
	"github.com/Slava02/SaintDiego/backend/api_gateway/internal/usecases/services"
	"github.com/Slava02/SaintDiego/backend/common/pointer"
)

type IServicesUC interface {
	GetServiceTypes(ctx context.Context, req *services.GetServicesParams) ([]*models.ServiceType, error)
	GetServiceTypeById(ctx context.Context, id int64) (*models.ServiceType, error)
	UpdateServiceType(ctx context.Context, req *services.UpdateServiceTypeReq) (*models.ServiceType, error)
}

func (h Handlers) GetServices(ctx echo.Context, params GetServicesParams) error {
	req := &services.GetServicesParams{
		RegistrationAvailable: pointer.Indirect(params.RegistrationAvailable),
	}

	services, err := h.servicesUC.GetServiceTypes(ctx.Request().Context(), req)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}

	return ctx.JSON(http.StatusOK, services)
}

func (h Handlers) GetServicesId(ctx echo.Context, id int64) error {
	service, err := h.servicesUC.GetServiceTypeById(ctx.Request().Context(), id)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}

	return ctx.JSON(http.StatusOK, service)
}

func (h Handlers) PutServicesId(ctx echo.Context, id int64) error {
	req := &services.UpdateServiceTypeReq{}
	if err := ctx.Bind(req); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}

	req.ServiceTypeID = id

	serviceTypeSettings, err := h.servicesUC.UpdateServiceType(ctx.Request().Context(), req)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}

	return ctx.JSON(http.StatusOK, serviceTypeSettings)
}
