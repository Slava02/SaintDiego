package services

import (
	"context"
	"fmt"
	"time"

	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"

	api "github.com/Slava02/SaintDiego/backend/volunteers/pkg/pb"
	"github.com/grpc-ecosystem/go-grpc-middleware/v2/interceptors/retry"
)

//go:generate options-gen -out-filename=volunteers_options.gen.go -from-struct=VolunteersClientOptions
type VolunteersClientOptions struct {
	VolunteersServerAddr string `option:"mandatory" validate:"required"`
}

type VolunteersClient struct {
	conn *grpc.ClientConn
	api.VolunteersServiceClient
}

func NewVolunteersClient(opts VolunteersClientOptions) (*VolunteersClient, error) {
	if err := opts.Validate(); err != nil {
		return nil, fmt.Errorf("validate options: %w", err)
	}

	ctx, cancel := context.WithTimeout(context.Background(), connectionTimeout)
	defer cancel()

	// Create gRPC connection with tracing interceptor and blocking mode
	conn, err := grpc.DialContext(ctx, opts.VolunteersServerAddr,
		grpc.WithUnaryInterceptor(retry.UnaryClientInterceptor(
			retry.WithMax(3),
			retry.WithPerRetryTimeout(2*time.Second),
		)),
		grpc.WithTransportCredentials(insecure.NewCredentials()),
		grpc.WithBlock(), // Wait for connection to be established
	)
	if err != nil {
		return nil, fmt.Errorf("failed to connect to Volunteers service: %w", err)
	}

	return &VolunteersClient{
		conn,
		api.NewVolunteersServiceClient(conn),
	}, nil
}

// Close closes the gRPC connection
func (c *VolunteersClient) Close() error {
	return c.conn.Close()
}

func (c *VolunteersClient) CreateVolunteer(ctx context.Context, req *api.CreateVolunteerRequest) (*api.Volunteer, error) {
	return c.VolunteersServiceClient.CreateVolunteer(ctx, req)
}

func (c *VolunteersClient) GetVolunteerByTgId(ctx context.Context, req *api.GetVolunteerByTgIdRequest) (*api.Volunteer, error) {
	return c.VolunteersServiceClient.GetVolunteerByTgId(ctx, req)
}

func (c *VolunteersClient) UpdateVolunteer(ctx context.Context, req *api.UpdateVolunteerRequest) (*api.Volunteer, error) {
	return c.VolunteersServiceClient.UpdateVolunteer(ctx, req)
}
