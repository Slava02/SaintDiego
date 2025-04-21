package events

import (
	"context"
	"fmt"

	"github.com/Slava02/SaintDiego/backend/api_gateway/internal/models"
	"github.com/Slava02/SaintDiego/backend/common/pointer"
	"github.com/Slava02/SaintDiego/backend/events/pkg/pb"
	"google.golang.org/protobuf/types/known/timestamppb"
)

type IEventsClient interface {
	GetEvents(ctx context.Context, req *pb.GetEventsRequest) (*pb.GetEventsResponse, error)
	GetEventById(ctx context.Context, req *pb.GetEventByIdRequest) (*pb.Event, error)
	UpdateEvent(ctx context.Context, req *pb.UpdateEventRequest) (*pb.Event, error)
	DeleteEvent(ctx context.Context, req *pb.DeleteEventRequest) (*pb.DeleteEventResponse, error)
	AddParticipantToEvent(ctx context.Context, req *pb.AddParticipantToEventRequest) (*pb.AddParticipantToEventResponse, error)
	GetParticipantsByEventId(ctx context.Context, req *pb.GetParticipantsByEventIdRequest) (*pb.GetParticipantsByEventIdResponse, error)
	GetEventsByServiceId(ctx context.Context, req *pb.GetEventsByServiceIdRequest) (*pb.GetEventsByServiceIdResponse, error)
}

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

func (u *UseCase) GetEvents(ctx context.Context, req *GetEventsParams) ([]*models.Event, int32, error) {
	pbReq := &pb.GetEventsRequest{
		ParticipantId: req.ParticipantID,
		Status:        req.Status,
		LocationId:    req.LocationID,
		ServiceId:     req.ServiceID,
	}

	if req.FromDate != nil {
		pbReq.FromDate = timestamppb.New(*req.FromDate)
	}

	if req.ToDate != nil {
		pbReq.ToDate = timestamppb.New(*req.ToDate)
	}

	pbRes, err := u.eventsClient.GetEvents(ctx, pbReq)
	if err != nil {
		return nil, 0, fmt.Errorf("get events: %v", err)
	}

	events := make([]*models.Event, len(pbRes.Events))
	for i, event := range pbRes.Events {
		events[i] = convertEventToResponse(event)
	}

	return events, int32(pbRes.Total), nil
}

func (u *UseCase) GetEvent(ctx context.Context, id int64) (*models.Event, error) {
	pbReq := &pb.GetEventByIdRequest{
		Id: id,
	}

	pbRes, err := u.eventsClient.GetEventById(ctx, pbReq)
	if err != nil {
		return nil, err
	}

	return convertEventToResponse(pbRes), nil
}

func (u *UseCase) UpdateEvent(ctx context.Context, req *UpdateEventRequest) (*models.Event, error) {
	pbReq := &pb.UpdateEventRequest{
		Id:       req.ID,
		Capacity: req.Capacity,
		Datetime: timestamppb.New(req.Datetime),
	}

	pbRes, err := u.eventsClient.UpdateEvent(ctx, pbReq)
	if err != nil {
		return nil, err
	}

	return convertEventToResponse(pbRes), nil
}

func (u *UseCase) DeleteEvent(ctx context.Context, id int64) error {
	pbReq := &pb.DeleteEventRequest{
		Id: id,
	}

	_, err := u.eventsClient.DeleteEvent(ctx, pbReq)
	if err != nil {
		return fmt.Errorf("delete event: %v", err)
	}

	return nil
}

// TODO: нужно проверить доступен ли event для пользователя, так как в момент записи что-то могло поменятсья
func (u *UseCase) AddParticipantToEvent(ctx context.Context, req *AddParticipantToEventRequest) error {
	pbReq := &pb.AddParticipantToEventRequest{
		EventId:       req.EventID,
		ParticipantId: req.ParticipantID,
		VolunteerId:   req.VolunteerID,
	}

	_, err := u.eventsClient.AddParticipantToEvent(ctx, pbReq)
	if err != nil {
		return fmt.Errorf("add participant to event: %v", err)
	}

	return nil
}

func (u *UseCase) GetParticipantsByEventId(ctx context.Context, params *GetEventsIdParticipantsParams) ([]*models.Participant, int32, error) {
	pbReq := &pb.GetParticipantsByEventIdRequest{
		EventId: params.EventID,
		Page:    int64(params.Page),
		PerPage: int64(params.PerPage),
	}

	pbRes, err := u.eventsClient.GetParticipantsByEventId(ctx, pbReq)
	if err != nil {
		return nil, 0, fmt.Errorf("get participants: %v", err)
	}

	participants := make([]*models.Participant, len(pbRes.Participants))
	for i, participant := range pbRes.Participants {
		participants[i] = &models.Participant{
			ID:                   participant.Id,
			PhotoName:            pointer.Ptr(participant.PhotoName),
			BirthDate:            pointer.PtrWithZeroAsNil(participant.BirthDate.AsTime()),
			Gender:               pointer.Ptr(participant.Gender),
			FirstName:            participant.FirstName,
			MiddleName:           participant.MiddleName,
			LastName:             participant.LastName,
			VolunteerTG:          participant.VolunteerTg,
			VolunteerTgLogin:     participant.VolunteerTgLogin,
			VolounteerFirstName:  participant.VolounteerFirstName,
			VolounteerMiddleName: participant.VolounteerMiddleName,
			VolounteerLastName:   participant.VolounteerLastName,
		}
	}

	return participants, int32(pbRes.Total), nil
}

func (u *UseCase) GetEventsByServiceId(ctx context.Context, params *GetEventsServicesIdParams) ([]*models.Event, int32, error) {
	pbReq := &pb.GetEventsByServiceIdRequest{
		ServiceId: params.ServiceID,
		Page:      int64(params.Page),
		PerPage:   int64(params.PerPage),
	}

	pbRes, err := u.eventsClient.GetEventsByServiceId(ctx, pbReq)
	if err != nil {
		return nil, 0, fmt.Errorf("get events by service id: %v", err)
	}

	events := make([]*models.Event, len(pbRes.Events))
	for i, event := range pbRes.Events {
		events[i] = convertEventToResponse(event)
	}

	return events, int32(pbRes.Total), nil
}

func convertEventToResponse(event *pb.Event) *models.Event {
	return &models.Event{
		ID:                event.Id,
		TimeSlotServiceID: event.TimeSlotServiceId,
		Capacity:          event.Capacity,
		Datetime:          event.Datetime.AsTime(),
		ServiceTypeID:     event.ServiceTypeId,
		ParticipantsCount: event.ParticipantsCount,
	}
}
