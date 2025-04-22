package auth

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"time"

	"github.com/Slava02/SaintDiego/backend/auth/internal/models"
	"golang.org/x/crypto/bcrypt"
)

type IAuthRepository interface {
	GetUserByLogin(ctx context.Context, login string) (*models.User, error)
}

//go:generate options-gen -out-filename=usecase_options.gen.go -from-struct=Options
type Options struct {
	AuthRepository IAuthRepository `option:"mandatory" validate:"required"`
	Secret         string          `option:"mandatory" validate:"required"`
}

type UseCase struct {
	authRepository IAuthRepository
	secret         string
}

func New(opts Options) (*UseCase, error) {
	if err := opts.Validate(); err != nil {
		return nil, fmt.Errorf("validate options: %v", err)
	}

	return &UseCase{
		authRepository: opts.AuthRepository,
		secret:         opts.Secret,
	}, nil
}

func (u *UseCase) Login(ctx context.Context, req *LoginRequest) (*LoginResponse, error) {
	user, err := u.authRepository.GetUserByLogin(ctx, req.Login)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, fmt.Errorf("user not found")
		}

		return nil, fmt.Errorf("failed to get user by login: %v", err)
	}

	err = bcrypt.CompareHashAndPassword(user.Password, []byte(req.Password))
	if err != nil {
		return nil, fmt.Errorf("failed to compare password: %v", err)
	}

	token, err := newToken(user, time.Hour*24, u.secret)
	if err != nil {
		return nil, fmt.Errorf("failed to create token: %v", err)
	}

	return &LoginResponse{
		Token: token,
	}, nil
}
