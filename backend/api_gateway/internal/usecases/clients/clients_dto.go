package clients

import "github.com/Slava02/SaintDiego/backend/api_gateway/internal/models"

type GetClientParams struct {
	Page      int32   `query:"page" json:"page" validate:"required"`
	PerPage   int32   `query:"per_page" json:"per_page" validate:"required"`
	IsBlocked *bool   `query:"is_blocked" json:"is_blocked" validate:"required"`
	Search    *string `query:"search" json:"search" validate:"required"`
}

type GetClientResponse struct {
	Items []*models.Client `json:"items"`
}

type CreateClientRequest struct {
	FirstName  string `json:"first_name" validate:"required"`
	LastName   string `json:"last_name" validate:"required"`
	MiddleName string `json:"middle_name" validate:"required"`
}

type BlockClientRequest struct {
	ID          int64   `json:"id" validate:"required"`
	IsBlocked   bool    `json:"is_blocked" validate:"required"`
	BlockReason *string `json:"block_reason" validate:"required"`
}

type GetClientsIdServicesParams struct {
	Page    int32 `query:"page" json:"page" validate:"required,min=1"`
	PerPage int32 `query:"per_page" json:"per_page" validate:"required,min=1,max=100"`
	ID      int64 `query:"id" json:"id" validate:"required,min=1"`
}
