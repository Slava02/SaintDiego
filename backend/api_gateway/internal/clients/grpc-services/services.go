package services

import (
	"context"
	"fmt"
	"time"

	api "github.com/Slava02/SaintDiego/backend/schedule/pkg/pb"
	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"
)

//go:generate options-gen -out-filename=schedule_options.gen.go -from-struct=ScheduleClientOptions
type ServicesClientOptions struct {
	ServerAddr string
}

type ServicesClient struct {
	conn *grpc.ClientConn
	api.ServicesServiceClient
}

func NewServicesClient(opts ServicesClientOptions) (*ServicesClient, error) {
	ctx, cancel := context.WithTimeout(context.Background(), connectionTimeout)
	defer cancel()

	// Create gRPC connection with tracing interceptor and blocking mode
	conn, err := grpc.DialContext(ctx, opts.ServerAddr,
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
