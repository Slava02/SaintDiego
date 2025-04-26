package grpc_services

import (
	"fmt"
	"time"
)

const (
	connectionTimeout = 3 * time.Second
)

//go:generate options-gen -out-filename=manager_options.gen.go -from-struct=ManagerOptions
type ManagerOptions struct {
	ServicesAddr  string `option:"mandatory" validate:"required"`
	ClientAddr    string `option:"mandatory" validate:"required"`
	VolunteerAddr string `option:"mandatory" validate:"required"`
}

type Manager struct {
	servicesClient  *ServicesClient
	clientClient    *ClientsClient
	volunteerClient *VolunteersClient
}

func NewManager(opts ManagerOptions) (*Manager, error) {
	if err := opts.Validate(); err != nil {
		return nil, fmt.Errorf("validate options: %w", err)
	}

	servicesClient, err := NewServicesClient(ServicesClientOptions{
		ServicesServerAddr: opts.ServicesAddr,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to create services client: %w", err)
	}

	clientClient, err := NewClientsClient(ClientsClientOptions{
		ClientsServerAddr: opts.ClientAddr,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to create client client: %w", err)
	}

	volunteerClient, err := NewVolunteersClient(VolunteersClientOptions{
		VolunteersServerAddr: opts.VolunteerAddr,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to create volunteer client: %w", err)
	}
	return &Manager{
		servicesClient:  servicesClient,
		clientClient:    clientClient,
		volunteerClient: volunteerClient,
	}, nil
}

// Close closes all client connections
func (m *Manager) Close() error {
	if err := m.servicesClient.Close(); err != nil {
		return fmt.Errorf("failed to close services client: %w", err)
	}
	if err := m.clientClient.Close(); err != nil {
		return fmt.Errorf("failed to close client client: %w", err)
	}
	if err := m.volunteerClient.Close(); err != nil {
		return fmt.Errorf("failed to close volunteer client: %w", err)
	}
	return nil
}

// Services returns the services service client
func (m *Manager) Services() *ServicesClient {
	return m.servicesClient
}

// Clients returns the clients service client
func (m *Manager) Clients() *ClientsClient {
	return m.clientClient
}

// Volunteers returns the volunteers service client
func (m *Manager) Volunteers() *VolunteersClient {
	return m.volunteerClient
}
