package serverclient

import (
	"context"
	"errors"
	"fmt"
	"net/http"
	"time"

	oapimdlwr "github.com/oapi-codegen/echo-middleware"

	"github.com/Slava02/SaintDiego/backend/api_gateway/pkg/closer"
	"github.com/labstack/echo/v4"

	"github.com/getkin/kin-openapi/openapi3"
	"github.com/getkin/kin-openapi/openapi3filter"
	"github.com/labstack/echo/v4/middleware"
	"go.uber.org/zap"
	"golang.org/x/sync/errgroup"

	"github.com/Slava02/SaintDiego/backend/api_gateway/internal/middlewares"
	v1 "github.com/Slava02/SaintDiego/backend/api_gateway/internal/server/v1"
)

const (
	readHeaderTimeout = time.Second
	shutdownTimeout   = 3 * time.Second
	nameServer        = "server-apiGW"
)

//go:generate options-gen -out-filename=server_options.gen.go -from-struct=Options
type Options struct {
	logger       *zap.Logger        `option:"mandatory" validate:"required"`
	serverAddr   string             `option:"mandatory" validate:"required,hostname_port"`
	allowOrigins []string           `option:"mandatory" validate:"min=1"`
	v1Swagger    *openapi3.T        `option:"mandatory" validate:"required"`
	eventsAddr   string             `option:"mandatory" validate:"required,hostname_port"`
	v1Handlers   v1.ServerInterface `option:"mandatory" validate:"required"`
}

type Server struct {
	lg  *zap.Logger
	srv *http.Server
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

	validatorMiddleware := oapimdlwr.OapiRequestValidatorWithOptions(opts.v1Swagger, &oapimdlwr.Options{
		Options: openapi3filter.Options{
			ExcludeRequestBody:  false,
			ExcludeResponseBody: true,
			AuthenticationFunc:  openapi3filter.NoopAuthenticationFunc,
		},
		SilenceServersWarning: true,
	})

	v1.RegisterHandlersWithBaseURL(e, opts.v1Handlers, "/v1")

	e.Group("/v1").Use(validatorMiddleware)

	return &Server{
		lg: zap.L().Named(nameServer),
		srv: &http.Server{
			Addr:              opts.serverAddr,
			Handler:           e,
			ReadHeaderTimeout: readHeaderTimeout,
		},
	}, nil
}

func (s *Server) Run(ctx context.Context) error {
	defer func() {
		closer.CloseAll()
		closer.Wait()
	}()

	eg, ctx := errgroup.WithContext(ctx)

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
