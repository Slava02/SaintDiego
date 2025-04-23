package auth

import (
	"time"

	"github.com/Slava02/SaintDiego/backend/auth/internal/models"
	"github.com/golang-jwt/jwt/v5"
)

func generateToken(userID int64, duration time.Duration, secret string) (string, error) {
	claims := &models.JWTClaims{
		UserID: userID,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(duration)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(secret))
}
