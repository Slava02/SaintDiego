package clients

type GetClientsReq struct {
	Page    int32 `json:"page" validate:"required"`
	PerPage int32 `json:"per_page" validate:"required"`
}

type CreateClientReq struct {
	FirstName  string `json:"first_name" validate:"required"`
	LastName   string `json:"last_name" validate:"required"`
	MiddleName string `json:"middle_name" validate:"required"`
}

type GetClientServicesReq struct {
	ClientID int64 `json:"client_id" validate:"required"`
	Page     int32 `json:"page" validate:"required"`
	PerPage  int32 `json:"per_page" validate:"required"`
}

type BlockClientReq struct {
	ID          int64   `json:"id" validate:"required"`
	IsBlocked   bool    `json:"is_blocked" validate:"required"`
	BlockReason *string `json:"block_reason" validate:"required"`
}
