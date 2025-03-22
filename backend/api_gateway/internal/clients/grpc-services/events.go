package services

import (
	"context"
	"fmt"
	"time"

	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"

	api "github.com/Slava02/SaintDiego/backend/events/pkg/pb"
)

const (
	connectionTimeout = 5 * time.Second
)

//go:generate options-gen -out-filename=events_options.gen.go -from-struct=EventsClientOptions
type EventsClientOptions struct {
	ServerAddr string
}

type EventsClient struct {
	conn *grpc.ClientConn
	api.EventServiceClient
}

func NewEventsClient(opts EventsClientOptions) (*EventsClient, error) {
	ctx, cancel := context.WithTimeout(context.Background(), connectionTimeout)
	defer cancel()

	// Create gRPC connection with tracing interceptor and blocking mode
	conn, err := grpc.DialContext(ctx, opts.ServerAddr,
		grpc.WithTransportCredentials(insecure.NewCredentials()),
		//grpc.WithBlock(), // Wait for connection to be established
	)
	if err != nil {
		return nil, fmt.Errorf("failed to connect to events service: %w", err)
	}

	return &EventsClient{
		conn,
		api.NewEventServiceClient(conn),
	}, nil
}

// Close closes the gRPC connection
func (c *EventsClient) Close() error {
	return c.conn.Close()
}
