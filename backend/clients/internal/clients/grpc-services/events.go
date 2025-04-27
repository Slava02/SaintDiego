package grpc_services

import (
	"context"
	"fmt"
	"time"

	"github.com/Slava02/SaintDiego/backend/clients/internal/models"
	api "github.com/Slava02/SaintDiego/backend/events/pkg/pb"
	"github.com/grpc-ecosystem/go-grpc-middleware/v2/interceptors/retry"
	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"
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
		grpc.WithUnaryInterceptor(retry.UnaryClientInterceptor(
			retry.WithMax(3),
			retry.WithPerRetryTimeout(2*time.Second),
		)),
		grpc.WithTransportCredentials(insecure.NewCredentials()),
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

func (c *EventsClient) GetAvailableEventsForClientByServiceId(ctx context.Context, serviceID int64, clientID int64) ([]*models.Event, error) {
	var allEvents []*models.Event
	page := int64(1)
	perPage := int64(100)

	for {
		params := &api.GetAvailableEventsForClientByServiceIdRequest{
			ServiceId: serviceID,
			ClientId:  clientID,
			Page:      page,
			PerPage:   perPage,
		}
		resp, err := c.EventsServiceClient.GetAvailableEventsForClientByServiceId(ctx, params)
		if err != nil {
			return nil, err
		}

		for _, event := range resp.Events {
			allEvents = append(allEvents, &models.Event{
				Id:                event.Id,
				Capacity:          event.Capacity,
				ParticipantsCount: event.ParticipantsCount,
			})
		}

		// Если получили меньше событий, чем perPage, значит это последняя страница
		if len(resp.Events) < int(perPage) {
			break
		}

		page++
	}

	return allEvents, nil
}
