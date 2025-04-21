package v1

import (
	"fmt"

	"github.com/Slava02/SaintDiego/backend/auth/pkg/pb"
)

//go:generate options-gen -out-filename=service_options.gen.go -from-struct=Options
type Options struct {
	authUC IVolunteersUC `option:"mandatory" validate:"required"`
}

type Implementation struct {
	pb.UnimplementedVolunteersServiceServer
	authUC IVolunteersUC
}

func NewImplementation(opts Options) (*Implementation, error) {
	if err := opts.Validate(); err != nil {
		return nil, fmt.Errorf("validate options: %v", err)
	}

	return &Implementation{
		authUC: opts.authUC,
	}, nil
}
