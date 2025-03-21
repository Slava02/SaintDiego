package v1

import (
	"fmt"
)

//go:generate options-gen -out-filename=handlers_options.gen.go -from-struct=Options
type Options struct {
	timeSlotUC  ITimeSlotsUC `option:"mandatory" validate:"required"`
	locationsUC ILocationsUC `option:"mandatory" validate:"required"`
	servicesUC  IServicesUC  `option:"mandatory" validate:"required"`
}

type Handlers struct {
	Options
}

func NewHandlers(opts Options) (Handlers, error) {
	if err := opts.Validate(); err != nil {
		return Handlers{}, fmt.Errorf("validate options: %v", err)
	}

	return Handlers{Options: opts}, nil
}
