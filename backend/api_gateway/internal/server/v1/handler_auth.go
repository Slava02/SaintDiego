package v1

import (
	"context"
	"net/http"

	"github.com/Slava02/SaintDiego/backend/api_gateway/internal/usecases/auth"
	"github.com/labstack/echo/v4"
)

type IAuthUC interface {
	Login(ctx context.Context, req *auth.LoginRequest) (*auth.LoginResponse, error)
}

func (h Handlers) PostLogin(ctx echo.Context) error {
	var req auth.LoginRequest
	if err := ctx.Bind(&req); err != nil {
		return ctx.JSON(http.StatusBadRequest, Err("Bad request", err.Error()))
	}

	response, err := h.authUC.Login(ctx.Request().Context(), &req)
	if err != nil {
		return ctx.JSON(http.StatusInternalServerError, Err("Internal server error", err.Error()))
	}

	return ctx.JSON(http.StatusOK, LoginResponse{
		Token: response.Token,
	})
}
