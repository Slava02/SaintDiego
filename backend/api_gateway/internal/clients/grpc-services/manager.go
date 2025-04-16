package services

import (
	"fmt"
	"time"
)

const (
	connectionTimeout = 3 * time.Second
)

//go:generate options-gen -out-filename=manager_options.gen.go -from-struct=ManagerOptions
type ManagerOptions struct {
	ScheduleAddr   string `option:"mandatory" validate:"required"`
	ServicesAddr   string `option:"mandatory" validate:"required"`
	EventsAddr     string `option:"mandatory" validate:"required"`
	VolunteersAddr string `option:"mandatory" validate:"required"`
	ClientsAddr    string `option:"mandatory" validate:"required"`
}

type Manager struct {
	scheduleClient   *ScheduleClient
	servicesClient   *ServicesClient
	eventsClient     *EventsClient
	volunteersClient *VolunteersClient
	clientsClient    *ClientsClient
}

func NewManager(opts ManagerOptions) (*Manager, error) {
	scheduleClient, err := NewScheduleClient(ScheduleClientOptions{
		ScheduleServerAddr: opts.ScheduleAddr,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to create schedule client: %w", err)
	}

	servicesClient, err := NewServicesClient(ServicesClientOptions{
		ServicesServerAddr: opts.ServicesAddr,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to create services client: %w", err)
	}

	eventsClient, err := NewEventsClient(EventsClientOptions{
		EventsServerAddr: opts.EventsAddr,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to create events client: %w", err)
	}

	volunteersClient, err := NewVolunteersClient(VolunteersClientOptions{
		VolunteersServerAddr: opts.VolunteersAddr,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to create volunteers client: %w", err)
	}

	clientsClient, err := NewClientsClient(ClientsClientOptions{
		ClientsServerAddr: opts.ClientsAddr,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to create clients client: %w", err)
	}

	return &Manager{
		scheduleClient:   scheduleClient,
		servicesClient:   servicesClient,
		eventsClient:     eventsClient,
		volunteersClient: volunteersClient,
		clientsClient:    clientsClient,
	}, nil
}

// Close closes all client connections
func (m *Manager) Close() error {
	if err := m.scheduleClient.Close(); err != nil {
		return fmt.Errorf("failed to close schedule client: %w", err)
	}
	if err := m.servicesClient.Close(); err != nil {
		return fmt.Errorf("failed to close services client: %w", err)
	}
	if err := m.eventsClient.Close(); err != nil {
		return fmt.Errorf("failed to close events client: %w", err)
	}
	if err := m.volunteersClient.Close(); err != nil {
		return fmt.Errorf("failed to close volunteers client: %w", err)
	}
	if err := m.clientsClient.Close(); err != nil {
		return fmt.Errorf("failed to close clients client: %w", err)
	}
	return nil
}

// Schedule returns the schedule service client
func (m *Manager) Schedule() *ScheduleClient {
	return m.scheduleClient
}

// Services returns the services service client
func (m *Manager) Services() *ServicesClient {
	return m.servicesClient
}

// Events returns the events service client
func (m *Manager) Events() *EventsClient {
	return m.eventsClient
}

// Volunteers returns the volunteers service client
func (m *Manager) Volunteers() *VolunteersClient {
	return m.volunteersClient
}

// Clients returns the clients service client
func (m *Manager) Clients() *ClientsClient {
	return m.clientsClient
}
