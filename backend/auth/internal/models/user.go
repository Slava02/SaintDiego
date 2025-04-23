package models

import (
	"github.com/golang-jwt/jwt/v5"
	"github.com/uptrace/bun"
)

type User struct {
	bun.BaseModel `bun:"table:schedule_users"`

	ID       int64  `bun:"id,pk,autoincrement"`
	Username string `bun:"login"`
	Password []byte `bun:"password_hash"`
}

type JWTClaims struct {
	UserID int64 `json:"user_id"`
	jwt.RegisteredClaims
}
