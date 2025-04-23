package middlewares

import (
	"errors"
	"net/http"
	"time"

	"github.com/Slava02/SaintDiego/backend/auth/internal/models"
	"github.com/golang-jwt/jwt/v5"
	echojwt "github.com/labstack/echo-jwt/v4"
	"github.com/labstack/echo/v4"
)

// NewJWTMiddleware creates a new JWT middleware with the given secret
func NewJWTMiddleware(secret string) echo.MiddlewareFunc {
	return echojwt.WithConfig(echojwt.Config{
		SigningKey: []byte(secret),
		NewClaimsFunc: func(c echo.Context) jwt.Claims {
			return new(models.JWTClaims)
		},
		TokenLookup: "header:Authorization:Bearer ",
		// Запрещаем доступ без токена
		ContinueOnIgnoredError: false,
		// Устанавливаем метод подписи
		SigningMethod: "HS256",
		ParseTokenFunc: func(c echo.Context, auth string) (interface{}, error) {
			// Парсинг токена с проверкой подписи
			token, err := jwt.ParseWithClaims(auth, &JWTClaims{}, func(t *jwt.Token) (interface{}, error) {
				if t.Method.Alg() != "HS256" {
					return nil, errors.New("unexpected signing method")
				}
				return secret, nil
			})

			if err != nil {
				return nil, err
			}

			return token, nil
		},
		ErrorHandler: func(c echo.Context, err error) error {
			// Перенаправление на страницу логина при любой ошибке JWT
			return c.Redirect(http.StatusSeeOther, "/login")
		},
	})
}

// GenerateToken generates a new JWT token for the given user ID
func GenerateToken(userID, secret string) (string, error) {
	claims := &JWTClaims{
		UserID: userID,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(time.Hour * 24)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(secret))
}

// GetUserIDFromContext extracts the user ID from the JWT claims in the context
func GetUserIDFromContext(c echo.Context) (string, error) {
	user := c.Get("user").(*jwt.Token)
	claims, ok := user.Claims.(*JWTClaims)
	if !ok {
		return "", echo.NewHTTPError(echo.ErrUnauthorized.Code, "Invalid token claims")
	}
	return claims.UserID, nil
}
