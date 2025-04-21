package auth_repo

type UpdateVolunteerReq struct {
	TGID       int64  `json:"tg_id"`
	FirstName  string `json:"first_name"`
	LastName   string `json:"last_name"`
	MiddleName string `json:"middle_name"`
}
