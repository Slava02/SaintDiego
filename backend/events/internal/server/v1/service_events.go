package v1

import (
	"context"

	"github.com/Slava02/SaintDiego/backend/events/internal/models"
	"github.com/Slava02/SaintDiego/backend/events/internal/usecases/events"
	"github.com/Slava02/SaintDiego/backend/events/pkg/pb"
	"github.com/opentracing/opentracing-go"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
	"google.golang.org/protobuf/types/known/timestamppb"
)

type IEventsUC interface {
	GetEvents(ctx context.Context, params *events.GetEventsParams) ([]*models.Event, int64, error)
	GetEvent(ctx context.Context, eventID int64) (*models.Event, error)
	UpdateEvent(ctx context.Context, req *events.UpdateEventRequest) (*models.Event, error)
	DeleteEvent(ctx context.Context, eventID int64) error
}

func (s *Implementation) GetEvents(ctx context.Context, req *pb.GetEventsRequest) (*pb.GetEventsResponse, error) {
	span, ctx := opentracing.StartSpanFromContext(ctx, "GetEvents")
	defer span.Finish()

	eventParams := &events.GetEventsParams{
		ParticipantID: req.ParticipantId,
		Status:        req.Status,
		LocationID:    req.LocationId,
		ServiceID:     req.ServiceId,
		Page:          req.Page,
		PerPage:       req.PerPage,
	}

	if req.FromDate != nil {
		fromDate := req.FromDate.AsTime()
		eventParams.FromDate = &fromDate
	}

	if req.ToDate != nil {
		toDate := req.ToDate.AsTime()
		eventParams.ToDate = &toDate
	}

	events, total, err := s.eventsUC.GetEvents(ctx, eventParams)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to get events: %v", err)
	}

	pbEvents := make([]*pb.Event, len(events))
	for i, event := range events {
		pbEvents[i] = convertModelEventToPB(event)
	}

	return &pb.GetEventsResponse{
		Events:  pbEvents,
		Total:   total,
		Page:    req.Page,
		PerPage: req.PerPage,
	}, nil
}

func (s *Implementation) GetEventById(ctx context.Context, req *pb.GetEventByIdRequest) (*pb.Event, error) {
	span, ctx := opentracing.StartSpanFromContext(ctx, "GetEventById")
	defer span.Finish()

	span.SetTag("id", req.Id)

	event, err := s.eventsUC.GetEvent(ctx, req.Id)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to get event: %v", err)
	}

	return convertModelEventToPB(event), nil
}

func (s *Implementation) UpdateEvent(ctx context.Context, req *pb.UpdateEventRequest) (*pb.Event, error) {
	span, ctx := opentracing.StartSpanFromContext(ctx, "UpdateEvent")
	defer span.Finish()

	span.SetTag("id", req.Id)

	event, err := s.eventsUC.UpdateEvent(ctx, &events.UpdateEventRequest{
		ID:       req.Id,
		Capacity: req.Capacity,
		Datetime: req.Datetime.AsTime(),
	})
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to update event: %v", err)
	}

	return convertModelEventToPB(event), nil
}

func (s *Implementation) DeleteEvent(ctx context.Context, req *pb.DeleteEventRequest) (*pb.DeleteEventResponse, error) {
	span, ctx := opentracing.StartSpanFromContext(ctx, "DeleteEvent")
	defer span.Finish()

	span.SetTag("id", req.Id)

	err := s.eventsUC.DeleteEvent(ctx, req.Id)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to delete event: %v", err)
	}

	return &pb.DeleteEventResponse{
		Success: true,
	}, nil
}

// Helper functions for converting between models and protobuf messages
func convertModelEventToPB(event *models.Event) *pb.Event {
	if event == nil {
		return nil
	}

	return &pb.Event{
		Id:                event.ID,
		TimeSlotServiceId: event.TimeSlotServiceID,
		Capacity:          event.Capacity,
		Datetime:          timestamppb.New(event.Datetime),
		ServiceTypeId:     event.ServiceTypeID,
	}
}
