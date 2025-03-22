package main

import (
	"context"
	"errors"
	"flag"
	"fmt"
	"log"
	"os/signal"
	"syscall"

	"go.uber.org/zap"
	"golang.org/x/sync/errgroup"

	"github.com/Slava02/SaintDiego/backend/api_gateway/internal/config"
	v1 "github.com/Slava02/SaintDiego/backend/api_gateway/internal/server/v1"
	logger "github.com/Slava02/SaintDiego/backend/api_gateway/pkg/logger"
)

const nameMain = "main"

var configPath = flag.String("config", "configs/config.toml", "Path to config file")

func main() {
	if err := run(); err != nil {
		log.Fatalf("run app: %v", err)
	}
}

func run() (errReturned error) {
	flag.Parse()

	ctx, cancel := signal.NotifyContext(context.Background(), syscall.SIGINT, syscall.SIGTERM)
	defer cancel()

	cfg, err := config.ParseAndValidate(*configPath)
	if err != nil {
		return fmt.Errorf("parse and validate config %q: %v", *configPath, err)
	}

	logger.MustInit(
		logger.NewOptions(cfg.Log.Level,
			logger.WithEnv(cfg.Global.Env),
		))
	defer logger.Sync()

	lg := zap.L().Named(nameMain)

	v1Swagger, err := v1.GetSwagger()
	if err != nil {
		return fmt.Errorf("get swagger: %v", err)
	}

	srv, err := initServer(
		cfg.Servers.APIGW.Addr,
		cfg.Servers.APIGW.AllowOrigins,
		v1Swagger,
		cfg.Services.Events.Addr,
	)
	if err != nil {
		return fmt.Errorf("init server: %v", err)
	}

	eg, ctx := errgroup.WithContext(ctx)

	eg.Go(func() error { return srv.Run(ctx) })
	lg.Info("server started")

	if err = eg.Wait(); err != nil && !errors.Is(err, context.Canceled) {
		return fmt.Errorf("wait app stop: %v", err)
	}

	return nil
}
