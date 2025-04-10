package services

type UpdateServiceTypeReq struct {
	ServiceTypeID         int64 `json:"service_type_id" validate:"required"`
	MinPeriodDays         int64 `json:"min_period_days" validate:"required"`
	RegistrationAvailable bool  `json:"registration_available" validate:"required"`
}

type GetServicesParams struct {
	RegistrationAvailable bool `query:"registration_available" json:"registration_available" validate:"omitempty"`
}
