package middlewares

import (
	"fmt"
	"net/http"

	"github.com/Slava02/SaintDiego/backend/auth/pkg/jwtAuth"
	"github.com/golang-jwt/jwt/v5"
	echojwt "github.com/labstack/echo-jwt/v4"
	"github.com/labstack/echo/v4"
)

// TODO: возвращается not found, если пользователь не авторизован, надо поправить
// NewJWTMiddleware creates a new JWT middleware with the given secret
func NewJWTMiddleware(secret []byte) echo.MiddlewareFunc {
	return echojwt.WithConfig(echojwt.Config{
		SigningKey: secret,
		NewClaimsFunc: func(c echo.Context) jwt.Claims {
			return new(jwtAuth.JWTClaims)
		},
		TokenLookup: "header:Authorization:Bearer ",
		// Запрещаем доступ без токена
		ContinueOnIgnoredError: false,
		// Устанавливаем метод подписи
		SigningMethod: "HS256",
		ParseTokenFunc: func(c echo.Context, auth string) (interface{}, error) {
			// Парсинг токена с проверкой подписи
			token, err := jwt.ParseWithClaims(auth, &jwtAuth.JWTClaims{}, func(t *jwt.Token) (interface{}, error) {
				if t.Method.Alg() != "HS256" {
					return nil, fmt.Errorf("unexpected signing method: %v", t.Method.Alg())
				}
				return secret, nil
			})

			if err != nil {
				return nil, fmt.Errorf("parse token: %v", err)
			}

			return token, nil
		},
		ErrorHandler: func(c echo.Context, err error) error {
			// Возвращаем 401 Unauthorized при ошибках JWT
			return c.JSON(http.StatusUnauthorized, map[string]string{
				"error":   "unauthorized",
				"message": "Invalid or expired token",
			})
		},
	})
}
