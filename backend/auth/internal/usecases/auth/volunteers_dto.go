package auth

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

type UpdateVolunteerReq struct {
	TGID       int64  `json:"tg_id" validate:"required"`
	FirstName  string `json:"first_name" validate:"required"`
	LastName   string `json:"last_name" validate:"required"`
	MiddleName string `json:"middle_name" validate:"required"`
}
