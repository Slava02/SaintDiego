package app

import (
	"context"
	"log"

	"github.com/Slava02/SaintDiego/backend/events/internal/api/note"
	"github.com/Slava02/SaintDiego/backend/events/internal/client/db"
	"github.com/Slava02/SaintDiego/backend/events/internal/client/db/pg"
	"github.com/Slava02/SaintDiego/backend/events/internal/client/db/transaction"
	"github.com/Slava02/SaintDiego/backend/events/internal/closer"
	"github.com/Slava02/SaintDiego/backend/events/internal/config"
	"github.com/Slava02/SaintDiego/backend/events/internal/repository"
	noteRepository "github.com/Slava02/SaintDiego/backend/events/internal/repository/note"
	"github.com/Slava02/SaintDiego/backend/events/internal/service"
	noteService "github.com/Slava02/SaintDiego/backend/events/internal/service/note"
)

type serviceProvider struct {
	grpcConfig config.GRPCConfig

	noteService service.NoteService

	noteImpl *note.Implementation
}

func newServiceProvider() *serviceProvider {
	return &serviceProvider{}
}

func (s *serviceProvider) GRPCConfig() config.GRPCConfig {
	if s.grpcConfig == nil {
		cfg, err := config.NewGRPCConfig()
		if err != nil {
			log.Fatalf("failed to get grpc config: %s", err.Error())
		}

		s.grpcConfig = cfg
	}

	return s.grpcConfig
}

func (s *serviceProvider) NoteImpl(ctx context.Context) *note.Implementation {
	if s.noteImpl == nil {
		s.noteImpl = note.NewImplementation(s.NoteService(ctx))
	}

	return s.noteImpl
}
