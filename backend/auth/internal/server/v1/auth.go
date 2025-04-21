package v1

import (
	"context"

	"github.com/Slava02/SaintDiego/backend/auth/internal/models"
	"github.com/Slava02/SaintDiego/backend/auth/internal/usecases/auth"
	"github.com/Slava02/SaintDiego/backend/auth/pkg/pb"
	"github.com/opentracing/opentracing-go"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
)

type IVolunteersUC interface {
	CreateVolunteer(ctx context.Context, volunteer *models.Volunteer) (*models.Volunteer, error)
	GetVolunteerByTgId(ctx context.Context, tgId int64) (*models.Volunteer, error)
	UpdateVolunteer(ctx context.Context, updateVolunteerReq *auth.UpdateVolunteerReq) (*models.Volunteer, error)
}

func (v *Implementation) CreateVolunteer(ctx context.Context, req *pb.CreateVolunteerRequest) (*pb.Volunteer, error) {
	span, ctx := opentracing.StartSpanFromContext(ctx, "CreateVolunteer")
	defer span.Finish()

	volunteer := &models.Volunteer{
		FirstName:  req.FirstName,
		LastName:   req.LastName,
		MiddleName: req.MiddleName,
		TgLogin:    req.TgLogin,
		TGID:       req.TgId,
	}

	volunteer, err := v.authUC.CreateVolunteer(ctx, volunteer)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to create volunteer: %v", err)
	}

	return &pb.Volunteer{
		TgId:       volunteer.TGID,
		FirstName:  volunteer.FirstName,
		LastName:   volunteer.LastName,
		MiddleName: volunteer.MiddleName,
		TgLogin:    volunteer.TgLogin,
	}, nil
}
func (v *Implementation) GetVolunteerByTgId(ctx context.Context, req *pb.GetVolunteerByTgIdRequest) (*pb.Volunteer, error) {
	span, ctx := opentracing.StartSpanFromContext(ctx, "GetVolunteerByTgId")
	defer span.Finish()

	volunteer, err := v.authUC.GetVolunteerByTgId(ctx, req.TgId)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to get volunteer by tg id: %v", err)
	}

	return &pb.Volunteer{
		TgId:       volunteer.TGID,
		FirstName:  volunteer.FirstName,
		LastName:   volunteer.LastName,
		MiddleName: volunteer.MiddleName,
		TgLogin:    volunteer.TgLogin,
	}, nil
}

func (v *Implementation) UpdateVolunteer(ctx context.Context, req *pb.UpdateVolunteerRequest) (*pb.Volunteer, error) {
	span, ctx := opentracing.StartSpanFromContext(ctx, "UpdateVolunteer")
	defer span.Finish()

	updateVolunteerReq := &auth.UpdateVolunteerReq{
		TGID:       req.TgId,
		FirstName:  req.FirstName,
		LastName:   req.LastName,
		MiddleName: req.MiddleName,
	}

	volunteer, err := v.authUC.UpdateVolunteer(ctx, updateVolunteerReq)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to update volunteer: %v", err)
	}

	return &pb.Volunteer{
		TgId:       volunteer.TGID,
		FirstName:  volunteer.FirstName,
		LastName:   volunteer.LastName,
		MiddleName: volunteer.MiddleName,
		TgLogin:    volunteer.TgLogin,
	}, nil
}
