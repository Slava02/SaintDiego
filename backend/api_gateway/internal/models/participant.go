package models

type Participant struct {
	ID         int64   `json:"id"`
	PhotoName  *string `json:"photo_name"`
	BirthDate  *string `json:"birth_date"`
	Gender     *int64  `json:"gender"`
	FirstName  string  `json:"first_name"`
	MiddleName string  `json:"middle_name"`
	LastName   string  `json:"last_name"`
	IsHomeless *bool   `json:"is_homeless"`
}
