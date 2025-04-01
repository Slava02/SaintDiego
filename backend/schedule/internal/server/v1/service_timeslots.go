package v1

import (
	"context"

	"github.com/Slava02/SaintDiego/backend/schedule/internal/models"
	"github.com/Slava02/SaintDiego/backend/schedule/internal/usecases/timeSlots"
	"github.com/Slava02/SaintDiego/backend/schedule/pkg/pb"
	"github.com/opentracing/opentracing-go"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
	"google.golang.org/protobuf/types/known/timestamppb"
)

const (
	newTimeSlotID = 0
)

type ITimeSlotsUC interface {
	CreateTimeSlot(ctx context.Context, req *timeSlots.CreateTimeSlotReq) (*models.TimeSlot, error)
	GetTimeSlots(ctx context.Context, req *timeSlots.GetTimeSlotsReq) ([]*models.TimeSlot, error)
	GetTimeSlot(ctx context.Context, id int64) (*models.TimeSlot, error)
	DeleteTimeSlot(ctx context.Context, id int64) error
	ActivateTimeSlot(ctx context.Context, id int64) error
	ArchiveTimeSlot(ctx context.Context, id int64) error
	UpdateTimeSlot(ctx context.Context, req *models.TimeSlot) (*models.TimeSlot, error)
	GetEvents(ctx context.Context, req *timeSlots.GetEventsReq) ([]*models.Event, error)
}

func (i *Implementation) GetTimeSlot(ctx context.Context, req *pb.GetTimeSlotRequest) (*pb.TimeSlot, error) {
	span, ctx := opentracing.StartSpanFromContext(ctx, "GetTimeSlot")
	defer span.Finish()

	span.SetTag("id", req.GetId())

	timeSlot, err := i.timeSlotUC.GetTimeSlot(ctx, req.Id)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to get time slot: %v", err)
	}

	return convertModelTimeSlotToPB(timeSlot), nil
}

func (i *Implementation) GetTimeSlots(ctx context.Context, req *pb.GetTimeSlotsRequest) (*pb.GetTimeSlotsResponse, error) {
	span, ctx := opentracing.StartSpanFromContext(ctx, "GetTimeSlots")
	defer span.Finish()

	timeSlots, err := i.timeSlotUC.GetTimeSlots(ctx, &timeSlots.GetTimeSlotsReq{
		Status:    req.Status,
		StartDate: req.StartDate.AsTime(),
		EndDate:   req.EndDate.AsTime(),
	})
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to get time slots: %v", err)
	}

	pbTimeSlots := make([]*pb.TimeSlot, len(timeSlots))
	for i, timeSlot := range timeSlots {
		pbTimeSlots[i] = convertModelTimeSlotToPB(timeSlot)
	}

	return &pb.GetTimeSlotsResponse{
		TimeSlots: pbTimeSlots,
	}, nil
}

func (i *Implementation) CreateTimeSlot(ctx context.Context, req *pb.CreateTimeSlotRequest) (*pb.TimeSlot, error) {
	span, ctx := opentracing.StartSpanFromContext(ctx, "CreateTimeSlot")
	defer span.Finish()

	timeSlot, err := i.timeSlotUC.CreateTimeSlot(ctx, &timeSlots.CreateTimeSlotReq{
		Title:      req.Title,
		Type:       req.Type,
		LocationID: req.LocationId,
		Capacity:   req.Capacity,
		StartDate:  req.StartDate.AsTime(),
		EndDate:    req.EndDate.AsTime(),
		Services:   convertPBServicesToModel(req.Services, newTimeSlotID),
		Recurrence: convertPBRecurrenceToModel(req.Recurrence),
	})
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to create time slot: %v", err)
	}

	return convertModelTimeSlotToPB(timeSlot), nil
}

func (i *Implementation) UpdateTimeSlot(ctx context.Context, req *pb.TimeSlot) (*pb.TimeSlot, error) {
	span, ctx := opentracing.StartSpanFromContext(ctx, "UpdateTimeSlot")
	defer span.Finish()

	span.SetTag("id", req.Id)

	timeSlot, err := i.timeSlotUC.UpdateTimeSlot(ctx, &models.TimeSlot{
		ID:         req.Id,
		Title:      req.Title,
		Type:       req.Type,
		LocationID: req.LocationId,
		Capacity:   req.Capacity,
		StartDate:  req.StartDate.AsTime(),
		EndDate:    req.EndDate.AsTime(),
		Status:     req.Status,
		Services:   convertPBServicesToModel(req.Services, req.Id),
		Recurrence: convertPBRecurrenceToModel(req.Recurrence),
	})
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to update time slot: %v", err)
	}

	return convertModelTimeSlotToPB(timeSlot), nil
}

func (i *Implementation) DeleteTimeSlot(ctx context.Context, req *pb.DeleteTimeSlotRequest) (*pb.DeleteTimeSlotResponse, error) {
	span, ctx := opentracing.StartSpanFromContext(ctx, "DeleteTimeSlot")
	defer span.Finish()

	span.SetTag("id", req.Id)

	err := i.timeSlotUC.DeleteTimeSlot(ctx, req.Id)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to delete time slot: %v", err)
	}

	return &pb.DeleteTimeSlotResponse{
		Success: true,
	}, nil
}

func (i *Implementation) ArchiveTimeSlot(ctx context.Context, req *pb.ArchiveTimeSlotRequest) (*pb.TimeSlot, error) {
	span, ctx := opentracing.StartSpanFromContext(ctx, "ArchiveTimeSlot")
	defer span.Finish()

	span.SetTag("id", req.Id)

	err := i.timeSlotUC.ArchiveTimeSlot(ctx, req.Id)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to archive time slot: %v", err)
	}

	timeSlot, err := i.timeSlotUC.GetTimeSlot(ctx, req.Id)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to get archived time slot: %v", err)
	}

	return convertModelTimeSlotToPB(timeSlot), nil
}

func (i *Implementation) ActivateTimeSlot(ctx context.Context, req *pb.ActivateTimeSlotRequest) (*pb.TimeSlot, error) {
	span, ctx := opentracing.StartSpanFromContext(ctx, "ActivateTimeSlot")
	defer span.Finish()

	span.SetTag("id", req.Id)

	err := i.timeSlotUC.ActivateTimeSlot(ctx, req.Id)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to activate time slot: %v", err)
	}

	timeSlot, err := i.timeSlotUC.GetTimeSlot(ctx, req.Id)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to get activated time slot: %v", err)
	}

	return convertModelTimeSlotToPB(timeSlot), nil
}

func (i *Implementation) GetEvents(ctx context.Context, req *pb.GetEventsRequest) (*pb.GetEventsResponse, error) {
	span, ctx := opentracing.StartSpanFromContext(ctx, "GetEvents")
	defer span.Finish()

	events, err := i.timeSlotUC.GetEvents(ctx, &timeSlots.GetEventsReq{
		EventStatus: req.EventStatus,
	})
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to get events: %v", err)
	}

	return &pb.GetEventsResponse{
		Events: convertModelEventsToPBEvents(events),
	}, nil
}

// Helper functions for converting between models and protobuf messages
func convertModelTimeSlotToPB(timeSlot *models.TimeSlot) *pb.TimeSlot {
	if timeSlot == nil {
		return nil
	}

	return &pb.TimeSlot{
		Id:         timeSlot.ID,
		Title:      timeSlot.Title,
		Type:       timeSlot.Type,
		LocationId: timeSlot.LocationID,
		Capacity:   timeSlot.Capacity,
		StartDate:  timestamppb.New(timeSlot.StartDate),
		EndDate:    timestamppb.New(timeSlot.EndDate),
		Status:     timeSlot.Status,
		Services:   convertModelServicesToPBServices(timeSlot.Services),
		Recurrence: convertModelRecurrenceToPBRecurrence(timeSlot.Recurrence),
	}
}

func convertPBServicesToModel(services []*pb.TimeSlotService, timeSlotID int64) []*models.TimeSlotService {
	if services == nil {
		return nil
	}

	modelServices := make([]*models.TimeSlotService, len(services))
	for i, service := range services {
		modelServices[i] = &models.TimeSlotService{
			TimeSlotID:    timeSlotID,
			ID:            service.Id,
			ServiceTypeID: service.ServiceTypeId,
			Capacity:      service.Capacity,
			BookingWindow: service.BookingWindow,
			Time:          service.Time.AsTime(),
		}
	}
	return modelServices
}

func convertModelServicesToPBServices(services []*models.TimeSlotService) []*pb.TimeSlotService {
	if services == nil {
		return nil
	}

	pbServices := make([]*pb.TimeSlotService, len(services))
	for i, service := range services {
		pbServices[i] = &pb.TimeSlotService{
			Id:            service.ID,
			ServiceTypeId: service.ServiceTypeID,
			Capacity:      service.Capacity,
			BookingWindow: service.BookingWindow,
			Time:          timestamppb.New(service.Time),
		}
	}

	return pbServices
}

func convertPBRecurrenceToModel(recurrence *pb.Recurrence) *models.TimeSlotRecurrence {
	if recurrence == nil {
		return nil
	}

	return &models.TimeSlotRecurrence{
		Frequency: recurrence.Frequency,
		Interval:  recurrence.Interval,
		EndType:   recurrence.EndType,
		EndValue:  recurrence.EndValue.AsTime(),
	}
}

func convertModelRecurrenceToPBRecurrence(recurrence *models.TimeSlotRecurrence) *pb.Recurrence {
	if recurrence == nil {
		return nil
	}

	return &pb.Recurrence{
		Frequency: recurrence.Frequency,
		Interval:  recurrence.Interval,
		EndType:   recurrence.EndType,
		EndValue:  timestamppb.New(recurrence.EndValue),
	}
}

func convertModelEventsToPBEvents(events []*models.Event) []*pb.Event {
	if events == nil {
		return nil
	}

	pbEvents := make([]*pb.Event, len(events))
	for i, event := range events {
		pbEvents[i] = &pb.Event{
			Id:                event.ID,
			TimeSlotServiceId: event.TimeSlotServiceID,
			Datetime:          timestamppb.New(event.DateTime),
			Capacity:          event.Capacity,
		}
	}

	return pbEvents
}
