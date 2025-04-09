package models

type ServiceType struct {
	ID                    int64  `json:"id" validate:"required"`
	Name                  string `json:"name" validate:"required,max=255"`
	MinPeriodDays         int64  `json:"min_period_days" validate:"required"`
	RegistrationAvailable bool   `json:"registration_available" validate:"required"`
}
