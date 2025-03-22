package main

import (
	"fmt"
	"log"
	"net"

	"github.com/Slava02/SaintDiego/backend/events/internal/service"
	"github.com/Slava02/SaintDiego/backend/events/pkg/pb"
	"google.golang.org/grpc"
)

func main() {
	lis, err := net.Listen("tcp", ":50051")
	if err != nil {
		log.Fatalf("failed to listen: %v", err)
	}

	s := grpc.NewServer()
	svc := service.New()
	pb.RegisterEventServiceServer(s, svc)

	fmt.Println("Starting gRPC server on :50051")
	if err := s.Serve(lis); err != nil {
		log.Fatalf("failed to serve: %v", err)
	}
}
