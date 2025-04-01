package services

type CreateServiceTypeSettingsRequest struct {
	ServiceTypeID int64 `json:"service_type_id"`
	PeriodDays    int64 `json:"period_days"`
}
