package volunteers

import (
	"context"
	"fmt"

	"github.com/Slava02/SaintDiego/backend/api_gateway/internal/models"
	"github.com/Slava02/SaintDiego/backend/volunteers/pkg/pb"
)

type IVolunteersClient interface {
	CreateVolunteer(ctx context.Context, req *pb.CreateVolunteerRequest) (*pb.Volunteer, error)
	GetVolunteerByTgId(ctx context.Context, req *pb.GetVolunteerByTgIdRequest) (*pb.Volunteer, error)
	UpdateVolunteer(ctx context.Context, req *pb.UpdateVolunteerRequest) (*pb.Volunteer, error)
}

//go:generate options-gen -out-filename=usecase_options.gen.go -from-struct=Options
type Options struct {
	VolunteersClient IVolunteersClient `option:"mandatory" validate:"required"`
}

type UseCase struct {
	volunteersClient IVolunteersClient
}

func New(opts Options) (*UseCase, error) {
	if err := opts.Validate(); err != nil {
		return nil, fmt.Errorf("validate options: %w", err)
	}

	return &UseCase{
		volunteersClient: opts.VolunteersClient,
	}, nil
}

func (u *UseCase) PostVolunteers(ctx context.Context, req *CreateVolunteerRequest) (*models.Volunteer, error) {
	pbReq := &pb.CreateVolunteerRequest{
		TgId:       req.TgId,
		TgLogin:    req.TgLogin,
		FirstName:  req.FirstName,
		MiddleName: req.MiddleName,
		LastName:   req.LastName,
	}

	pbRes, err := u.volunteersClient.CreateVolunteer(ctx, pbReq)
	if err != nil {
		return nil, fmt.Errorf("create volunteer: %w", err)
	}

	return &models.Volunteer{
		TgId:       pbRes.TgId,
		TgLogin:    pbRes.TgLogin,
		FirstName:  pbRes.FirstName,
		MiddleName: pbRes.MiddleName,
		LastName:   pbRes.LastName,
	}, nil
}

func (u *UseCase) GetVolunteersTgId(ctx context.Context, tgId int64) (*models.Volunteer, error) {
	pbReq := &pb.GetVolunteerByTgIdRequest{
		TgId: tgId,
	}

	pbRes, err := u.volunteersClient.GetVolunteerByTgId(ctx, pbReq)
	if err != nil {
		return nil, fmt.Errorf("get volunteer by tg id: %w", err)
	}

	return &models.Volunteer{
		TgId:       pbRes.TgId,
		TgLogin:    pbRes.TgLogin,
		FirstName:  pbRes.FirstName,
		MiddleName: pbRes.MiddleName,
		LastName:   pbRes.LastName,
	}, nil
}

func (u *UseCase) PutVolunteersTgId(ctx context.Context, req *UpdateVolunteerRequest) (*models.Volunteer, error) {
	pbReq := &pb.UpdateVolunteerRequest{
		TgId:       req.TgId,
		FirstName:  req.FirstName,
		MiddleName: req.MiddleName,
		LastName:   req.LastName,
	}

	pbRes, err := u.volunteersClient.UpdateVolunteer(ctx, pbReq)
	if err != nil {
		return nil, fmt.Errorf("update volunteer: %w", err)
	}

	return &models.Volunteer{
		TgId:       pbRes.TgId,
		TgLogin:    pbRes.TgLogin,
		FirstName:  pbRes.FirstName,
		MiddleName: pbRes.MiddleName,
		LastName:   pbRes.LastName,
	}, nil
}
