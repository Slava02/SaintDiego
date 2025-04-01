package services

import (
	"context"
	"fmt"
	"time"

	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"

	api "github.com/Slava02/SaintDiego/backend/schedule/pkg/pb"
)

const (
	connectionTimeout = 3 * time.Second
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
		grpc.WithBlock(), // Wait for connection to be established
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

func (c *EventsClient) CreateTimeSlot(ctx context.Context, req *api.CreateTimeSlotRequest) (*api.TimeSlot, error) {
	return c.EventServiceClient.CreateTimeSlot(ctx, req)
}

func (c *EventsClient) GetTimeSlots(ctx context.Context, req *api.GetTimeSlotsRequest) (*api.GetTimeSlotsResponse, error) {
	return c.EventServiceClient.GetTimeSlots(ctx, req)
}

func (c *EventsClient) GetTimeSlot(ctx context.Context, req *api.GetTimeSlotRequest) (*api.TimeSlot, error) {
	return c.EventServiceClient.GetTimeSlot(ctx, req)
}

func (c *EventsClient) DeleteTimeSlot(ctx context.Context, req *api.DeleteTimeSlotRequest) (*api.DeleteTimeSlotResponse, error) {
	return c.EventServiceClient.DeleteTimeSlot(ctx, req)
}

func (c *EventsClient) ActivateTimeSlot(ctx context.Context, req *api.ActivateTimeSlotRequest) (*api.TimeSlot, error) {
	return c.EventServiceClient.ActivateTimeSlot(ctx, req)
}

func (c *EventsClient) ArchiveTimeSlot(ctx context.Context, req *api.ArchiveTimeSlotRequest) (*api.TimeSlot, error) {
	return c.EventServiceClient.ArchiveTimeSlot(ctx, req)
}
