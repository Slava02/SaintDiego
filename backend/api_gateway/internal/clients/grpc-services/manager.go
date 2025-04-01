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
	ScheduleAddr string `option:"mandatory" validate:"required"`
	ServicesAddr string `option:"mandatory" validate:"required"`
}

type Manager struct {
	scheduleClient *ScheduleClient
	servicesClient *ServicesClient
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

	return &Manager{
		scheduleClient: scheduleClient,
		servicesClient: servicesClient,
	}, nil
}

// Close closes all client connections
func (m *Manager) Close() error {
	if err := m.scheduleClient.Close(); err != nil {
		return fmt.Errorf("failed to close schedule client: %w", err)
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
