package volunteers

import (
	"context"
	"errors"
	"fmt"

	"github.com/Slava02/SaintDiego/backend/volunteers/internal/models"
	"github.com/Slava02/SaintDiego/backend/volunteers/internal/repositories/volunteers_repo"
)

type IVolunteersRepository interface {
	CreateVolunteer(ctx context.Context, volunteer *models.Volunteer) (*models.Volunteer, error)
	GetVolunteerByTgId(ctx context.Context, tgId int64) (*models.Volunteer, error)
	UpdateVolunteer(ctx context.Context, updateVolunteerReq *volunteers_repo.UpdateVolunteerReq) (*models.Volunteer, error)
}

var (
	ErrVolunteerNotFound = errors.New("volunteer not found")
)

//go:generate options-gen -out-filename=usecase_options.gen.go -from-struct=Options
type Options struct {
	VolunteersRepository IVolunteersRepository `option:"mandatory" validate:"required"`
}

type UseCase struct {
	volunteersRepository IVolunteersRepository
}

func New(opts Options) (*UseCase, error) {
	if err := opts.Validate(); err != nil {
		return nil, fmt.Errorf("validate options: %v", err)
	}

	return &UseCase{
		volunteersRepository: opts.VolunteersRepository,
	}, nil
}

func (u *UseCase) CreateVolunteer(ctx context.Context, volunteer *models.Volunteer) (*models.Volunteer, error) {
	return u.volunteersRepository.CreateVolunteer(ctx, volunteer)
}

func (u *UseCase) GetVolunteerByTgId(ctx context.Context, tgId int64) (*models.Volunteer, error) {
	volunteer, err := u.volunteersRepository.GetVolunteerByTgId(ctx, tgId)
	if err != nil {
		if errors.Is(err, volunteers_repo.ErrVolunteerNotFound) {
			return nil, fmt.Errorf("get volunteer by tg id: %w", ErrVolunteerNotFound)
		}
		return nil, fmt.Errorf("get volunteer by tg id: %w", err)
	}

	return volunteer, nil
}

func (u *UseCase) UpdateVolunteer(ctx context.Context, updateVolunteerReq *UpdateVolunteerReq) (*models.Volunteer, error) {
	_, err := u.volunteersRepository.GetVolunteerByTgId(ctx, updateVolunteerReq.TGID)
	if err != nil {
		return nil, fmt.Errorf("get volunteer by tg id: %w", err)
	}

	volunteer, err := u.volunteersRepository.UpdateVolunteer(ctx, &volunteers_repo.UpdateVolunteerReq{
		TGID:       updateVolunteerReq.TGID,
		FirstName:  updateVolunteerReq.FirstName,
		LastName:   updateVolunteerReq.LastName,
		MiddleName: updateVolunteerReq.MiddleName,
	})
	if err != nil {
		return nil, fmt.Errorf("update volunteer: %w", err)
	}

	return volunteer, nil
}
