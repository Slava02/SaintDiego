package clientv1

import "github.com/labstack/echo/v4"

func (h Handlers) PostTestHandler(eCtx echo.Context, _ PostTestHandlerParams) error {
	return eCtx.JSON(200, TestHandlerResponse{
		Answer: "Hello!",
	})
}
