package grpc_services

import (
	"context"
	"fmt"
	"time"

	api "github.com/Slava02/SaintDiego/backend/schedule/pkg/pb"
	"github.com/grpc-ecosystem/go-grpc-middleware/v2/interceptors/retry"
	"google.golang.org/grpc"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/credentials/insecure"
	"google.golang.org/grpc/status"
)

//go:generate options-gen -out-filename=locations_options.gen.go -from-struct=LocationsClientOptions
type LocationsClientOptions struct {
	LocationsServerAddr string `option:"mandatory" validate:"required"`
}

type LocationsClient struct {
	conn *grpc.ClientConn
	api.ScheduleServiceClient
}

func NewLocationsClient(opts LocationsClientOptions) (*LocationsClient, error) {
	if err := opts.Validate(); err != nil {
		return nil, fmt.Errorf("validate options: %w", err)
	}

	ctx, cancel := context.WithTimeout(context.Background(), connectionTimeout)
	defer cancel()

	// Create gRPC connection with tracing interceptor and blocking mode
	conn, err := grpc.DialContext(ctx, opts.LocationsServerAddr,
		grpc.WithUnaryInterceptor(retry.UnaryClientInterceptor(
			retry.WithMax(3),
			retry.WithPerRetryTimeout(2*time.Second),
		)),
		grpc.WithTransportCredentials(insecure.NewCredentials()),
		grpc.WithBlock(), // Wait for connection to be established
	)
	if err != nil {
		return nil, fmt.Errorf("failed to connect to Locations service: %w", err)
	}

	return &LocationsClient{
		conn,
		api.NewScheduleServiceClient(conn),
	}, nil
}

// Close closes the gRPC connection
func (c *LocationsClient) Close() error {
	return c.conn.Close()
}

func (c *LocationsClient) GetLocationById(ctx context.Context, id int64) error {
	_, err := c.ScheduleServiceClient.GetLocationById(ctx, &api.GetLocationByIdRequest{
		Id: id,
	})
	if err != nil {
		switch status.Code(err) {
		case codes.NotFound:
			return fmt.Errorf("location not found: %w", err)
		}
	}

	return nil
}
