package auth

type LoginRequest struct {
	Login    string `json:"login" validate:"required,max=255"`
	Password string `json:"password" validate:"required,max=255"`
}

type LoginResponse struct {
	Token string `json:"token"`
}
