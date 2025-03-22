package main

import (
	"fmt"

	"github.com/Slava02/SaintDiego/backend/api_gateway/pkg/closer"
	"github.com/getkin/kin-openapi/openapi3"
	"go.uber.org/zap"

	grpc_services "github.com/Slava02/SaintDiego/backend/api_gateway/internal/clients/grpc-services"
	server "github.com/Slava02/SaintDiego/backend/api_gateway/internal/server"
	v1 "github.com/Slava02/SaintDiego/backend/api_gateway/internal/server/v1"
	locations "github.com/Slava02/SaintDiego/backend/api_gateway/internal/usecases/locations"
	services "github.com/Slava02/SaintDiego/backend/api_gateway/internal/usecases/services"
	timeSlots "github.com/Slava02/SaintDiego/backend/api_gateway/internal/usecases/timeSlots"
)

const nameServer = "server-apigw"

func initServer(
	addr string,
	allowOrigins []string,
	v1Swagger *openapi3.T,
	eventsAddr string,
) (*server.Server, error) {
	lg := zap.L().Named(nameServer)

	// Create gRPC client manager
	manager, err := grpc_services.NewManager(grpc_services.NewManagerOptions(eventsAddr))
	if err != nil {
		return nil, fmt.Errorf("failed to create gRPC client manager: %v", err)
	}
	closer.Add(manager.Close)

	timeSlotsUC, err := timeSlots.New(timeSlots.NewOptions(manager.Events()))
	if err != nil {
		return nil, fmt.Errorf("create timeSlots usecase: %v", err)
	}

	servicesUC, err := services.New(services.NewOptions(manager.Events()))
	if err != nil {
		return nil, fmt.Errorf("create services usecase: %v", err)
	}

	locationsUC, err := locations.New(locations.NewOptions(manager.Events()))
	if err != nil {
		return nil, fmt.Errorf("create locations usecase: %v", err)
	}

	v1Handlers, err := v1.NewHandlers(v1.NewOptions(timeSlotsUC, locationsUC, servicesUC))
	if err != nil {
		return nil, fmt.Errorf("create v1 handlers: %v", err)
	}

	srv, err := server.New(server.NewOptions(
		lg,
		addr,
		allowOrigins,
		v1Swagger,
		eventsAddr,
		v1Handlers,
	))
	if err != nil {
		return nil, fmt.Errorf("build server: %v", err)
	}

	return srv, nil
}
