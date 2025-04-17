package volunteers_repo

import (
	"context"
	"fmt"

	"github.com/Slava02/SaintDiego/backend/common/storage"
	"github.com/Slava02/SaintDiego/backend/volunteers/internal/models"
)

//go:generate options-gen -out-filename=repo_options.gen.go -from-struct=Options
type Options struct {
	DB *storage.Database `option:"mandatory" validate:"required"`
}

type VolunteerRepository struct {
	db *storage.Database
}

func NewVolunteerRepository(opts Options) (*VolunteerRepository, error) {
	if err := opts.Validate(); err != nil {
		return nil, fmt.Errorf("validate options: %w", err)
	}

	return &VolunteerRepository{db: opts.DB}, nil
}

func (r *VolunteerRepository) CreateVolunteer(ctx context.Context, volunteer *models.Volunteer) (*models.Volunteer, error) {
	_, err := r.db.Insert(ctx, volunteer).Exec(ctx)
	if err != nil {
		return nil, fmt.Errorf("create volunteer: %w", err)
	}
	return volunteer, nil
}

func (r *VolunteerRepository) GetVolunteerByTgId(ctx context.Context, tgId int64) (*models.Volunteer, error) {
	volunteer := new(models.Volunteer)
	err := r.db.Select(ctx, volunteer).Where("tg_id = ?", tgId).Scan(ctx)
	return volunteer, err
}

func (r *VolunteerRepository) UpdateVolunteer(ctx context.Context, req *UpdateVolunteerReq) (*models.Volunteer, error) {
	volunteer := &models.Volunteer{
		TGID:       req.TGID,
		FirstName:  req.FirstName,
		LastName:   req.LastName,
		MiddleName: req.MiddleName,
	}
	_, err := r.db.Update(ctx, volunteer).
		Model(volunteer).
		Set("first_name = ?", volunteer.FirstName).
		Set("last_name = ?", volunteer.LastName).
		Set("middle_name = ?", volunteer.MiddleName).
		Where("tg_id = ?", volunteer.TGID).
		Exec(ctx)

	if err != nil {
		return nil, fmt.Errorf("update volunteer: %w", err)
	}

	return volunteer, nil
}
