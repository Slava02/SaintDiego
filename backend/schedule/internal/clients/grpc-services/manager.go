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
	ServicesAddr string `option:"mandatory" validate:"required"`
}

type Manager struct {
	servicesClient *ServicesClient
}

func NewManager(opts ManagerOptions) (*Manager, error) {
	servicesClient, err := NewServicesClient(ServicesClientOptions{
		ServicesServerAddr: opts.ServicesAddr,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to create services client: %w", err)
	}

	return &Manager{
		servicesClient: servicesClient,
	}, nil
}

// Close closes all client connections
func (m *Manager) Close() error {
	if err := m.servicesClient.Close(); err != nil {
		return fmt.Errorf("failed to close services client: %w", err)
	}
	return nil
}

// Services returns the services service client
func (m *Manager) Services() *ServicesClient {
	return m.servicesClient
}
