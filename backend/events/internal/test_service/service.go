package service

import (
	"context"
	"fmt"
	"log"
	"sync"
	"time"

	"github.com/Slava02/SaintDiego/backend/events/pkg/pb"
	"google.golang.org/protobuf/types/known/timestamppb"
)

type Service struct {
	pb.UnimplementedEventServiceServer

	mu        sync.RWMutex
	timeSlots map[int64]*pb.TimeSlot
	locations map[int64]*pb.Location
	services  map[int64]*pb.ServiceType

	lastID int64
}

func New() *Service {
	return &Service{
		timeSlots: make(map[int64]*pb.TimeSlot),
		locations: make(map[int64]*pb.Location),
		services:  make(map[int64]*pb.ServiceType),
	}
}

func (s *Service) nextID() int64 {
	s.lastID++
	return s.lastID
}

// TimeSlots
func (s *Service) GetTimeSlot(ctx context.Context, req *pb.GetTimeSlotRequest) (*pb.TimeSlot, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	timeSlot, ok := s.timeSlots[req.Id]
	if !ok {
		return nil, fmt.Errorf("time slot not found: %d", req.Id)
	}

	log.Printf("GetTimeSlot: %+v", timeSlot)
	return timeSlot, nil
}

func (s *Service) GetTimeSlots(ctx context.Context, req *pb.GetTimeSlotsRequest) (*pb.GetTimeSlotsResponse, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	var timeSlots []*pb.TimeSlot
	for _, ts := range s.timeSlots {
		if req.Status != "" && ts.Status != req.Status {
			continue
		}
		if req.StartDate != nil && ts.StartDate.AsTime().Before(req.StartDate.AsTime()) {
			continue
		}
		if req.EndDate != nil && ts.EndDate.AsTime().After(req.EndDate.AsTime()) {
			continue
		}
		timeSlots = append(timeSlots, ts)
	}

	log.Printf("GetTimeSlots: found %d slots", len(timeSlots))
	return &pb.GetTimeSlotsResponse{TimeSlots: timeSlots}, nil
}

func (s *Service) CreateTimeSlot(ctx context.Context, req *pb.CreateTimeSlotRequest) (*pb.TimeSlot, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	id := s.nextID()
	timeSlot := &pb.TimeSlot{
		Id:         id,
		Title:      req.Title,
		Type:       req.Type,
		LocationId: req.LocationId,
		Capacity:   req.Capacity,
		StartDate:  req.StartDate,
		EndDate:    req.EndDate,
		Status:     "active",
		Services:   req.Services,
		Recurrence: req.Recurrence,
	}

	s.timeSlots[id] = timeSlot
	log.Printf("CreateTimeSlot: %+v", timeSlot)
	return timeSlot, nil
}

func (s *Service) UpdateTimeSlot(ctx context.Context, req *pb.UpdateTimeSlotRequest) (*pb.TimeSlot, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	timeSlot, ok := s.timeSlots[req.Id]
	if !ok {
		return nil, fmt.Errorf("time slot not found: %d", req.Id)
	}

	if req.TimeSlot.Title != "" {
		timeSlot.Title = req.TimeSlot.Title
	}
	if req.TimeSlot.Type != "" {
		timeSlot.Type = req.TimeSlot.Type
	}
	if req.TimeSlot.LocationId != 0 {
		timeSlot.LocationId = req.TimeSlot.LocationId
	}
	if req.TimeSlot.Capacity != 0 {
		timeSlot.Capacity = req.TimeSlot.Capacity
	}
	if req.TimeSlot.StartDate != nil {
		timeSlot.StartDate = req.TimeSlot.StartDate
	}
	if req.TimeSlot.EndDate != nil {
		timeSlot.EndDate = req.TimeSlot.EndDate
	}
	if req.TimeSlot.Services != nil {
		timeSlot.Services = req.TimeSlot.Services
	}
	if req.TimeSlot.Recurrence != nil {
		timeSlot.Recurrence = req.TimeSlot.Recurrence
	}

	log.Printf("UpdateTimeSlot: %+v", timeSlot)
	return timeSlot, nil
}

func (s *Service) DeleteTimeSlot(ctx context.Context, req *pb.DeleteTimeSlotRequest) (*pb.DeleteTimeSlotResponse, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	if _, ok := s.timeSlots[req.Id]; !ok {
		return nil, fmt.Errorf("time slot not found: %d", req.Id)
	}

	delete(s.timeSlots, req.Id)
	log.Printf("DeleteTimeSlot: %d", req.Id)
	return &pb.DeleteTimeSlotResponse{Success: true}, nil
}

func (s *Service) ArchiveTimeSlot(ctx context.Context, req *pb.ArchiveTimeSlotRequest) (*pb.TimeSlot, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	timeSlot, ok := s.timeSlots[req.Id]
	if !ok {
		return nil, fmt.Errorf("time slot not found: %d", req.Id)
	}

	timeSlot.Status = "archived"
	log.Printf("ArchiveTimeSlot: %d", req.Id)
	return timeSlot, nil
}

func (s *Service) ActivateTimeSlot(ctx context.Context, req *pb.ActivateTimeSlotRequest) (*pb.TimeSlot, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	timeSlot, ok := s.timeSlots[req.Id]
	if !ok {
		return nil, fmt.Errorf("time slot not found: %d", req.Id)
	}

	timeSlot.Status = "active"
	log.Printf("ActivateTimeSlot: %d", req.Id)
	return timeSlot, nil
}

// Locations
func (s *Service) GetLocations(ctx context.Context, req *pb.GetLocationsRequest) (*pb.GetLocationsResponse, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	var locations []*pb.Location
	for _, loc := range s.locations {
		locations = append(locations, loc)
	}

	log.Printf("GetLocations: found %d locations", len(locations))
	return &pb.GetLocationsResponse{Locations: locations}, nil
}

func (s *Service) CreateLocation(ctx context.Context, req *pb.CreateLocationRequest) (*pb.Location, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	id := s.nextID()
	location := &pb.Location{
		Id:          id,
		Name:        req.Name,
		Address:     req.Address,
		Description: req.Description,
	}

	s.locations[id] = location
	log.Printf("CreateLocation: %+v", location)
	return location, nil
}

// Services
func (s *Service) GetServices(ctx context.Context, req *pb.GetServicesRequest) (*pb.GetServicesResponse, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	var services []*pb.ServiceType
	for _, svc := range s.services {
		services = append(services, svc)
	}

	log.Printf("GetServices: found %d services", len(services))
	return &pb.GetServicesResponse{Services: services}, nil
}

func (s *Service) GetServiceById(ctx context.Context, req *pb.GetServiceByIdRequest) (*pb.ServiceType, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	service, ok := s.services[req.Id]
	if !ok {
		return nil, fmt.Errorf("service not found: %d", req.Id)
	}

	log.Printf("GetServiceById: %+v", service)
	return service, nil
}

func (s *Service) init() {
	// Add some test data
	s.services[1] = &pb.ServiceType{
		Id:          1,
		Name:        "Haircut",
		Description: "Basic haircut service",
	}
	s.services[2] = &pb.ServiceType{
		Id:          2,
		Name:        "Manicure",
		Description: "Basic manicure service",
	}

	s.locations[1] = &pb.Location{
		Id:          1,
		Name:        "Main Salon",
		Address:     "123 Main St",
		Description: "Our main location",
	}
	s.locations[2] = &pb.Location{
		Id:          2,
		Name:        "Downtown Salon",
		Address:     "456 Downtown Ave",
		Description: "Downtown location",
	}

	now := time.Now()
	s.timeSlots[1] = &pb.TimeSlot{
		Id:         1,
		Title:      "Morning Session",
		Type:       "single",
		LocationId: 1,
		Capacity:   10,
		StartDate:  timestamppb.New(now),
		EndDate:    timestamppb.New(now.Add(1 * time.Hour)),
		Status:     "active",
		Services: []*pb.TimeSlotService{
			{
				ServiceTypeId: 1,
				Capacity:      5,
				BookingWindow: 60,
				Time:          timestamppb.New(now),
			},
		},
	}

	s.lastID = 2
}
