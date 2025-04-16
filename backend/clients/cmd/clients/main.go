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

	"github.com/Slava02/SaintDiego/backend/common/closer"
	"github.com/Slava02/SaintDiego/backend/common/logger"
	"github.com/Slava02/SaintDiego/backend/common/tracing"
	"github.com/Slava02/SaintDiego/clients/internal/config"
	"github.com/Slava02/SaintDiego/clients/internal/repositories/clients_repo"
	"github.com/Slava02/SaintDiego/clients/internal/server"
	"github.com/Slava02/SaintDiego/clients/internal/usecases/clients"
	_ "github.com/go-sql-driver/mysql"
	"go.uber.org/zap"
	"golang.org/x/sync/errgroup"

	v1 "github.com/Slava02/SaintDiego/clients/internal/server/v1"
)

const (
	nameMain    = "main"
	serviceName = "clients"
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

	clientsRepo := clients_repo.NewVolunteerRepository(clients_repo.NewOptions(db))

	// Usecases

	usecase, err := clients.New(clients.NewOptions(clientsRepo))
	if err != nil {
		lg.Error("init clients usecase", zap.Error(err))
		return fmt.Errorf("init clients usecase: %v", err)
	}

	// Service

	service, err := v1.NewImplementation(v1.NewOptions(
		usecase,
	))
	if err != nil {
		return fmt.Errorf("init clients service: %v", err)
	}

	// Server

	srv, err := server.New(server.NewOptions(
		lg,
		&cfg.Server,
		service,
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
