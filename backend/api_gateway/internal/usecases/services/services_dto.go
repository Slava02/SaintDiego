package services

type CreateServiceTypeSettingsReq struct {
	PeriodDays    int64 `json:"period_days" validate:"required"`
	ServiceTypeId int64 `json:"service_type_id" validate:"required"`
}
