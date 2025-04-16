package models

import "time"

type Client struct {
	BirthDate  *time.Time `json:"birth_date,omitempty"`
	FirstName  string     `json:"first_name"`
	Gender     *int32     `json:"gender,omitempty"`
	Id         int64      `json:"id"`
	IsBlocked  *bool      `json:"is_blocked,omitempty"`
	IsHomeless *bool      `json:"is_homeless,omitempty"`
	IsNew      bool       `json:"is_new,omitempty"` // Новый == не прошел первичное собеседование
	LastName   string     `json:"last_name"`
	MiddleName string     `json:"middle_name"`
	PhotoName  *string    `json:"photo_name,omitempty"`
}
