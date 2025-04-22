package v1

import (
	"context"

	"github.com/Slava02/SaintDiego/backend/auth/internal/usecases/auth"
	pb "github.com/Slava02/SaintDiego/backend/auth/pkg/pb"
	"github.com/opentracing/opentracing-go"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
)

type IAuthUC interface {
	Login(ctx context.Context, req *auth.LoginRequest) (*auth.LoginResponse, error)
}

func (v *Implementation) Login(ctx context.Context, req *pb.LoginRequest) (*pb.LoginResponse, error) {
	span, ctx := opentracing.StartSpanFromContext(ctx, "Login")
	defer span.Finish()

	loginReq := &auth.LoginRequest{
		Login:    req.Login,
		Password: req.Password,
	}

	loginRes, err := v.authUC.Login(ctx, loginReq)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to login: %v", err)
	}

	return &pb.LoginResponse{
		Token: loginRes.Token,
	}, nil
}
