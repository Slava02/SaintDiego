package auth

import (
	"context"
	"fmt"

	"github.com/Slava02/SaintDiego/backend/auth/pkg/pb"
)

type IAuthClient interface {
	Login(ctx context.Context, req *pb.LoginRequest) (*pb.LoginResponse, error)
	Logout(ctx context.Context, req *pb.LogoutRequest) error
}

//go:generate options-gen -out-filename=usecase_options.gen.go -from-struct=Options
type Options struct {
	AuthClient IAuthClient `option:"mandatory" validate:"required"`
}

type UseCase struct {
	authClient IAuthClient
}

func New(opts Options) (*UseCase, error) {
	if err := opts.Validate(); err != nil {
		return nil, fmt.Errorf("validate options: %v", err)
	}

	return &UseCase{
		authClient: opts.AuthClient,
	}, nil
}

func (u *UseCase) Login(ctx context.Context, req *LoginRequest) (*LoginResponse, error) {
	pbReq := &pb.LoginRequest{
		Email:    req.Email,
		Password: req.Password,
	}

	pbRes, err := u.authClient.Login(ctx, pbReq)
	if err != nil {
		return nil, fmt.Errorf("login: %v", err)
	}

	return &LoginResponse{
		Token: pbRes.Token,
	}, nil
}

func (u *UseCase) Logout(ctx context.Context, req *LogoutRequest) error {
	pbReq := &pb.LogoutRequest{
		Token: req.Token,
	}

	return u.authClient.Logout(ctx, pbReq)
}
