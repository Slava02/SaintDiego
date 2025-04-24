package services

import (
	"context"
	"fmt"
	"time"

	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"

	api "github.com/Slava02/SaintDiego/backend/clients/pkg/pb"
	"github.com/grpc-ecosystem/go-grpc-middleware/v2/interceptors/retry"
)

//go:generate options-gen -out-filename=clients_options.gen.go -from-struct=ClientsClientOptions
type ClientsClientOptions struct {
	ClientsServerAddr string `option:"mandatory" validate:"required"`
}

type ClientsClient struct {
	conn *grpc.ClientConn
	api.ClientsServiceClient
}

func NewClientsClient(opts ClientsClientOptions) (*ClientsClient, error) {
	if err := opts.Validate(); err != nil {
		return nil, fmt.Errorf("validate options: %w", err)
	}

	ctx, cancel := context.WithTimeout(context.Background(), connectionTimeout)
	defer cancel()

	// Create gRPC connection with tracing interceptor and blocking mode
	conn, err := grpc.DialContext(ctx, opts.ClientsServerAddr,
		grpc.WithUnaryInterceptor(retry.UnaryClientInterceptor(
			retry.WithMax(3),
			retry.WithPerRetryTimeout(2*time.Second),
		)),
		grpc.WithTransportCredentials(insecure.NewCredentials()),
		grpc.WithBlock(), // Wait for connection to be established
	)
	if err != nil {
		return nil, fmt.Errorf("failed to connect to Clients service: %w", err)
	}

	return &ClientsClient{
		conn,
		api.NewClientsServiceClient(conn),
	}, nil
}

// Close closes the gRPC connection
func (c *ClientsClient) Close() error {
	return c.conn.Close()
}

func (c *ClientsClient) GetClients(ctx context.Context, req *api.GetClientsRequest) (*api.GetClientsResponse, error) {
	return c.ClientsServiceClient.GetClients(ctx, req)
}

func (c *ClientsClient) GetClientById(ctx context.Context, req *api.GetClientByIdRequest) (*api.Client, error) {
	return c.ClientsServiceClient.GetClientById(ctx, req)
}

func (c *ClientsClient) CreateClient(ctx context.Context, req *api.CreateClientRequest) (*api.Client, error) {
	return c.ClientsServiceClient.CreateClient(ctx, req)
}

func (c *ClientsClient) BlockClient(ctx context.Context, req *api.BlockClientRequest) (*api.Client, error) {
	return c.ClientsServiceClient.BlockClient(ctx, req)
}

func (c *ClientsClient) GetClientServices(ctx context.Context, req *api.GetClientServicesRequest) (*api.GetClientServicesResponse, error) {
	return c.ClientsServiceClient.GetClientServices(ctx, req)
}
