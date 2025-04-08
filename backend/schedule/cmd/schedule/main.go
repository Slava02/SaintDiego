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

	"github.com/Slava02/SaintDiego/backend/schedule/internal/repositories/locations_repo"
	timeslots_repo "github.com/Slava02/SaintDiego/backend/schedule/internal/repositories/timeSlots_repo"
	"github.com/Slava02/SaintDiego/backend/schedule/internal/storage"
	"github.com/Slava02/SaintDiego/backend/schedule/internal/usecases/locations"
	"github.com/Slava02/SaintDiego/backend/schedule/internal/usecases/timeSlots"

	"github.com/Slava02/SaintDiego/backend/common/closer"
	"github.com/Slava02/SaintDiego/backend/common/logger"
	"github.com/Slava02/SaintDiego/backend/common/tracing"
	"github.com/Slava02/SaintDiego/backend/schedule/internal/config"
	server "github.com/Slava02/SaintDiego/backend/schedule/internal/server"
	_ "github.com/go-sql-driver/mysql"
	"go.uber.org/zap"
	"golang.org/x/sync/errgroup"

	v1 "github.com/Slava02/SaintDiego/backend/schedule/internal/server/v1"
)

const (
	nameMain    = "main"
	serviceName = "schedule"
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

	// Storage

	sqldb, err := sql.Open("mysql", cfg.Database.Conn())
	if err != nil {
		return fmt.Errorf("open sql server: %v", err)
	}
	closer.Add(sqldb.Close)

	db, err := storage.New(storage.NewOptions(sqldb, storage.WithProd(cfg.Global.IsProduction())))
	if err != nil {
		return fmt.Errorf("init storage: %v", err)
	}

	// Repositories

	timeSlotsRepo := timeslots_repo.NewTimeSlotRepository(timeslots_repo.NewOptions(db))
	locationsRepo := locations_repo.NewLocationRepository(locations_repo.NewOptions(db))

	// Usecases

	timeSlotsUsecase, err := timeSlots.New(timeSlots.NewOptions(timeSlotsRepo, db))
	if err != nil {
		lg.Error("init timeSlots usecase", zap.Error(err))
		return fmt.Errorf("init timeSlots usecase: %v", err)
	}

	locationsUsecase, err := locations.New(locations.NewOptions(locationsRepo))
	if err != nil {
		lg.Error("init locations usecase", zap.Error(err))
		return fmt.Errorf("init locations usecase: %v", err)
	}

	// Service

	eventService, err := v1.NewImplementation(v1.NewOptions(
		timeSlotsUsecase,
		locationsUsecase,
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
