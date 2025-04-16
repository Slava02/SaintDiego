package clients_repo

import (
	"github.com/Slava02/SaintDiego/backend/common/storage"
)

//go:generate options-gen -out-filename=services_repo_options.gen.go -from-struct=Options
type Options struct {
	DB *storage.Database `option:"mandatory" validate:"required"`
}

type VolunteerRepository struct {
	db *storage.Database
}

func NewVolunteerRepository(opts Options) *VolunteerRepository {
	return &VolunteerRepository{db: opts.DB}
}
