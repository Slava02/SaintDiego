package v1

import (
	"fmt"

	"github.com/Slava02/SaintDiego/backend/schedule/pkg/pb"
)

//go:generate options-gen -out-filename=service_options.gen.go -from-struct=Options
type Options struct {
	timeSlotUC  ITimeSlotsUC `option:"mandatory" validate:"required"`
	locationsUC ILocationsUC `option:"mandatory" validate:"required"`
}

type Implementation struct {
	pb.UnimplementedScheduleServiceServer
	timeSlotUC  ITimeSlotsUC
	locationsUC ILocationsUC
}

func NewImplementation(opts Options) (*Implementation, error) {
	if err := opts.Validate(); err != nil {
		return nil, fmt.Errorf("validate options: %v", err)
	}

	return &Implementation{
		timeSlotUC:  opts.timeSlotUC,
		locationsUC: opts.locationsUC,
	}, nil
}
