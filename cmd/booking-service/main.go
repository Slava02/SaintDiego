package main

import (
	"context"
	"errors"
	"flag"
	"fmt"
	"log"
	"os/signal"
	"syscall"

	"golang.org/x/sync/errgroup"

	keycloakclient "github.com/Slava02/SaintDiego/internal/clients/keycloak"
	"github.com/Slava02/SaintDiego/internal/config"
	"github.com/Slava02/SaintDiego/internal/logger"
	clientv1 "github.com/Slava02/SaintDiego/internal/server-client/v1"
	serverdebug "github.com/Slava02/SaintDiego/internal/server-debug"
)

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

	srvDebug, err := serverdebug.New(serverdebug.NewOptions(cfg.Servers.Debug.Addr))
	if err != nil {
		return fmt.Errorf("init debug server: %v", err)
	}

	clientv1Swagger, err := clientv1.GetSwagger()
	if err != nil {
		return fmt.Errorf("get swagger: %v", err)
	}

	kc, err := keycloakclient.New(keycloakclient.NewOptions(
		cfg.Clients.Keycloak.BasePath,
		cfg.Clients.Keycloak.Realm,
		cfg.Clients.Keycloak.ClientID,
		cfg.Clients.Keycloak.ClientSecret,
	))
	if err != nil {
		return fmt.Errorf("failed to init keycloak client: %v", err)
	}

	srvClient, err := initServerClient(
		cfg.Servers.Client.Addr,
		cfg.Servers.Client.AllowOrigins,
		clientv1Swagger,
		kc,
		cfg.Servers.Client.Access.Role,
		cfg.Servers.Client.Access.Resource,
	)
	if err != nil {
		return fmt.Errorf("failed to init client server: %v", err)
	}

	eg, ctx := errgroup.WithContext(ctx)

	// Run servers.
	eg.Go(func() error { return srvDebug.Run(ctx) })
	eg.Go(func() error { return srvClient.Run(ctx) })

	// Run services.

	if err = eg.Wait(); err != nil && !errors.Is(err, context.Canceled) {
		return fmt.Errorf("wait app stop: %v", err)
	}

	return nil
}
