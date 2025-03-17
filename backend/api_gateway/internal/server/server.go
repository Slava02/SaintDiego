package serverclient

import (
	"context"
	"errors"
	"fmt"
	"github.com/Slava02/SaintDiego/internal/interceptors"
	"github.com/Slava02/SaintDiego/internal/usecases/schedule"
	"github.com/Slava02/SaintDiego/pkg/grpc_client"
	"github.com/Slava02/SaintDiego/proto/events"
	"github.com/opentracing/opentracing-go"
	"net/http"
	"time"

	"github.com/getkin/kin-openapi/openapi3"
	"github.com/getkin/kin-openapi/openapi3filter"
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
	oapimdlwr "github.com/oapi-codegen/echo-middleware"
	"go.uber.org/zap"
	"golang.org/x/sync/errgroup"

	"github.com/Slava02/SaintDiego/internal/middlewares"
	v1 "github.com/Slava02/SaintDiego/internal/server/v1"
)

const (
	readHeaderTimeout = time.Second
	shutdownTimeout   = 3 * time.Second
	nameServer        = "server-apiGW"
)

//go:generate options-gen -out-filename=server_options.gen.go -from-struct=Options
type Options struct {
	logger       *zap.Logger `option:"mandatory" validate:"required"`
	serverAddr   string      `option:"mandatory" validate:"required,hostname_port"`
	allowOrigins []string    `option:"mandatory" validate:"min=1"`
	v1Swagger    *openapi3.T `option:"mandatory" validate:"required"`
	eventsAddr   string      `option:"mandatory" validate:"required,hostname_port"`
}

type Server struct {
	lg         *zap.Logger
	srv        *http.Server
	v1Group    *echo.Group
	eventsAddr string
}

func New(opts Options) (*Server, error) {
	if err := opts.Validate(); err != nil {
		return nil, fmt.Errorf("validate options: %v", err)
	}

	e := echo.New()
	e.Use(
		middlewares.NewRecovery(opts.logger),
		middlewares.NewLogging(opts.logger),
		middleware.BodyLimit("12KB"),
		middleware.CORSWithConfig(middleware.CORSConfig{
			AllowOrigins: opts.allowOrigins,
		}),
	)

	v1Group := e.Group("v1", oapimdlwr.OapiRequestValidatorWithOptions(opts.v1Swagger, &oapimdlwr.Options{
		Options: openapi3filter.Options{
			ExcludeRequestBody:  false,
			ExcludeResponseBody: true,
			AuthenticationFunc:  openapi3filter.NoopAuthenticationFunc,
		},
	}))

	return &Server{
		lg: zap.L().Named("server-apiGW"),
		srv: &http.Server{
			Addr:              opts.serverAddr,
			Handler:           e,
			ReadHeaderTimeout: readHeaderTimeout,
		},
		v1Group:    v1Group,
		eventsAddr: opts.eventsAddr,
	}, nil
}

func (s *Server) Run(ctx context.Context) error {
	eg, ctx := errgroup.WithContext(ctx)

	lg := zap.L().Named(nameServer)

	interceptorManager, err := interceptors.NewInterceptorManager(
		interceptors.NewOptions(lg, opentracing.GlobalTracer()),
	)
	if err != nil {
		return fmt.Errorf("create interceptor manager: %v", err)
	}

	eventsConn, err := grpc_client.NewGRPCClientServiceConn(ctx, interceptorManager, s.eventsAddr)
	if err != nil {
		return fmt.Errorf("grpc_client.NewGRPCClientServiceConn: %v", err)
	}
	defer eventsConn.Close()

	eventsSerivceClient := events.NewEventServiceClient(eventsConn)

	scheduleUseCase, err := schedule.New(schedule.NewOptions(eventsSerivceClient))
	if err != nil {
		return fmt.Errorf("create scheduleUseCase: %v", err)
	}

	v1Handlers, err := v1.NewHandlers(v1.NewOptions(scheduleUseCase))
	if err != nil {
		return fmt.Errorf("create v1 handlers: %v", err)
	}

	v1.RegisterHandlers(s.v1Group, &v1Handlers)

	eg.Go(func() error {
		<-ctx.Done()

		ctx, cancel := context.WithTimeout(context.Background(), shutdownTimeout)
		defer cancel()

		return s.srv.Shutdown(ctx) //nolint:contextcheck // graceful shutdown with new context
	})

	eg.Go(func() error {
		s.lg.Info("listen and serve", zap.String("serverAddr", s.srv.Addr))

		if err := s.srv.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
			return fmt.Errorf("listen and serve: %v", err)
		}
		return nil
	})

	return eg.Wait()
}
