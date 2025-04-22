package auth_repo

import (
	"context"
	"fmt"

	"github.com/Slava02/SaintDiego/backend/auth/internal/models"
	"github.com/Slava02/SaintDiego/backend/common/storage"
)

//go:generate options-gen -out-filename=repo_options.gen.go -from-struct=Options
type Options struct {
	DB *storage.Database `option:"mandatory" validate:"required"`
}

type UserRepository struct {
	db *storage.Database
}

func NewUserRepository(opts Options) (*UserRepository, error) {
	if err := opts.Validate(); err != nil {
		return nil, fmt.Errorf("validate options: %w", err)
	}

	return &UserRepository{db: opts.DB}, nil
}

func (r *UserRepository) GetUserByLogin(ctx context.Context, login string) (*models.User, error) {
	user := &models.User{}
	err := r.db.Select(ctx, user).Where("login = ?", login).Scan(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to get user by login: %w", err)
	}

	return user, nil
}
