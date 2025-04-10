package services

import (
	"context"
	"fmt"

	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"

	api "github.com/Slava02/SaintDiego/backend/events/pkg/pb"
)

//go:generate options-gen -out-filename=events_options.gen.go -from-struct=EventsClientOptions
type EventsClientOptions struct {
	EventsServerAddr string `option:"mandatory" validate:"required"`
}

type EventsClient struct {
	conn *grpc.ClientConn
	api.EventsServiceClient
}

func NewEventsClient(opts EventsClientOptions) (*EventsClient, error) {
	if err := opts.Validate(); err != nil {
		return nil, fmt.Errorf("validate options: %w", err)
	}

	ctx, cancel := context.WithTimeout(context.Background(), connectionTimeout)
	defer cancel()

	// Create gRPC connection with tracing interceptor and blocking mode
	conn, err := grpc.DialContext(ctx, opts.EventsServerAddr,
		grpc.WithTransportCredentials(insecure.NewCredentials()),
		grpc.WithBlock(), // Wait for connection to be established
	)
	if err != nil {
		return nil, fmt.Errorf("failed to connect to Events service: %w", err)
	}

	return &EventsClient{
		conn,
		api.NewEventsServiceClient(conn),
	}, nil
}

// Close closes the gRPC connection
func (c *EventsClient) Close() error {
	return c.conn.Close()
}

func (c *EventsClient) GetEvents(ctx context.Context, req *api.GetEventsRequest) (*api.GetEventsResponse, error) {
	return c.EventsServiceClient.GetEvents(ctx, req)
}

func (c *EventsClient) GetEventById(ctx context.Context, req *api.GetEventByIdRequest) (*api.Event, error) {
	return c.EventsServiceClient.GetEventById(ctx, req)
}

func (c *EventsClient) UpdateEvent(ctx context.Context, req *api.UpdateEventRequest) (*api.Event, error) {
	return c.EventsServiceClient.UpdateEvent(ctx, req)
}

func (c *EventsClient) DeleteEvent(ctx context.Context, req *api.DeleteEventRequest) (*api.DeleteEventResponse, error) {
	return c.EventsServiceClient.DeleteEvent(ctx, req)
}
