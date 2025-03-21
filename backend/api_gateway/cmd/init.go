package main

import (
	"fmt"

	"github.com/getkin/kin-openapi/openapi3"
	"go.uber.org/zap"

	server "github.com/Slava02/SaintDiego/internal/server"
	v1 "github.com/Slava02/SaintDiego/internal/server/v1"
	locations "github.com/Slava02/SaintDiego/internal/usecases/locations"
	services "github.com/Slava02/SaintDiego/internal/usecases/services"
	timeSlots "github.com/Slava02/SaintDiego/internal/usecases/timeSlots"
)

const nameServer = "server-apigw"

func initServer(
	addr string,
	allowOrigins []string,
	v1Swagger *openapi3.T,
) (*server.Server, error) {
	lg := zap.L().Named(nameServer)

	timeSlotsUC, err := timeSlots.New(timeSlots.NewOptions())
	servicesUC, err := services.New(services.NewOptions())
	locationsUC, err := locations.New(locations.NewOptions())

	v1Handlers, err := v1.NewHandlers(v1.NewOptions(timeSlotsUC, locationsUC, servicesUC))
	if err != nil {
		return nil, fmt.Errorf("create v1 handlers: %v", err)
	}

	srv, err := server.New(server.NewOptions(
		lg,
		addr,
		allowOrigins,
		v1Swagger,
		v1Handlers,
	))
	if err != nil {
		return nil, fmt.Errorf("build server: %v", err)
	}

	return srv, nil
}
