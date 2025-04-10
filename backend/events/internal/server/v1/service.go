package v1

import (
	"fmt"

	"github.com/Slava02/SaintDiego/backend/events/pkg/pb"
)

//go:generate options-gen -out-filename=service_options.gen.go -from-struct=Options
type Options struct {
	eventsUC IEventsUC `option:"mandatory" validate:"required"`
}

type Implementation struct {
	pb.UnimplementedEventsServiceServer
	eventsUC IEventsUC
}

func NewImplementation(opts Options) (*Implementation, error) {
	if err := opts.Validate(); err != nil {
		return nil, fmt.Errorf("validate options: %v", err)
	}

	return &Implementation{
		eventsUC: opts.eventsUC,
	}, nil
}
