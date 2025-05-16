package v1

import (
	"bytes"
	"context"
	"errors"
	"io"

	"github.com/Slava02/SaintDiego/backend/events/internal/models"
	"github.com/Slava02/SaintDiego/backend/events/internal/usecases/events"
	"github.com/Slava02/SaintDiego/backend/events/pkg/pb"
	"github.com/opentracing/opentracing-go"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
	"google.golang.org/protobuf/types/known/timestamppb"
)

const chunkSize = 64 * 1024 // 64 КБ

type IEventsUC interface {
	GetEvents(ctx context.Context, params *events.GetEventsParams) ([]*models.Event, int64, error)
	GetEvent(ctx context.Context, eventID int64) (*models.Event, error)
	UpdateEvent(ctx context.Context, req *events.UpdateEventRequest) (*models.Event, error)
	DeleteEvent(ctx context.Context, eventID int64) error
	AddParticipantToEvent(ctx context.Context, params *events.AddParticipantToEventRequest) error
	GetParticipantsByEventId(ctx context.Context, params *events.GetEventsIdParticipantsParams) ([]*models.Participant, int64, error)
	GetAvailableEventsForClientByServiceId(ctx context.Context, params *events.GetAvailableEventsForClientByServiceIdParams) ([]*models.Event, int64, error)
	DeleteParticipantFromEvent(ctx context.Context, req *events.DeleteParticipantFromEventRequest) error
	GetClientsIdEvents(ctx context.Context, params *events.GetClientsIdEventsParams) ([]*models.Event, int64, error)
	GetParticipantsByEventIdReport(ctx context.Context, eventID int64) (*bytes.Buffer, error)
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

	eventsResponse, total, err := s.eventsUC.GetEvents(ctx, eventParams)
	if err != nil {
		switch {
		case errors.Is(err, events.ErrClientNotFound):
			return nil, status.Errorf(codes.NotFound, "client not found")
		default:
			return nil, status.Errorf(codes.Internal, "failed to get events: %v", err)
		}
	}

	pbEvents := make([]*pb.Event, len(eventsResponse))
	for i, event := range eventsResponse {
		pbEvents[i] = convertModelEventToPB(event)
	}

	return &pb.GetEventsResponse{
		Events: pbEvents,
		Total:  total,
	}, nil
}

func (s *Implementation) GetEventById(ctx context.Context, req *pb.GetEventByIdRequest) (*pb.Event, error) {
	span, ctx := opentracing.StartSpanFromContext(ctx, "GetEventById")
	defer span.Finish()

	span.SetTag("id", req.Id)

	event, err := s.eventsUC.GetEvent(ctx, req.Id)
	if err != nil {
		switch {
		case errors.Is(err, events.ErrEventNotFound):
			return nil, status.Errorf(codes.NotFound, "event not found")
		default:
			return nil, status.Errorf(codes.Internal, "failed to get event: %v", err)
		}
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
		switch {
		case errors.Is(err, events.ErrEventNotFound):
			return nil, status.Errorf(codes.NotFound, "event not found")
		default:
			return nil, status.Errorf(codes.Internal, "failed to update event: %v", err)
		}
	}

	return convertModelEventToPB(event), nil
}

func (s *Implementation) DeleteEvent(ctx context.Context, req *pb.DeleteEventRequest) (*pb.DeleteEventResponse, error) {
	span, ctx := opentracing.StartSpanFromContext(ctx, "DeleteEvent")
	defer span.Finish()

	span.SetTag("id", req.Id)

	err := s.eventsUC.DeleteEvent(ctx, req.Id)
	if err != nil {
		switch {
		case errors.Is(err, events.ErrEventNotFound):
			return nil, status.Errorf(codes.NotFound, "event not found")
		default:
			return nil, status.Errorf(codes.Internal, "failed to delete event: %v", err)
		}
	}

	return &pb.DeleteEventResponse{
		Success: true,
	}, nil
}

func (s *Implementation) AddParticipantToEvent(ctx context.Context, req *pb.AddParticipantToEventRequest) (*pb.AddParticipantToEventResponse, error) {
	span, ctx := opentracing.StartSpanFromContext(ctx, "AddParticipantToEvent")
	defer span.Finish()

	span.SetTag("event_id", req.EventId)
	span.SetTag("participant_id", req.ParticipantId)

	addParticipantToEventParams := &events.AddParticipantToEventRequest{
		EventID:       req.EventId,
		ParticipantID: req.ParticipantId,
		VolunteerID:   req.VolunteerId,
	}

	err := s.eventsUC.AddParticipantToEvent(ctx, addParticipantToEventParams)
	if err != nil {
		switch {
		case errors.Is(err, events.ErrEventNotFound):
			return nil, status.Errorf(codes.NotFound, "event not found")
		case errors.Is(err, events.ErrClientNotFound):
			return nil, status.Errorf(codes.NotFound, "client not found")
		case errors.Is(err, events.ErrEventIsFull):
			return nil, status.Errorf(codes.ResourceExhausted, "event is full")
		case errors.Is(err, events.ErrTimeSlotIsFull):
			return nil, status.Errorf(codes.ResourceExhausted, "time slot is full")
		case errors.Is(err, events.ErrClientAlreadyParticipant):
			return nil, status.Errorf(codes.AlreadyExists, "client already participant")
		default:
			return nil, status.Errorf(codes.Internal, "failed to add participant to event: %v", err)
		}
	}

	return &pb.AddParticipantToEventResponse{
		Success: true,
	}, nil
}

func (s *Implementation) GetParticipantsByEventId(ctx context.Context, req *pb.GetParticipantsByEventIdRequest) (*pb.GetParticipantsByEventIdResponse, error) {
	span, ctx := opentracing.StartSpanFromContext(ctx, "GetParticipantsByEventId")
	defer span.Finish()

	span.SetTag("event_id", req.EventId)

	participants, total, err := s.eventsUC.GetParticipantsByEventId(ctx, &events.GetEventsIdParticipantsParams{
		EventID: req.EventId,
		Page:    req.Page,
		PerPage: req.PerPage,
	})
	if err != nil {
		switch {
		case errors.Is(err, events.ErrEventNotFound):
			return nil, status.Errorf(codes.NotFound, "event not found")
		default:
			return nil, status.Errorf(codes.Internal, "failed to get participants by event id: %v", err)
		}
	}

	pbParticipants := make([]*pb.Participant, len(participants))
	for i, participant := range participants {
		pbParticipants[i] = convertModelParticipantToPB(participant)
	}

	return &pb.GetParticipantsByEventIdResponse{
		Participants: pbParticipants,
		Total:        total,
	}, nil
}

func (s *Implementation) GetParticipantsByEventIdReport(req *pb.GetParticipantsByEventIdReportRequest, stream pb.EventsService_GetParticipantsByEventIdReportServer) error {
	ctx := stream.Context()

	span, ctx := opentracing.StartSpanFromContext(ctx, "GetParticipantsByEventIdReport")
	defer span.Finish()

	span.SetTag("event_id", req.EventId)

	report, err := s.eventsUC.GetParticipantsByEventIdReport(ctx, req.EventId)
	if err != nil {
		return status.Errorf(codes.Internal, "failed to get participants by event id report: %v", err)
	}

	buffer := make([]byte, chunkSize)
	for {
		n, err := report.Read(buffer)
		if err == io.EOF {
			break
		}
		if err != nil {
			return status.Errorf(codes.Internal, "failed to read report: %v", err)
		}

		// Отправляем чанк
		if err := stream.Send(&pb.GetParticipantsByEventIdReportResponse{
			Report: buffer[:n],
		}); err != nil {
			return status.Errorf(codes.Internal, "failed to send report chunk: %v", err)
		}
	}

	return nil
}

func (s *Implementation) GetAvailableEventsForClientByServiceId(ctx context.Context, req *pb.GetAvailableEventsForClientByServiceIdRequest) (*pb.GetAvailableEventsForClientByServiceIdResponse, error) {
	span, ctx := opentracing.StartSpanFromContext(ctx, "GetAvailableEventsForClientByServiceId")
	defer span.Finish()

	span.SetTag("service_id", req.ServiceId)

	events, total, err := s.eventsUC.GetAvailableEventsForClientByServiceId(ctx, &events.GetAvailableEventsForClientByServiceIdParams{
		ServiceID: req.ServiceId,
		ClientID:  req.ClientId,
		Page:      req.Page,
		PerPage:   req.PerPage,
	})
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to get events by service id: %v", err)
	}

	pbEvents := make([]*pb.Event, len(events))
	for i, event := range events {
		pbEvents[i] = convertModelEventToPB(event)
	}

	return &pb.GetAvailableEventsForClientByServiceIdResponse{
		Events: pbEvents,
		Total:  total,
	}, nil
}

func (s *Implementation) DeleteParticipantFromEvent(ctx context.Context, req *pb.DeleteParticipantFromEventRequest) (*pb.DeleteParticipantFromEventResponse, error) {
	span, ctx := opentracing.StartSpanFromContext(ctx, "DeleteParticipantFromEvent")
	defer span.Finish()

	span.SetTag("event_id", req.EventId)
	span.SetTag("participant_id", req.ParticipantId)

	err := s.eventsUC.DeleteParticipantFromEvent(ctx, &events.DeleteParticipantFromEventRequest{
		EventID:       req.EventId,
		ParticipantID: req.ParticipantId,
	})
	if err != nil {
		switch {
		case errors.Is(err, events.ErrEventNotFound):
			return nil, status.Errorf(codes.NotFound, "event not found")
		case errors.Is(err, events.ErrClientNotFound):
			return nil, status.Errorf(codes.NotFound, "client not found")
		default:
			return nil, status.Errorf(codes.Internal, "failed to delete participant from event: %v", err)
		}
	}

	return &pb.DeleteParticipantFromEventResponse{
		Success: true,
	}, nil
}

func (s *Implementation) GetClientsIdEvents(ctx context.Context, req *pb.GetClientsIdEventsRequest) (*pb.GetClientsIdEventsResponse, error) {
	span, ctx := opentracing.StartSpanFromContext(ctx, "GetClientsIdEvents")
	defer span.Finish()

	span.SetTag("id", req.Id)

	eventsResponse, total, err := s.eventsUC.GetClientsIdEvents(ctx, &events.GetClientsIdEventsParams{
		ID:      req.Id,
		Page:    req.Page,
		PerPage: req.PerPage,
	})
	if err != nil {
		switch {
		case errors.Is(err, events.ErrClientNotFound):
			return nil, status.Errorf(codes.NotFound, "client not found")
		default:
			return nil, status.Errorf(codes.Internal, "failed to get clients id events: %v", err)
		}
	}

	pbEvents := make([]*pb.Event, len(eventsResponse))
	for i, event := range eventsResponse {
		pbEvents[i] = convertModelEventToPB(event)
	}

	return &pb.GetClientsIdEventsResponse{
		Events: pbEvents,
		Total:  total,
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
		ParticipantsCount: event.ParticipantsCount,
		ServiceName:       event.ServiceName,
		Location:          convertModelLocationToPB(event.Location),
	}
}

func convertModelLocationToPB(location *models.Location) *pb.Location {
	if location == nil {
		return nil
	}

	return &pb.Location{
		Id:      location.ID,
		Name:    location.Name,
		Address: location.Address,
	}
}

func convertModelParticipantToPB(participant *models.Participant) *pb.Participant {
	if participant == nil {
		return nil
	}

	return &pb.Participant{
		Id:                   participant.ID,
		PhotoName:            participant.PhotoName,
		BirthDate:            timestamppb.New(participant.BirthDate),
		Gender:               participant.Gender,
		FirstName:            participant.FirstName,
		MiddleName:           participant.MiddleName,
		LastName:             participant.LastName,
		VolunteerTg:          participant.VolunteerTG,
		VolunteerTgLogin:     participant.VolunteerTgLogin,
		VolounteerFirstName:  participant.VolounteerFirstName,
		VolounteerMiddleName: participant.VolounteerMiddleName,
		VolounteerLastName:   participant.VolounteerLastName,
	}
}
