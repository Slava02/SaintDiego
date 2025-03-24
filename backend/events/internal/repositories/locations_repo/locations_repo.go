package locations_repo

import (
	"context"
	"fmt"

	"github.com/Slava02/SaintDiego/backend/events/internal/models"
	"github.com/uptrace/bun"
)

//go:generate options-gen -out-filename=locations_repo_options.gen.go -from-struct=Options
type Options struct {
	DB *bun.DB `option:"mandatory" validate:"required"`
}

type LocationRepository struct {
	db *bun.DB
}

func NewLocationRepository(opts Options) *LocationRepository {
	return &LocationRepository{db: opts.DB}
}

func (r *LocationRepository) GetLocations(ctx context.Context) ([]*models.Location, error) {
	var locations []*models.Location

	err := r.db.NewSelect().Model(&locations).Scan(ctx)
	if err != nil {
		return nil, fmt.Errorf("select locations: %w", err)
	}

	return locations, nil
}

func (r *LocationRepository) CreateLocation(ctx context.Context, req *models.Location) (*models.Location, error) {
	_, err := r.db.NewInsert().Model(req).Exec(ctx)
	if err != nil {
		return nil, fmt.Errorf("insert location: %w", err)
	}

	return req, nil
}
