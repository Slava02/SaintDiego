package v1

import (
	"fmt"

	"github.com/Slava02/SaintDiego/clients/pkg/pb"
)

//go:generate options-gen -out-filename=service_options.gen.go -from-struct=Options
type Options struct {
	clientsUC IClientsUC `option:"mandatory" validate:"required"`
}

type Implementation struct {
	pb.UnimplementedClientsServiceServer
	clientsUC IClientsUC
}

func NewImplementation(opts Options) (*Implementation, error) {
	if err := opts.Validate(); err != nil {
		return nil, fmt.Errorf("validate options: %v", err)
	}

	return &Implementation{
		clientsUC: opts.clientsUC,
	}, nil
}
