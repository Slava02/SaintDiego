package events

import (
	"bytes"
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/Slava02/SaintDiego/backend/events/internal/models"
	"github.com/Slava02/SaintDiego/backend/events/internal/repositories/events_repo"
	"github.com/xuri/excelize/v2"
)

type IEventRepository interface {
	GetEvents(ctx context.Context, params *events_repo.GetEventsParams) ([]*models.Event, int64, error)
	GetEvent(ctx context.Context, id int64) (*models.Event, error)
	UpdateEvent(ctx context.Context, id int64, capacity int32, datetime time.Time) (*models.Event, error)
	DeleteEvent(ctx context.Context, id int64) error
	AddParticipantToEvent(ctx context.Context, eventID, participantID, volunteerID int64) error
	GetAvailableEventsForClientByServiceId(ctx context.Context, serviceID int64, clientID int64, page int64, perPage int64) ([]*models.Event, int64, error)
	GetParticipantsByEventId(ctx context.Context, eventID int64, page int64, perPage int64) ([]*models.Participant, int64, error)
	DeleteParticipantFromEvent(ctx context.Context, eventID, participantID int64) error
	GetClientsIdEvents(ctx context.Context, clientID int64, page int64, perPage int64) ([]*models.Event, int64, error)
	GetTimeSlotWithParticipantCountByEventID(ctx context.Context, eventID int64) (*models.TimeSlotWithParticipantCount, error)
}

type Transactor interface {
	WithinTransaction(ctx context.Context, tFunc func(ctx context.Context) error) error
}

type IServicesClient interface {
	GetServiceTypeById(ctx context.Context, id int64) error
}

type IClientsClient interface {
	GetClientById(ctx context.Context, id int64) error
}

type IVolunteersClient interface {
	GetVolunteerByTgId(ctx context.Context, tgId int64) error
}

type ILocationsClient interface {
	GetLocationById(ctx context.Context, id int64) (*models.Location, error)
}

var (
	ErrEventNotFound            = errors.New("event not found")
	ErrClientNotFound           = errors.New("client not found")
	ErrEventIsFull              = errors.New("event is full")
	ErrTimeSlotIsFull           = errors.New("time slot is full")
	ErrClientAlreadyParticipant = errors.New("client already participant")
)

//go:generate options-gen -out-filename=events_options.gen.go -from-struct=Options
type Options struct {
	EventRepository  IEventRepository  `option:"mandatory" validate:"required"`
	Transactor       Transactor        `option:"mandatory" validate:"required"`
	ServicesClient   IServicesClient   `option:"mandatory" validate:"required"`
	ClientsClient    IClientsClient    `option:"mandatory" validate:"required"`
	VolunteersClient IVolunteersClient `option:"mandatory" validate:"required"`
	LocationsClient  ILocationsClient  `option:"mandatory" validate:"required"`
}

type UseCase struct {
	eventRepository  IEventRepository
	transactor       Transactor
	servicesClient   IServicesClient
	clientsClient    IClientsClient
	volunteersClient IVolunteersClient
	locationsClient  ILocationsClient
}

func New(opts Options) (*UseCase, error) {
	if err := opts.Validate(); err != nil {
		return nil, fmt.Errorf("validate options: %v", err)
	}

	return &UseCase{
		eventRepository:  opts.EventRepository,
		transactor:       opts.Transactor,
		servicesClient:   opts.ServicesClient,
		clientsClient:    opts.ClientsClient,
		volunteersClient: opts.VolunteersClient,
		locationsClient:  opts.LocationsClient,
	}, nil
}

func (u *UseCase) GetEvents(ctx context.Context, params *GetEventsParams) ([]*models.Event, int64, error) {
	getEventsParams := &events_repo.GetEventsParams{
		ParticipantID:       params.ParticipantID,
		LocationID:          params.LocationID,
		ServiceID:           params.ServiceID,
		FromDate:            params.FromDate,
		ToDate:              params.ToDate,
		PerPage:             int32(params.PerPage),
		Page:                int32(params.Page),
		OpenForRegistration: params.OpenForRegistration,
	}

	if params.Status != nil {
		if *params.Status == "upcoming" {
			getEventsParams.Upcoming = true
		} else if *params.Status == "past" {
			getEventsParams.Past = true
		} else {
			return nil, 0, fmt.Errorf("invalid status: %s", *params.Status)
		}
	}

	if params.ParticipantID != nil {
		err := u.clientsClient.GetClientById(ctx, *params.ParticipantID)
		if err != nil {
			return nil, 0, fmt.Errorf("get client by id: %w", err)
		}
	}

	events, total, err := u.eventRepository.GetEvents(ctx, getEventsParams)
	if err != nil {
		switch {
		case errors.Is(err, events_repo.ErrClientNotFound):
			return nil, 0, fmt.Errorf("get events: %w", ErrClientNotFound)
		default:
			return nil, 0, fmt.Errorf("get events: %w", err)
		}
	}

	for _, event := range events {
		location, err := u.locationsClient.GetLocationById(ctx, event.LocationID)
		if err != nil {
			return nil, 0, fmt.Errorf("get location by id: %w", err)
		}
		event.Location = location
	}

	return events, total, nil
}

func (u *UseCase) GetEvent(ctx context.Context, id int64) (*models.Event, error) {
	event, err := u.eventRepository.GetEvent(ctx, id)
	if err != nil {
		if errors.Is(err, events_repo.ErrEventNotFound) {
			return nil, fmt.Errorf("%w", ErrEventNotFound)
		}
		return nil, fmt.Errorf("get event: %w", err)
	}

	location, err := u.locationsClient.GetLocationById(ctx, event.LocationID)
	if err != nil {
		return nil, fmt.Errorf("get location by id: %w", err)
	}
	event.Location = location

	return event, nil
}

func (u *UseCase) UpdateEvent(ctx context.Context, req *UpdateEventRequest) (*models.Event, error) {
	event, err := u.eventRepository.UpdateEvent(ctx, req.ID, req.Capacity, req.Datetime)
	if err != nil {
		if errors.Is(err, events_repo.ErrEventNotFound) {
			return nil, fmt.Errorf("%w", ErrEventNotFound)
		}
		return nil, fmt.Errorf("update event: %w", err)
	}

	return event, nil
}

func (u *UseCase) DeleteEvent(ctx context.Context, id int64) error {
	_, err := u.GetEvent(ctx, id)
	if err != nil {
		return fmt.Errorf("get event: %w", err)
	}

	err = u.eventRepository.DeleteEvent(ctx, id)
	if err != nil {
		if errors.Is(err, events_repo.ErrEventNotFound) {
			return fmt.Errorf("%w", ErrEventNotFound)
		}
		return fmt.Errorf("delete event: %w", err)
	}

	return nil
}

func (u *UseCase) AddParticipantToEvent(ctx context.Context, params *AddParticipantToEventRequest) error {
	err := u.volunteersClient.GetVolunteerByTgId(ctx, params.VolunteerID)
	if err != nil {
		return fmt.Errorf("get volunteer by tg id: %w", err)
	}

	err = u.clientsClient.GetClientById(ctx, params.ParticipantID)
	if err != nil {
		return fmt.Errorf("get client by id: %w", err)
	}

	// Проверяем не является ли клиент уже участником события
	pageParticipants := int64(1)
	perPageParticipants := int64(100)

	for {
		participants, _, err := u.GetParticipantsByEventId(ctx, &GetEventsIdParticipantsParams{
			EventID: params.EventID,
			Page:    pageParticipants,
			PerPage: perPageParticipants,
		})
		if err != nil {
			return fmt.Errorf("get participants: %v", err)
		}

		for _, participant := range participants {
			if participant.ID == params.ParticipantID {
				return fmt.Errorf("%w", ErrClientAlreadyParticipant)
			}
		}

		if len(participants) < int(perPageParticipants) {
			break
		}

		pageParticipants++
	}

	err = u.transactor.WithinTransaction(ctx, func(ctx context.Context) error {

		event, err := u.GetEvent(ctx, params.EventID)
		if err != nil {
			return fmt.Errorf("get event: %w", err)
		}

		if event.ParticipantsCount >= event.Capacity {
			return fmt.Errorf("%w", ErrEventIsFull)
		}

		timeSlot, err := u.eventRepository.GetTimeSlotWithParticipantCountByEventID(ctx, params.EventID)
		if err != nil {
			return fmt.Errorf("get time slot: %v", err)
		}

		if timeSlot.ParticipantCount >= timeSlot.Capacity {
			return fmt.Errorf("%w", ErrTimeSlotIsFull)
		}

		err = u.eventRepository.AddParticipantToEvent(ctx, params.EventID, params.ParticipantID, params.VolunteerID)
		if err != nil {
			if errors.Is(err, events_repo.ErrClientNotFound) {
				return fmt.Errorf("%w", ErrClientNotFound)
			}
			return fmt.Errorf("add participant to event: %v", err)
		}

		return nil
	})

	return err
}

func (u *UseCase) GetParticipantsByEventId(ctx context.Context, params *GetEventsIdParticipantsParams) ([]*models.Participant, int64, error) {
	_, err := u.GetEvent(ctx, params.EventID)
	if err != nil {
		return nil, 0, fmt.Errorf("get event: %w", err)
	}

	participants, total, err := u.eventRepository.GetParticipantsByEventId(ctx, params.EventID, params.Page, params.PerPage)
	if err != nil {
		switch {
		case errors.Is(err, events_repo.ErrEventNotFound):
			return nil, 0, fmt.Errorf("%w", ErrEventNotFound)
		default:
			return nil, 0, fmt.Errorf("get participants: %v", err)
		}
	}

	return participants, total, nil
}

func (u *UseCase) GetParticipantsByEventIdReport(ctx context.Context, eventID int64) (*bytes.Buffer, error) {
	participantsList := make([]*models.Participant, 0)
	page := int64(1)
	perPage := int64(100)

	for {
		participants, _, err := u.GetParticipantsByEventId(ctx, &GetEventsIdParticipantsParams{
			EventID: eventID,
			Page:    page,
			PerPage: perPage,
		})
		if err != nil {
			return nil, fmt.Errorf("get participants: %v", err)
		}

		participantsList = append(participantsList, participants...)

		if len(participants) < int(perPage) {
			break
		}

		page++
	}

	// Создаем Excel отчет
	reportBytes, err := getParticipantsByEventIdReport(participantsList)
	if err != nil {
		return nil, fmt.Errorf("get participants report: %v", err)
	}

	return reportBytes, nil
}

func (u *UseCase) GetAvailableEventsForClientByServiceId(ctx context.Context, params *GetAvailableEventsForClientByServiceIdParams) ([]*models.Event, int64, error) {
	err := u.servicesClient.GetServiceTypeById(ctx, params.ServiceID)
	if err != nil {
		return nil, 0, fmt.Errorf("get service type by id: %w", err)
	}

	events, total, err := u.eventRepository.GetAvailableEventsForClientByServiceId(ctx, params.ServiceID, params.ClientID, params.Page, params.PerPage)
	if err != nil {
		return nil, 0, fmt.Errorf("get events: %v", err)
	}

	eventsResponse := make([]*models.Event, 0)
	var filteredEventCnt int64

	for _, event := range events {
		if event.ParticipantsCount >= event.Capacity {
			filteredEventCnt++
			continue
		}

		timeSlot, err := u.eventRepository.GetTimeSlotWithParticipantCountByEventID(ctx, event.ID)
		if err != nil {
			return nil, 0, fmt.Errorf("get time slot with participant count: %w", err)
		}

		if timeSlot.ParticipantCount >= timeSlot.Capacity {
			filteredEventCnt++
			continue
		}

		isClientAlreadyParticipant, err := u.ClientAlreadyParticipant(ctx, event.ID, params.ClientID)
		if err != nil {
			return nil, 0, fmt.Errorf("client already participant: %v", err)
		}

		if isClientAlreadyParticipant {
			filteredEventCnt++
			continue
		}

		eventsResponse = append(eventsResponse, event)
	}

	for _, event := range eventsResponse {
		location, err := u.locationsClient.GetLocationById(ctx, event.LocationID)
		if err != nil {
			return nil, 0, fmt.Errorf("get location by id: %w", err)
		}
		event.Location = location
	}

	// TODO: тут неверно рассчитывается total, так как не учитываютя события, которые не прошли по заполненности таймслота и не вернулись по LIMIT и OFFSET

	return eventsResponse, total - filteredEventCnt, nil
}

func (u *UseCase) DeleteParticipantFromEvent(ctx context.Context, params *DeleteParticipantFromEventRequest) error {
	err := u.clientsClient.GetClientById(ctx, params.ParticipantID)
	if err != nil {
		return fmt.Errorf("get client by id: %w", err)
	}

	_, err = u.GetEvent(ctx, params.EventID)
	if err != nil {
		return fmt.Errorf("get event: %w", err)
	}

	err = u.eventRepository.DeleteParticipantFromEvent(ctx, params.EventID, params.ParticipantID)
	if err != nil {
		if errors.Is(err, events_repo.ErrEventNotFound) {
			return fmt.Errorf("%w", ErrEventNotFound)
		}
		return fmt.Errorf("delete participant from event: %v", err)
	}

	return nil
}

func (u *UseCase) GetClientsIdEvents(ctx context.Context, params *GetClientsIdEventsParams) ([]*models.Event, int64, error) {
	err := u.clientsClient.GetClientById(ctx, params.ID)
	if err != nil {
		return nil, 0, fmt.Errorf("get client by id: %w", err)
	}

	events, total, err := u.eventRepository.GetClientsIdEvents(ctx, params.ID, params.Page, params.PerPage)
	if err != nil {
		if errors.Is(err, events_repo.ErrClientNotFound) {
			return nil, 0, fmt.Errorf("%w", ErrClientNotFound)
		}
		return nil, 0, fmt.Errorf("get clients id events: %v", err)
	}

	return events, total, nil
}

func (u *UseCase) ClientAlreadyParticipant(ctx context.Context, eventID int64, clientID int64) (bool, error) {
	pageParticipants := int64(1)
	perPageParticipants := int64(100)

	for {
		participants, _, err := u.GetParticipantsByEventId(ctx, &GetEventsIdParticipantsParams{
			EventID: eventID,
			Page:    pageParticipants,
			PerPage: perPageParticipants,
		})
		if err != nil {
			return false, fmt.Errorf("get participants: %v", err)
		}

		for _, participant := range participants {
			if participant.ID == clientID {
				return true, nil
			}
		}

		if len(participants) < int(perPageParticipants) {
			break
		}

		pageParticipants++
	}

	return false, nil
}

func getParticipantsByEventIdReport(participants []*models.Participant) (*bytes.Buffer, error) {
	// Create a new Excel file
	f := excelize.NewFile()
	defer func() {
		if err := f.Close(); err != nil {
			fmt.Println("Error closing file:", err)
		}
	}()

	// Get the default sheet name
	sheetName := "Участники"

	// Create a new sheet with a custom name
	_, err := f.NewSheet(sheetName)
	if err != nil {
		return nil, fmt.Errorf("error creating sheet: %w", err)
	}

	// Delete default Sheet1 that's created automatically
	f.DeleteSheet("Sheet1")

	sheetIndex, err := f.GetSheetIndex(sheetName)
	if err != nil {
		return nil, fmt.Errorf("error getting sheet index: %w", err)
	}

	// Set active sheet
	f.SetActiveSheet(sheetIndex)

	// Define headers
	headers := []string{"ID", "Пол", "ФИО", "ФИО волонтера"}

	// Set column widths
	f.SetColWidth(sheetName, "A", "A", 10)
	f.SetColWidth(sheetName, "B", "B", 10)
	f.SetColWidth(sheetName, "C", "C", 30)
	f.SetColWidth(sheetName, "D", "D", 30)

	// Create header style
	headerStyle, err := f.NewStyle(&excelize.Style{
		Font: &excelize.Font{
			Bold: true,
			Size: 12,
		},
		Fill: excelize.Fill{
			Type:    "pattern",
			Color:   []string{"#DDEBF7"},
			Pattern: 1,
		},
		Border: []excelize.Border{
			{Type: "bottom", Color: "#000000", Style: 1},
			{Type: "right", Color: "#000000", Style: 1},
			{Type: "top", Color: "#000000", Style: 1},
			{Type: "left", Color: "#000000", Style: 1},
		},
		Alignment: &excelize.Alignment{
			Horizontal: "center",
			Vertical:   "center",
		},
	})
	if err != nil {
		return nil, fmt.Errorf("error creating header style: %w", err)
	}

	// Create cell style
	cellStyle, err := f.NewStyle(&excelize.Style{
		Border: []excelize.Border{
			{Type: "bottom", Color: "#000000", Style: 1},
			{Type: "right", Color: "#000000", Style: 1},
			{Type: "top", Color: "#000000", Style: 1},
			{Type: "left", Color: "#000000", Style: 1},
		},
	})
	if err != nil {
		return nil, fmt.Errorf("error creating cell style: %w", err)
	}

	// Set headers
	for i, header := range headers {
		cell, _ := excelize.CoordinatesToCellName(i+1, 1)
		f.SetCellValue(sheetName, cell, header)
		f.SetCellStyle(sheetName, cell, cell, headerStyle)
	}

	// Add participant data
	for i, p := range participants {
		row := i + 2 // Start from row 2 (after headers)

		// Get gender as string
		gender := "Мужской"
		if p.Gender == 2 {
			gender = "Женский"
		}

		// Combine full name
		fullName := fmt.Sprintf("%s %s %s", p.LastName, p.FirstName, p.MiddleName)

		// Combine volunteer full name if available
		volunteerFullName := ""
		if p.VolounteerLastName != "" || p.VolounteerFirstName != "" || p.VolounteerMiddleName != "" {
			volunteerFullName = fmt.Sprintf("%s %s %s",
				p.VolounteerLastName, p.VolounteerFirstName, p.VolounteerMiddleName)
		}

		// Set cell values
		f.SetCellValue(sheetName, fmt.Sprintf("A%d", row), p.ID)
		f.SetCellValue(sheetName, fmt.Sprintf("B%d", row), gender)
		f.SetCellValue(sheetName, fmt.Sprintf("C%d", row), fullName)
		f.SetCellValue(sheetName, fmt.Sprintf("D%d", row), volunteerFullName)

		// Apply styles
		for col := 'A'; col <= 'D'; col++ {
			cell := fmt.Sprintf("%c%d", col, row)
			f.SetCellStyle(sheetName, cell, cell, cellStyle)
		}
	}

	// Save to buffer
	buffer, err := f.WriteToBuffer()
	if err != nil {
		return nil, fmt.Errorf("error writing Excel to buffer: %w", err)
	}

	return buffer, nil
}
