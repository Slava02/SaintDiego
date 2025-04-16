package clients

import (
	"fmt"
)

type IClientsRepository interface {
}

//go:generate options-gen -out-filename=usecase_options.gen.go -from-struct=Options
type Options struct {
	ClientsRepository IClientsRepository `option:"mandatory" validate:"required"`
}

type UseCase struct {
	clientsRepository IClientsRepository
}

func New(opts Options) (*UseCase, error) {
	if err := opts.Validate(); err != nil {
		return nil, fmt.Errorf("validate options: %v", err)
	}

	return &UseCase{
		clientsRepository: opts.ClientsRepository,
	}, nil
}
