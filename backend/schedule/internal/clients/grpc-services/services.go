package grpc_services

import (
	"context"
	"fmt"
	"time"

	"github.com/Slava02/SaintDiego/backend/schedule/internal/models"
	api "github.com/Slava02/SaintDiego/backend/services/pkg/pb"
	"github.com/grpc-ecosystem/go-grpc-middleware/v2/interceptors/retry"
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
		grpc.WithUnaryInterceptor(retry.UnaryClientInterceptor(
			retry.WithMax(3),
			retry.WithPerRetryTimeout(2*time.Second),
		)),
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

func (c *ServicesClient) GetServiceTypeById(ctx context.Context, id int64) (*models.ServiceType, error) {
	resp, err := c.ServicesServiceClient.GetServiceTypeById(ctx, &api.GetServiceTypeByIdRequest{
		Id: id,
	})
	if err != nil {
		return nil, err
	}

	return &models.ServiceType{
		ID:   resp.Id,
		Name: resp.Name,
	}, nil
}
