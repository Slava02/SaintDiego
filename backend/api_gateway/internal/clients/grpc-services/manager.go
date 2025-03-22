package services

import (
	"fmt"
)

type Manager struct {
	eventsClient *EventsClient
}

//go:generate options-gen -out-filename=manager_options.gen.go -from-struct=Options
type Options struct {
	EventsAddr string `option:"mandatory" validate:"required"`
}

func NewManager(opts Options) (*Manager, error) {
	eventsClient, err := NewEventsClient(EventsClientOptions{
		ServerAddr: opts.EventsAddr,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to create events client: %w", err)
	}

	return &Manager{
		eventsClient: eventsClient,
	}, nil
}

// Close closes all client connections
func (m *Manager) Close() error {
	if err := m.eventsClient.Close(); err != nil {
		return fmt.Errorf("failed to close events client: %w", err)
	}
	return nil
}

// Events returns the events service client
func (m *Manager) Events() *EventsClient {
	return m.eventsClient
}
