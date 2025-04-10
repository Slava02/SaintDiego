package locations_repo

import (
	"context"
	"fmt"

	"github.com/Slava02/SaintDiego/backend/schedule/internal/models"
	"github.com/Slava02/SaintDiego/backend/schedule/internal/storage"
)

//go:generate options-gen -out-filename=locations_repo_options.gen.go -from-struct=Options
type Options struct {
	DB *storage.Database `option:"mandatory" validate:"required"`
}

type LocationRepository struct {
	db *storage.Database
}

func NewLocationRepository(opts Options) *LocationRepository {
	return &LocationRepository{db: opts.DB}
}

func (r *LocationRepository) GetLocations(ctx context.Context) ([]*models.Location, error) {
	var locations []*models.Location

	err := r.db.Select(ctx, &locations).Scan(ctx)
	if err != nil {
		return nil, fmt.Errorf("select locations: %w", err)
	}

	return locations, nil
}

func (r *LocationRepository) CreateLocation(ctx context.Context, req *models.Location) (*models.Location, error) {
	_, err := r.db.Insert(ctx, req).Exec(ctx)
	if err != nil {
		return nil, fmt.Errorf("insert location: %w", err)
	}

	return req, nil
}

func (r *LocationRepository) UpdateLocation(ctx context.Context, id int64, name, address string) (*models.Location, error) {
	existingLocation := &models.Location{}
	err := r.db.Select(ctx, existingLocation).Where("id = ?", id).Scan(ctx)
	if err != nil {
		return nil, fmt.Errorf("select location: %w", err)
	}

	_, err = r.db.Update(ctx, &models.Location{
		Name:    name,
		Address: address,
	}).
		Column("name").
		Column("address").
		Where("id = ?", id).
		Exec(ctx)
	if err != nil {
		return nil, fmt.Errorf("update location: %w", err)
	}

	return &models.Location{
		ID:      id,
		Name:    name,
		Address: address,
	}, nil
}

func (r *LocationRepository) DeleteLocation(ctx context.Context, id int64) error {
	_, err := r.db.Delete(ctx, &models.Location{ID: id}).Where("id = ?", id).Exec(ctx)
	if err != nil {
		return fmt.Errorf("delete location: %w", err)
	}
	return nil
}
