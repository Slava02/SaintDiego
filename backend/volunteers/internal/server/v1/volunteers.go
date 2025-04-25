package v1

import (
	"context"
	"errors"

	"github.com/Slava02/SaintDiego/backend/volunteers/internal/models"
	"github.com/Slava02/SaintDiego/backend/volunteers/internal/usecases/volunteers"
	"github.com/Slava02/SaintDiego/backend/volunteers/pkg/pb"
	"github.com/opentracing/opentracing-go"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
)

type IVolunteersUC interface {
	CreateVolunteer(ctx context.Context, volunteer *models.Volunteer) (*models.Volunteer, error)
	GetVolunteerByTgId(ctx context.Context, tgId int64) (*models.Volunteer, error)
	UpdateVolunteer(ctx context.Context, updateVolunteerReq *volunteers.UpdateVolunteerReq) (*models.Volunteer, error)
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

	volunteer, err := v.volunteersUC.CreateVolunteer(ctx, volunteer)
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

	volunteer, err := v.volunteersUC.GetVolunteerByTgId(ctx, req.TgId)
	if err != nil {
		if errors.Is(err, volunteers.ErrVolunteerNotFound) {
			return nil, status.Errorf(codes.NotFound, "volunteer not found")
		}
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

	updateVolunteerReq := &volunteers.UpdateVolunteerReq{
		TGID:       req.TgId,
		FirstName:  req.FirstName,
		LastName:   req.LastName,
		MiddleName: req.MiddleName,
	}

	volunteer, err := v.volunteersUC.UpdateVolunteer(ctx, updateVolunteerReq)
	if err != nil {
		if errors.Is(err, volunteers.ErrVolunteerNotFound) {
			return nil, status.Errorf(codes.NotFound, "volunteer not found")
		}
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
