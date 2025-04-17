package clients_repo

import (
	"github.com/Slava02/SaintDiego/backend/common/storage"
)

//go:generate options-gen -out-filename=repo_options.gen.go -from-struct=Options
type Options struct {
	DB *storage.Database `option:"mandatory" validate:"required"`
}

type ClientsRepository struct {
	db *storage.Database
}

func NewClientsRepository(opts Options) *ClientsRepository {
	return &ClientsRepository{db: opts.DB}
}
