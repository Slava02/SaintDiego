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

	"github.com/Slava02/SaintDiego/internal/config"
	"github.com/Slava02/SaintDiego/internal/interceptors"
	server "github.com/Slava02/SaintDiego/internal/server"
	serverdebug "github.com/Slava02/SaintDiego/internal/server-debug"
	v1 "github.com/Slava02/SaintDiego/internal/server/v1"
	"github.com/Slava02/SaintDiego/internal/usecases/schedule"
	"github.com/Slava02/SaintDiego/pkg/grpc_client"
	logger2 "github.com/Slava02/SaintDiego/pkg/logger"
	"github.com/Slava02/SaintDiego/proto/events"
	"github.com/opentracing/opentracing-go"
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

	logger2.MustInit(
		logger2.NewOptions(cfg.Log.Level,
			logger2.WithEnv(cfg.Global.Env),
		))
	defer logger2.Sync()

	lg := zap.L().Named(cfg.Global.Name)

	srvDebug, err := serverdebug.New(serverdebug.NewOptions(cfg.Servers.Debug.Addr))
	if err != nil {
		return fmt.Errorf("init debug server: %v", err)
	}

	v1Swagger, err := v1.GetSwagger()
	if err != nil {
		return fmt.Errorf("get swagger: %v", err)
	}

	// Initialize the interceptor manager
	interceptorManager, err := interceptors.NewInterceptorManager(interceptors.NewOptions(lg, opentracing.GlobalTracer()))
	if err != nil {
		return fmt.Errorf("create interceptor manager: %v", err)
	}

	eventsConn, err := grpc_client.NewGRPCClientServiceConn(ctx, interceptorManager, cfg.Servers.APIGW.Addr)
	if err != nil {
		return fmt.Errorf("grpc_client.NewGRPCClientServiceConn: %v", err)
	}
	defer eventsConn.Close()

	eventsSerivceClient := events.NewEventServiceClient(eventsConn)

	scheduleUseCase := schedule.New(eventsSerivceClient)

	v1Handlers, err := v1.NewHandlers(v1.NewOptions(scheduleUseCase))
	if err != nil {
		return fmt.Errorf("create v1 handlers: %v", err)
	}

	srv, err := server.New(server.NewOptions(
		lg,
		cfg.Servers.APIGW.Addr,
		cfg.Servers.APIGW.AllowOrigins,
		v1Swagger,
		&v1Handlers,
	))
	if err != nil {
		return fmt.Errorf("build server: %v", err)
	}

	eg, ctx := errgroup.WithContext(ctx)

	// Run servers.
	eg.Go(func() error { return srvDebug.Run(ctx) })
	eg.Go(func() error { return srv.Run(ctx) })

	if err = eg.Wait(); err != nil && !errors.Is(err, context.Canceled) {
		return fmt.Errorf("wait app stop: %v", err)
	}

	return nil
}
