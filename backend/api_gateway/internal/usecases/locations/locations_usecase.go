package timeSlots

import (
	"context"
	"fmt"

	"github.com/Slava02/SaintDiego/internal/models"
)

//go:generate options-gen -out-filename=usecase_options.gen.go -from-struct=Options
type Options struct{}

type UseCase struct{}

func New(opts Options) (*UseCase, error) {
	if err := opts.Validate(); err != nil {
		return nil, fmt.Errorf("validate options: %v", err)
	}

	return &UseCase{}, nil
}

func (u UseCase) GetLocations(ctx context.Context) ([]*models.Location, error) {
	// TODO implement me
	panic("implement me")
}

func (u UseCase) CreateLocation(ctx context.Context, req *CreateLocationRequest) (*models.Location, error) {
	// TODO implement me
	panic("implement me")
}
