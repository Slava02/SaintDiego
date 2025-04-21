package v1

import (
	"fmt"
)

//go:generate options-gen -out-filename=handlers_options.gen.go -from-struct=Options
type Options struct {
	timeSlotUC  ITimeSlotsUC `option:"mandatory" validate:"required"`
	locationsUC ILocationsUC `option:"mandatory" validate:"required"`
	servicesUC  IServicesUC  `option:"mandatory" validate:"required"`
	eventsUC    IEventsUC    `option:"mandatory" validate:"required"`
	volunteerUC IVolunteerUC `option:"mandatory" validate:"required"`
	clientUC    IClientUC    `option:"mandatory" validate:"required"`
	authUC      IAuthUC      `option:"mandatory" validate:"required"`
}

type Handlers struct {
	timeSlotUC  ITimeSlotsUC
	locationsUC ILocationsUC
	servicesUC  IServicesUC
	eventsUC    IEventsUC
	volunteerUC IVolunteerUC
	clientUC    IClientUC
	authUC      IAuthUC
}

var _ ServerInterface = (*Handlers)(nil)

func NewHandlers(opts Options) (Handlers, error) {
	if err := opts.Validate(); err != nil {
		return Handlers{}, fmt.Errorf("validate options: %v", err)
	}

	return Handlers{
		timeSlotUC:  opts.timeSlotUC,
		locationsUC: opts.locationsUC,
		servicesUC:  opts.servicesUC,
		eventsUC:    opts.eventsUC,
		volunteerUC: opts.volunteerUC,
		clientUC:    opts.clientUC,
	}, nil
}
