package models

type ServiceType struct {
	ID          int     `json:"id" validate:"required"`
	Name        string  `json:"name" validate:"required,max=255"`
	Description *string `json:"description,omitempty" validate:"omitempty,max=1000"`
}

type Service struct {
	ID          int     `json:"id" validate:"required"`
	Name        string  `json:"name" validate:"required,max=255"`
	Description *string `json:"description,omitempty" validate:"omitempty,max=1000"`
}
