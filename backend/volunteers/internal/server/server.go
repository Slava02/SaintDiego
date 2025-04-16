package s

import (
	"context"
	"fmt"
	"net"
	"os"
	"os/signal"
	"syscall"

	"github.com/Slava02/SaintDiego/backend/common/closer"
	"github.com/Slava02/SaintDiego/backend/common/interceptors"
	"github.com/Slava02/SaintDiego/backend/volunteers/internal/config"
	"github.com/Slava02/SaintDiego/backend/volunteers/pkg/pb"
	"github.com/pkg/errors"
	"go.uber.org/zap"
	"google.golang.org/grpc"
	"google.golang.org/grpc/keepalive"
	"google.golang.org/grpc/reflection"

	grpcMiddleware "github.com/grpc-ecosystem/go-grpc-middleware"
)

//go:generate options-gen -out-filename=server_options.gen.go -from-struct=Options
type Options struct {
	Lg                *zap.Logger                `option:"mandatory" validate:"required"`
	ServerConfig      *config.ServerConfig       `option:"mandatory" validate:"required"`
	Production        bool                       `option:"optional" default:"false"`
	VolunteersService pb.VolunteersServiceServer `option:"mandatory" validate:"required"`
}

type Server struct {
	lg                *zap.Logger
	srv               *grpc.Server
	production        bool
	addr              string
	VolunteersService pb.VolunteersServiceServer
}

func New(opts Options) (*Server, error) {
	if err := opts.Validate(); err != nil {
		return nil, fmt.Errorf("validate options: %v", err)
	}

	srv := grpc.NewServer(grpc.KeepaliveParams(keepalive.ServerParameters{
		MaxConnectionIdle: opts.ServerConfig.MaxConnectionIdle,
		Timeout:           opts.ServerConfig.Timeout,
		MaxConnectionAge:  opts.ServerConfig.MaxConnectionAge,
		Time:              opts.ServerConfig.Time,
	}),

		grpc.UnaryInterceptor(
			grpcMiddleware.ChainUnaryServer(
				interceptors.LogInterceptor,
				interceptors.ServerTracingInterceptor,
			),
		),
	)

	return &Server{
		lg:                opts.Lg,
		srv:               srv,
		production:        opts.Production,
		addr:              opts.ServerConfig.Addr,
		VolunteersService: opts.VolunteersService,
	}, nil
}

func (s *Server) Run(ctx context.Context) error {
	defer closer.CloseAll()

	pb.RegisterVolunteersServiceServer(s.srv, s.VolunteersService)

	l, err := net.Listen("tcp", s.addr)
	if err != nil {
		return errors.Wrap(err, "net.Listen")
	}
	closer.Add(l.Close)

	go func() {
		s.lg.Info(fmt.Sprintf("GRPC s is listening on port: %v", s.addr))
		if err := s.srv.Serve(l); err != nil {
			s.lg.Fatal(fmt.Sprintf("s.srv.Serve: %v", err))
		}
	}()

	if !s.production {
		reflection.Register(s.srv)
	}

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, os.Interrupt, syscall.SIGTERM)

	select {
	case v := <-quit:
		s.lg.Error(fmt.Sprintf("signal.Notify: %v", v))
	case done := <-ctx.Done():
		s.lg.Error(fmt.Sprintf("ctx.Done: %v", done))
	}

	s.srv.GracefulStop()
	s.lg.Info("s Exited Properly")

	return nil
}
