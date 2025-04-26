package grpc_services

import (
	"context"
	"fmt"
	"time"

	api "github.com/Slava02/SaintDiego/backend/clients/pkg/pb"
	"github.com/grpc-ecosystem/go-grpc-middleware/v2/interceptors/retry"
	"google.golang.org/grpc"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/credentials/insecure"
	"google.golang.org/grpc/status"
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

func (c *ClientsClient) GetClientById(ctx context.Context, id int64) error {
	_, err := c.ClientsServiceClient.GetClientById(ctx, &api.GetClientByIdRequest{
		Id: id,
	})
	if err != nil {
		switch status.Code(err) {
		case codes.NotFound:
			return fmt.Errorf("client not found: %w", err)
		default:
			return fmt.Errorf("get client by id: %w", err)
		}
	}

	return nil
}
