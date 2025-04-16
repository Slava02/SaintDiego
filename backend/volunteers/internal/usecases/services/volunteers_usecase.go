package volunteers

import (
	"fmt"
)

type IVolunteersRepository interface {
}

//go:generate options-gen -out-filename=usecase_options.gen.go -from-struct=Options
type Options struct {
	VolunteersRepository IVolunteersRepository `option:"mandatory" validate:"required"`
}

type UseCase struct {
	volunteersRepository IVolunteersRepository
}

func New(opts Options) (*UseCase, error) {
	if err := opts.Validate(); err != nil {
		return nil, fmt.Errorf("validate options: %v", err)
	}

	return &UseCase{
		volunteersRepository: opts.VolunteersRepository,
	}, nil
}
