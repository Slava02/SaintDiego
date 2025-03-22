package serverclient

import (
	"context"
	"errors"
	"fmt"
	"github.com/Slava02/SaintDiego/backend/api_gateway/pkg/closer"
	"github.com/labstack/echo/v4"
	"net/http"
	"time"

	"github.com/getkin/kin-openapi/openapi3"
	"github.com/labstack/echo/v4/middleware"
	"go.uber.org/zap"
	"golang.org/x/sync/errgroup"

	"github.com/Slava02/SaintDiego/backend/api_gateway/internal/middlewares"
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
	lg      *zap.Logger
	srv     *http.Server
	v1Group *echo.Group
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

	v1Group := e.Group("v1")

	return &Server{
		lg: zap.L().Named("server-apiGW"),
		srv: &http.Server{
			Addr:              opts.serverAddr,
			Handler:           e,
			ReadHeaderTimeout: readHeaderTimeout,
		},
		v1Group: v1Group,
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
