package v1

import (
	"context"
	"net/http"

	"github.com/labstack/echo/v4"
)

type IAuthUC interface {
	Login(ctx context.Context, req *auth.LoginRequest) (*auth.LoginResponse, error)
	Logout(ctx context.Context, req *auth.LogoutRequest) error
}

func (h Handlers) PostLogin(ctx echo.Context) error {
	var req auth.LoginRequest
	if err := ctx.Bind(&req); err != nil {
		return ctx.JSON(http.StatusBadRequest, err.Error())
	}

	response, err := h.authUC.Login(ctx.Request().Context(), &req)
	if err != nil {
		return ctx.JSON(http.StatusInternalServerError, err.Error())
	}

	return ctx.JSON(http.StatusOK, LoginResponse{
		Token: response.Token,
	})
}

func (h Handlers) PostLogout(ctx echo.Context) error {
	var req auth.LogoutRequest
	if err := ctx.Bind(&req); err != nil {
		return ctx.JSON(http.StatusBadRequest, err.Error())
	}

	err := h.authUC.Logout(ctx.Request().Context(), &req)
	if err != nil {
		return ctx.JSON(http.StatusInternalServerError, err.Error())
	}

	return ctx.NoContent(http.StatusOK)
}
