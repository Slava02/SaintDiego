package services

type CreateServiceTypeSettingsReq struct {
	PeriodDays int64 `json:"period_days" validate:"required"`
}
