package v1

import (
	"net/http"

	"github.com/labstack/echo/v4"

	"github.com/Slava02/SaintDiego/internal/models"
)

// TODO: Добавить пагинацию.
//
//nolint:godox // Legitimate TODO for future implementation
func (h *Handlers) GetLocations(ctx echo.Context) error {
	response, err := h.scheduleUseCase.GetLocations(ctx.Request().Context())
	if err != nil {
		return ctx.JSON(http.StatusInternalServerError, err.Error())
	}

	return ctx.JSON(http.StatusOK, response)
}

func (h *Handlers) PostLocations(ctx echo.Context) error {
	var req PostLocationsJSONRequestBody
	if err := ctx.Bind(&req); err != nil {
		return ctx.JSON(http.StatusBadRequest, err.Error())
	}

	response, err := h.scheduleUseCase.CreateLocation(ctx.Request().Context(), &models.CreateLocationRequest{
		Name:    req.Name,
		Address: req.Address,
	})
	if err != nil {
		return ctx.JSON(http.StatusInternalServerError, err.Error())
	}

	return ctx.JSON(http.StatusCreated, response)
}
