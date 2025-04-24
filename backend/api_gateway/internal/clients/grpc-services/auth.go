package services

import (
	"context"
	"fmt"
	"time"

	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"

	api "github.com/Slava02/SaintDiego/backend/auth/pkg/pb"
	"github.com/grpc-ecosystem/go-grpc-middleware/v2/interceptors/retry"
)

//go:generate options-gen -out-filename=auth_options.gen.go -from-struct=AuthClientOptions
type AuthClientOptions struct {
	AuthServerAddr string `option:"mandatory" validate:"required"`
}

type AuthClient struct {
	conn *grpc.ClientConn
	api.AuthClient
}

func NewAuthClient(opts AuthClientOptions) (*AuthClient, error) {
	if err := opts.Validate(); err != nil {
		return nil, fmt.Errorf("validate options: %w", err)
	}

	ctx, cancel := context.WithTimeout(context.Background(), connectionTimeout)
	defer cancel()

	conn, err := grpc.DialContext(ctx, opts.AuthServerAddr,
		grpc.WithUnaryInterceptor(retry.UnaryClientInterceptor(
			retry.WithMax(3),
			retry.WithPerRetryTimeout(2*time.Second),
		)),
		grpc.WithTransportCredentials(insecure.NewCredentials()),
		grpc.WithBlock(),
	)
	if err != nil {
		return nil, fmt.Errorf("failed to connect to Auth service: %w", err)
	}

	return &AuthClient{
		conn,
		api.NewAuthClient(conn),
	}, nil
}

// Close closes the gRPC connection
func (c *AuthClient) Close() error {
	return c.conn.Close()
}

func (c *AuthClient) Login(ctx context.Context, req *api.LoginRequest) (*api.LoginResponse, error) {
	return c.AuthClient.Login(ctx, req)
}
