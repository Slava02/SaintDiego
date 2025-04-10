package services

import (
	"context"
	"fmt"

	api "github.com/Slava02/SaintDiego/backend/services/pkg/pb"
	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"
)

//go:generate options-gen -out-filename=services_options.gen.go -from-struct=ServicesClientOptions
type ServicesClientOptions struct {
	ServicesServerAddr string `option:"mandatory" validate:"required"`
}

type ServicesClient struct {
	conn *grpc.ClientConn
	api.ServicesServiceClient
}

func NewServicesClient(opts ServicesClientOptions) (*ServicesClient, error) {
	if err := opts.Validate(); err != nil {
		return nil, fmt.Errorf("validate options: %w", err)
	}

	ctx, cancel := context.WithTimeout(context.Background(), connectionTimeout)
	defer cancel()

	// Create gRPC connection with tracing interceptor and blocking mode
	conn, err := grpc.DialContext(ctx, opts.ServicesServerAddr,
		grpc.WithTransportCredentials(insecure.NewCredentials()),
		grpc.WithBlock(), // Wait for connection to be established
	)
	if err != nil {
		return nil, fmt.Errorf("failed to connect to Services service: %w", err)
	}

	return &ServicesClient{
		conn,
		api.NewServicesServiceClient(conn),
	}, nil
}

// Close closes the gRPC connection
func (c *ServicesClient) Close() error {
	return c.conn.Close()
}

func (c *ServicesClient) GetServiceTypes(ctx context.Context, req *api.GetServiceTypesRequest) (*api.GetServiceTypesResponse, error) {
	return c.ServicesServiceClient.GetServiceTypes(ctx, req)
}

func (c *ServicesClient) GetServiceTypeById(ctx context.Context, req *api.GetServiceTypeByIdRequest) (*api.ServiceType, error) {
	return c.ServicesServiceClient.GetServiceTypeById(ctx, req)
}

func (c *ServicesClient) UpdateServiceType(ctx context.Context, req *api.UpdateServiceTypeRequest) (*api.ServiceType, error) {
	return c.ServicesServiceClient.UpdateServiceType(ctx, req)
}
