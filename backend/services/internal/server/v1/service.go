package v1

import (
	"fmt"

	"github.com/Slava02/SaintDiego/backend/services/pkg/pb"
)

//go:generate options-gen -out-filename=service_options.gen.go -from-struct=Options
type Options struct {
	servicesUC IServicesUC `option:"mandatory" validate:"required"`
}

type Implementation struct {
	pb.UnimplementedServicesServiceServer
	servicesUC IServicesUC
}

func NewImplementation(opts Options) (*Implementation, error) {
	if err := opts.Validate(); err != nil {
		return nil, fmt.Errorf("validate options: %v", err)
	}

	return &Implementation{
		servicesUC: opts.servicesUC,
	}, nil
}
