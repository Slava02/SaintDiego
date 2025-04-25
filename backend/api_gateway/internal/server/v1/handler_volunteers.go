package v1

import (
	"context"
	"net/http"

	"github.com/Slava02/SaintDiego/backend/api_gateway/internal/models"
	"github.com/Slava02/SaintDiego/backend/api_gateway/internal/usecases/volunteers"
	"github.com/labstack/echo/v4"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
)

type IVolunteerUC interface {
	PostVolunteers(ctx context.Context, req *volunteers.CreateVolunteerRequest) (*models.Volunteer, error)
	GetVolunteersTgId(ctx context.Context, tgId int64) (*models.Volunteer, error)
	PutVolunteersTgId(ctx context.Context, req *volunteers.UpdateVolunteerRequest) (*models.Volunteer, error)
}

func (h Handlers) PostVolunteers(ctx echo.Context) error {
	var req volunteers.CreateVolunteerRequest
	if err := ctx.Bind(&req); err != nil {
		return ctx.JSON(http.StatusBadRequest, Err("Bad request", err.Error()))
	}

	volunteer, err := h.volunteerUC.PostVolunteers(ctx.Request().Context(), &req)
	if err != nil {
		return ctx.JSON(http.StatusInternalServerError, Err("Internal server error", err.Error()))
	}

	return ctx.JSON(http.StatusCreated, convertVolunteerToResponse(volunteer))
}

func (h Handlers) GetVolunteersTgId(ctx echo.Context, tgId int64) error {
	volunteer, err := h.volunteerUC.GetVolunteersTgId(ctx.Request().Context(), tgId)
	if err != nil {
		if e, ok := status.FromError(err); ok {
			switch e.Code() {
			case codes.NotFound:
				return ctx.JSON(http.StatusNotFound, Err("Volunteer not found", ""))
			default:
				return ctx.JSON(http.StatusInternalServerError, Err("Internal server error", err.Error()))
			}
		}

		return ctx.JSON(http.StatusInternalServerError, Err("Internal server error", err.Error()))
	}

	return ctx.JSON(http.StatusOK, convertVolunteerToResponse(volunteer))
}

func (h Handlers) PutVolunteersTgId(ctx echo.Context, tgId int64) error {
	var req volunteers.UpdateVolunteerRequest
	if err := ctx.Bind(&req); err != nil {
		return ctx.JSON(http.StatusBadRequest, Err("Bad request", err.Error()))
	}

	req.TgId = tgId

	volunteer, err := h.volunteerUC.PutVolunteersTgId(ctx.Request().Context(), &req)
	if err != nil {
		if e, ok := status.FromError(err); ok {
			switch e.Code() {
			case codes.NotFound:
				return ctx.JSON(http.StatusNotFound, Err("Volunteer not found", ""))
			default:
				return ctx.JSON(http.StatusInternalServerError, Err("Internal server error", err.Error()))
			}
		}

		return ctx.JSON(http.StatusInternalServerError, Err("Internal server error", err.Error()))
	}

	return ctx.JSON(http.StatusOK, convertVolunteerToResponse(volunteer))
}

func convertVolunteerToResponse(volunteer *models.Volunteer) Volunteer {
	return Volunteer{
		TgId:       volunteer.TgId,
		TgLogin:    volunteer.TgLogin,
		FirstName:  volunteer.FirstName,
		LastName:   volunteer.LastName,
		MiddleName: volunteer.MiddleName,
	}
}
