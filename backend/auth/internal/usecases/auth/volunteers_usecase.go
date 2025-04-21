package auth

import (
	"context"
	"fmt"

	"github.com/Slava02/SaintDiego/backend/auth/internal/models"
	"github.com/Slava02/SaintDiego/backend/auth/internal/repositories/auth_repo"
)

type IVolunteersRepository interface {
	CreateVolunteer(ctx context.Context, volunteer *models.Volunteer) (*models.Volunteer, error)
	GetVolunteerByTgId(ctx context.Context, tgId int64) (*models.Volunteer, error)
	UpdateVolunteer(ctx context.Context, updateVolunteerReq *auth_repo.UpdateVolunteerReq) (*models.Volunteer, error)
}

//go:generate options-gen -out-filename=usecase_options.gen.go -from-struct=Options
type Options struct {
	VolunteersRepository IVolunteersRepository `option:"mandatory" validate:"required"`
}

type UseCase struct {
	authRepository IVolunteersRepository
}

func New(opts Options) (*UseCase, error) {
	if err := opts.Validate(); err != nil {
		return nil, fmt.Errorf("validate options: %v", err)
	}

	return &UseCase{
		authRepository: opts.VolunteersRepository,
	}, nil
}

func (u *UseCase) CreateVolunteer(ctx context.Context, volunteer *models.Volunteer) (*models.Volunteer, error) {
	return u.authRepository.CreateVolunteer(ctx, volunteer)
}

func (u *UseCase) GetVolunteerByTgId(ctx context.Context, tgId int64) (*models.Volunteer, error) {
	return u.authRepository.GetVolunteerByTgId(ctx, tgId)
}

func (u *UseCase) UpdateVolunteer(ctx context.Context, updateVolunteerReq *UpdateVolunteerReq) (*models.Volunteer, error) {
	return u.authRepository.UpdateVolunteer(ctx, &auth_repo.UpdateVolunteerReq{
		TGID:       updateVolunteerReq.TGID,
		FirstName:  updateVolunteerReq.FirstName,
		LastName:   updateVolunteerReq.LastName,
		MiddleName: updateVolunteerReq.MiddleName,
	})
}
