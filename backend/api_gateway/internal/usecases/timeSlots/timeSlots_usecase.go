package timeSlots

import (
	"context"
	"fmt"

	"github.com/Slava02/SaintDiego/backend/api_gateway/internal/models"
	pb "github.com/Slava02/SaintDiego/backend/schedule/pkg/pb"
	"google.golang.org/protobuf/types/known/timestamppb"
)

//go:generate options-gen -out-filename=usecase_options.gen.go -from-struct=Options
type Options struct {
	EventsClient IEventsClient `option:"mandatory" validate:"required"`
}

type UseCase struct {
	eventsClient IEventsClient
}

func New(opts Options) (*UseCase, error) {
	if err := opts.Validate(); err != nil {
		return nil, fmt.Errorf("validate options: %v", err)
	}

	return &UseCase{
		eventsClient: opts.EventsClient,
	}, nil
}

type IEventsClient interface {
	CreateTimeSlot(ctx context.Context, req *pb.CreateTimeSlotRequest) (*pb.TimeSlot, error)
	GetTimeSlots(ctx context.Context, req *pb.GetTimeSlotsRequest) (*pb.GetTimeSlotsResponse, error)
	GetTimeSlot(ctx context.Context, req *pb.GetTimeSlotRequest) (*pb.TimeSlot, error)
	DeleteTimeSlot(ctx context.Context, req *pb.DeleteTimeSlotRequest) (*pb.DeleteTimeSlotResponse, error)
	ActivateTimeSlot(ctx context.Context, req *pb.ActivateTimeSlotRequest) (*pb.TimeSlot, error)
	ArchiveTimeSlot(ctx context.Context, req *pb.ArchiveTimeSlotRequest) (*pb.TimeSlot, error)
	UpdateTimeSlot(ctx context.Context, req *pb.TimeSlot) (*pb.TimeSlot, error)
}

// TODO: тут бы проверять открыт ли данный сервис для регистрации
func (u UseCase) CreateTimeSlot(ctx context.Context, req *CreateTimeSlotReq) (*models.TimeSlot, error) {
	pbReq := &pb.CreateTimeSlotRequest{
		Title:      req.Title,
		Type:       req.Type,
		LocationId: req.LocationID,
		Capacity:   req.Capacity,
		StartDate:  timestamppb.New(req.StartDate),
		EndDate:    timestamppb.New(req.EndDate),
		Services:   make([]*pb.TimeSlotService, len(req.Services)),
	}

	if req.Recurrence != nil {
		pbReq.Recurrence = &pb.Recurrence{
			Frequency: req.Recurrence.Frequency,
			Interval:  req.Recurrence.Interval,
			EndType:   req.Recurrence.EndType,
		}
		if req.Recurrence.EndValue != nil {
			pbReq.Recurrence.EndValue = timestamppb.New(*req.Recurrence.EndValue)
		}
	}

	for i, service := range req.Services {
		pbReq.Services[i] = &pb.TimeSlotService{
			ServiceTypeId: service.ServiceTypeID,
			Capacity:      service.Capacity,
			BookingWindow: service.BookingWindow,
			Time:          timestamppb.New(service.Time),
		}
	}

	pbTimeSlot, err := u.eventsClient.CreateTimeSlot(ctx, pbReq)
	if err != nil {
		return nil, fmt.Errorf("create time slot: %w", err)
	}

	return convertPBTimeSlotToModel(pbTimeSlot), nil
}

func (u UseCase) GetTimeSlots(ctx context.Context, request *GetTimeSlotsReq) ([]*models.TimeSlot, error) {
	pbReq := &pb.GetTimeSlotsRequest{
		Status:    request.Status,
		StartDate: timestamppb.New(request.StartDate),
		EndDate:   timestamppb.New(request.EndDate),
	}

	pbResponse, err := u.eventsClient.GetTimeSlots(ctx, pbReq)
	if err != nil {
		return nil, fmt.Errorf("get time slots: %w", err)
	}

	result := make([]*models.TimeSlot, len(pbResponse.TimeSlots))
	for i, pbTimeSlot := range pbResponse.TimeSlots {
		result[i] = convertPBTimeSlotToModel(pbTimeSlot)
	}

	return result, nil
}

func (u UseCase) GetTimeSlot(ctx context.Context, id int64) (*models.TimeSlot, error) {
	pbReq := &pb.GetTimeSlotRequest{
		Id: id,
	}

	pbTimeSlot, err := u.eventsClient.GetTimeSlot(ctx, pbReq)
	if err != nil {
		return nil, fmt.Errorf("get time slot: %w", err)
	}

	return convertPBTimeSlotToModel(pbTimeSlot), nil
}

func (u UseCase) DeleteTimeSlot(ctx context.Context, id int64) error {
	pbReq := &pb.DeleteTimeSlotRequest{
		Id: id,
	}

	_, err := u.eventsClient.DeleteTimeSlot(ctx, pbReq)
	if err != nil {
		return fmt.Errorf("delete time slot: %w", err)
	}

	return nil
}

func (u UseCase) ActivateTimeSlot(ctx context.Context, id int64) error {
	pbReq := &pb.ActivateTimeSlotRequest{
		Id: id,
	}

	_, err := u.eventsClient.ActivateTimeSlot(ctx, pbReq)
	if err != nil {
		return fmt.Errorf("activate time slot: %w", err)
	}

	return nil
}

func (u UseCase) ArchiveTimeSlot(ctx context.Context, id int64) error {
	pbReq := &pb.ArchiveTimeSlotRequest{
		Id: id,
	}

	_, err := u.eventsClient.ArchiveTimeSlot(ctx, pbReq)
	if err != nil {
		return fmt.Errorf("archive time slot: %w", err)
	}

	return nil
}

func (u UseCase) UpdateTimeSlot(ctx context.Context, req *models.TimeSlot) (*models.TimeSlot, error) {
	pbTimeSlot := &pb.TimeSlot{
		Id:         req.ID,
		Title:      req.Title,
		Type:       req.Type,
		LocationId: req.LocationID,
		Capacity:   req.Capacity,
		StartDate:  timestamppb.New(req.StartDate),
		EndDate:    timestamppb.New(req.EndDate),
		Status:     req.Status,
		Services:   make([]*pb.TimeSlotService, len(req.Services)),
	}

	if req.Recurrence != nil {
		pbTimeSlot.Recurrence = &pb.Recurrence{
			Frequency: req.Recurrence.Frequency,
			Interval:  req.Recurrence.Interval,
			EndType:   req.Recurrence.EndType,
		}
		if req.Recurrence.EndValue != nil {
			pbTimeSlot.Recurrence.EndValue = timestamppb.New(*req.Recurrence.EndValue)
		}
	}

	for i, service := range req.Services {
		pbTimeSlot.Services[i] = &pb.TimeSlotService{
			Id:            service.ID,
			ServiceTypeId: service.ServiceTypeID,
			Capacity:      service.Capacity,
			BookingWindow: service.BookingWindow,
			Time:          timestamppb.New(service.Time),
		}
	}

	pbTimeSlot, err := u.eventsClient.UpdateTimeSlot(ctx, pbTimeSlot)
	if err != nil {
		return nil, fmt.Errorf("update time slot: %w", err)
	}

	return convertPBTimeSlotToModel(pbTimeSlot), nil
}
