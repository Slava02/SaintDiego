package timeSlots

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

const (
	statusActive   = "active"
	statusArchived = "archived"
)

func New(opts Options) (*UseCase, error) {
	if err := opts.Validate(); err != nil {
		return nil, fmt.Errorf("validate options: %v", err)
	}

	return &UseCase{}, nil
}

func (u UseCase) CreateTimeSlot(ctx context.Context, req *CreateTimeSlotReq) (*models.TimeSlot, error) {
	// TODO implement me
	panic("implement me")
}

func (u UseCase) GetTimeSlots(ctx context.Context, request *GetTimeSlotsReq) ([]*models.TimeSlot, error) {
	// TODO implement me
	panic("implement me")
}

func (u UseCase) GetTimeSlot(ctx context.Context, id int) (*models.TimeSlot, error) {
	// TODO implement me
	panic("implement me")
}

func (u UseCase) DeleteTimeSlot(ctx context.Context, id int) error {
	// TODO implement me
	panic("implement me")
}

func (u UseCase) ActivateTimeSlot(ctx context.Context, id int) error {
	// TODO implement me
	panic("implement me")
}

func (u UseCase) ArchiveTimeSlot(ctx context.Context, id int) error {
	// TODO implement me
	panic("implement me")
}

func (u UseCase) UpdateTimeSlot(ctx context.Context, req *UpdateTimeSlotReq) (*models.TimeSlot, error) {
	// TODO implement me
	panic("implement me")
}
