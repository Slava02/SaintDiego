package services

import (
	"fmt"
)

type Manager struct {
	scheduleClient *ScheduleClient
}

//go:generate options-gen -out-filename=manager_options.gen.go -from-struct=ManagerOptions
type ManagerOptions struct {
	ScheduleAddr string `option:"mandatory" validate:"required"`
}

func NewManager(opts ManagerOptions) (*Manager, error) {
	scheduleClient, err := NewScheduleClient(ScheduleClientOptions{
		ServerAddr: opts.ScheduleAddr,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to create schedule client: %w", err)
	}

	return &Manager{
		scheduleClient: scheduleClient,
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
