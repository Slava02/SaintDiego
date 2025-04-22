package v1

import (
	"fmt"

	pb "github.com/Slava02/SaintDiego/backend/auth/pkg/pb"
)

//go:generate options-gen -out-filename=service_options.gen.go -from-struct=Options
type Options struct {
	authUC IAuthUC `option:"mandatory" validate:"required"`
}

type Implementation struct {
	pb.UnimplementedAuthServer
	authUC IAuthUC
}

func NewImplementation(opts Options) (*Implementation, error) {
	if err := opts.Validate(); err != nil {
		return nil, fmt.Errorf("validate options: %v", err)
	}

	return &Implementation{
		authUC: opts.authUC,
	}, nil
}
