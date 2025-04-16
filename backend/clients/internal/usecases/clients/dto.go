package clients

type UpdateServiceTypeReq struct {
	ServiceTypeID         int64 `json:"service_type_id" validate:"required"`
	MinPeriodDays         int64 `json:"min_period_days" validate:"required"`
	RegistrationAvailable bool  `json:"registration_available" validate:"required"`
}

type GetServicesParams struct {
	RegistrationAvailable *bool `query:"registration_available" json:"registration_available" validate:"omitempty"`
	Page                  int32 `query:"page" json:"page" validate:"required"`
	PerPage               int32 `query:"per_page" json:"per_page" validate:"required"`
}
