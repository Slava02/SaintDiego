package models

type Volunteer struct {
	TgId       int64  `json:"tg_id" validate:"required"`
	TgLogin    string `json:"tg_login" validate:"required"`
	FirstName  string `json:"first_name" validate:"required"`
	MiddleName string `json:"middle_name" validate:"required"`
	LastName   string `json:"last_name" validate:"required"`
}
