package models

import "time"

type ServiceType struct {
	ID          int64   `json:"id" validate:"required"`
	Name        string  `json:"name" validate:"required,max=255"`
	Description *string `json:"description,omitempty" validate:"omitempty,max=1000"`
}

type Service struct {
	ID          int64   `json:"id" validate:"required"`
	Name        string  `json:"name" validate:"required,max=255"`
	Description *string `json:"description,omitempty" validate:"omitempty,max=1000"`
}

type ServiceTypeSettings struct {
	ID            int64     `json:"id" validate:"required"`
	ServiceTypeID int64     `json:"service_type_id" validate:"required"`
	PeriodDays    int64     `json:"period_days" validate:"required"`
	CreatedAt     time.Time `json:"created_at" validate:"required"`
	UpdatedAt     time.Time `json:"updated_at" validate:"required"`
}
