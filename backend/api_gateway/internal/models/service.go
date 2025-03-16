package models

import "github.com/Slava02/SaintDiego/internal/types"

type ServiceType struct {
	ID          types.ServiceTypeID `json:"id" validate:"required"`
	Name        string              `json:"name" validate:"required,max=255"`
	Description *string             `json:"description,omitempty" validate:"omitempty,max=1000"`
}

type Service struct {
	ID          types.ServiceTypeID `json:"id" validate:"required"`
	Name        string              `json:"name" validate:"required,max=255"`
	Description *string             `json:"description,omitempty" validate:"omitempty,max=1000"`
}

type GetServicesRequest struct {
	Status string `json:"status" validate:"required,oneof=active archived"`
}

type GetServicesResponse struct {
	Services []Service `json:"services" validate:"required,dive"`
}
