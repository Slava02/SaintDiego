package services

import (
	"context"
	"fmt"

	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"

	api "github.com/Slava02/SaintDiego/backend/schedule/pkg/pb"
)

//go:generate options-gen -out-filename=schedule_options.gen.go -from-struct=ScheduleClientOptions
type ScheduleClientOptions struct {
	ScheduleServerAddr string
}

type ScheduleClient struct {
	conn *grpc.ClientConn
	api.ScheduleServiceClient
}

func NewScheduleClient(opts ScheduleClientOptions) (*ScheduleClient, error) {
	ctx, cancel := context.WithTimeout(context.Background(), connectionTimeout)
	defer cancel()

	// Create gRPC connection with tracing interceptor and blocking mode
	conn, err := grpc.DialContext(ctx, opts.ScheduleServerAddr,
		grpc.WithTransportCredentials(insecure.NewCredentials()),
		grpc.WithBlock(), // Wait for connection to be established
	)
	if err != nil {
		return nil, fmt.Errorf("failed to connect to Schedule service: %w", err)
	}

	return &ScheduleClient{
		conn,
		api.NewScheduleServiceClient(conn),
	}, nil
}

// Close closes the gRPC connection
func (c *ScheduleClient) Close() error {
	return c.conn.Close()
}

func (c *ScheduleClient) CreateTimeSlot(ctx context.Context, req *api.CreateTimeSlotRequest) (*api.TimeSlot, error) {
	return c.ScheduleServiceClient.CreateTimeSlot(ctx, req)
}

func (c *ScheduleClient) GetTimeSlots(ctx context.Context, req *api.GetTimeSlotsRequest) (*api.GetTimeSlotsResponse, error) {
	return c.ScheduleServiceClient.GetTimeSlots(ctx, req)
}

func (c *ScheduleClient) GetTimeSlot(ctx context.Context, req *api.GetTimeSlotRequest) (*api.TimeSlot, error) {
	return c.ScheduleServiceClient.GetTimeSlot(ctx, req)
}

func (c *ScheduleClient) DeleteTimeSlot(ctx context.Context, req *api.DeleteTimeSlotRequest) (*api.DeleteTimeSlotResponse, error) {
	return c.ScheduleServiceClient.DeleteTimeSlot(ctx, req)
}

func (c *ScheduleClient) ActivateTimeSlot(ctx context.Context, req *api.ActivateTimeSlotRequest) (*api.TimeSlot, error) {
	return c.ScheduleServiceClient.ActivateTimeSlot(ctx, req)
}

func (c *ScheduleClient) ArchiveTimeSlot(ctx context.Context, req *api.ArchiveTimeSlotRequest) (*api.TimeSlot, error) {
	return c.ScheduleServiceClient.ArchiveTimeSlot(ctx, req)
}

func (c *ScheduleClient) UpdateTimeSlot(ctx context.Context, req *api.TimeSlot) (*api.TimeSlot, error) {
	return c.ScheduleServiceClient.UpdateTimeSlot(ctx, req)
}

func (c *ScheduleClient) GetLocations(ctx context.Context, req *api.GetLocationsRequest) (*api.GetLocationsResponse, error) {
	return c.ScheduleServiceClient.GetLocations(ctx, req)
}

func (c *ScheduleClient) CreateLocation(ctx context.Context, req *api.CreateLocationRequest) (*api.Location, error) {
	return c.ScheduleServiceClient.CreateLocation(ctx, req)
}
