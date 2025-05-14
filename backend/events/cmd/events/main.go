package main

import (
	"context"
	"database/sql"
	"errors"
	"flag"
	"fmt"
	"log"
	"os/signal"
	"syscall"

	"github.com/Slava02/SaintDiego/backend/common/storage"
	"github.com/Slava02/SaintDiego/backend/events/internal/models"
	"github.com/Slava02/SaintDiego/backend/events/internal/repositories/events_repo"
	"github.com/Slava02/SaintDiego/backend/events/internal/usecases/events"

	"github.com/Slava02/SaintDiego/backend/common/closer"
	"github.com/Slava02/SaintDiego/backend/common/logger"
	"github.com/Slava02/SaintDiego/backend/common/tracing"
	"github.com/Slava02/SaintDiego/backend/events/internal/config"
	server "github.com/Slava02/SaintDiego/backend/events/internal/server"
	_ "github.com/go-sql-driver/mysql"
	"go.uber.org/zap"
	"golang.org/x/sync/errgroup"

	grpc_services "github.com/Slava02/SaintDiego/backend/events/internal/clients/grpc-services"
	v1 "github.com/Slava02/SaintDiego/backend/events/internal/server/v1"
)

const (
	nameMain    = "main"
	serviceName = "events"
)

var configPath = flag.String("config", "configs/config.toml", "Path to config file")

func main() {
	if err := run(); err != nil {
		log.Fatalf("run app: %v", err)
	}
}

func run() error {
	flag.Parse()

	ctx, cancel := signal.NotifyContext(context.Background(), syscall.SIGINT, syscall.SIGTERM)
	defer cancel()

	cfg, err := config.ParseAndValidate(*configPath)
	if err != nil {
		return fmt.Errorf("parse and validate config %q: %v", *configPath, err)
	}

	if err := logger.Init(logger.NewOptions(
		cfg.Log.Level,
		logger.WithProductionMode(cfg.Global.IsProduction()),
	)); err != nil {
		return fmt.Errorf("init logger: %v", err)
	}

	defer logger.Sync()

	lg := zap.L().Named(nameMain)

	tracing.Init(lg, serviceName)

	// Clients

	manager, err := grpc_services.NewManager(grpc_services.ManagerOptions{
		ServicesAddr:  cfg.GRPCClient.Services.Addr,
		ClientAddr:    cfg.GRPCClient.Clients.Addr,
		VolunteerAddr: cfg.GRPCClient.Volunteers.Addr,
		LocationAddr:  cfg.GRPCClient.Locations.Addr,
	})
	if err != nil {
		return fmt.Errorf("init manager: %v", err)
	}
	closer.Add(manager.Close)

	// Storage

	sqldb, err := sql.Open("mysql", cfg.Database.Conn())
	if err != nil {
		return fmt.Errorf("open sql server: %v", err)
	}
	closer.Add(sqldb.Close)

	db, err := storage.New(
		storage.NewOptions(
			sqldb,
			storage.WithProd(cfg.Global.IsProduction()),
			storage.WithModels([]any{(*models.EventClient)(nil)}),
		),
	)
	if err != nil {
		return fmt.Errorf("init storage: %v", err)
	}

	// Repositories

	eventsRepo, err := events_repo.NewEventRepository(events_repo.NewOptions(db))
	if err != nil {
		return fmt.Errorf("init events repository: %v", err)
	}

	// Usecases

	eventsUsecase, err := events.New(events.NewOptions(
		eventsRepo,
		db,
		manager.Services(),
		manager.Clients(),
		manager.Volunteers(),
		manager.Locations(),
	))
	if err != nil {
		lg.Error("init events usecase", zap.Error(err))
		return fmt.Errorf("init events usecase: %v", err)
	}

	// Service

	eventService, err := v1.NewImplementation(v1.NewOptions(
		eventsUsecase,
	))
	if err != nil {
		return fmt.Errorf("init event service: %v", err)
	}

	// Server

	srv, err := server.New(server.NewOptions(
		lg,
		&cfg.Server,
		eventService,
		server.WithProduction(cfg.Global.IsProduction()),
	))
	if err != nil {
		return fmt.Errorf("init server: %v", err)
	}

	// Run server

	eg, ctx := errgroup.WithContext(ctx)

	eg.Go(func() error { return srv.Run(ctx) })
	lg.Info("server started")

	if err = eg.Wait(); err != nil && !errors.Is(err, context.Canceled) {
		return fmt.Errorf("wait app stop: %v", err)
	}

	return nil

}
