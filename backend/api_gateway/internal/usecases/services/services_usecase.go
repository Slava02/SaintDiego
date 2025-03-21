package timeSlot

import (
	"context"
	"fmt"

	"github.com/Slava02/SaintDiego/internal/models"
)

//go:generate options-gen -out-filename=usecase_options.gen.go -from-struct=Options
type Options struct{}

type UseCase struct {
	Options
}

func New(opts Options) (*UseCase, error) {
	if err := opts.Validate(); err != nil {
		return nil, fmt.Errorf("validate options: %v", err)
	}

	return &UseCase{}, nil
}

func (u UseCase) GetServices(ctx context.Context) ([]*models.Service, error) {
	// TODO implement me
	panic("implement me")
}

func (u UseCase) GetServicesId(ctx context.Context, id int) (*models.Service, error) {
	// TODO implement me
	panic("implement me")
}
