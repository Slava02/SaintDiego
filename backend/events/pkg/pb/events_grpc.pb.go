// Code generated by protoc-gen-go-grpc. DO NOT EDIT.
// versions:
// - protoc-gen-go-grpc v1.5.1
// - protoc             v5.27.3
// source: pkg/pb/events.proto

package pb

import (
	context "context"
	grpc "google.golang.org/grpc"
	codes "google.golang.org/grpc/codes"
	status "google.golang.org/grpc/status"
)

// This is a compile-time assertion to ensure that this generated file
// is compatible with the grpc package it is being compiled against.
// Requires gRPC-Go v1.64.0 or later.
const _ = grpc.SupportPackageIsVersion9

const (
	EventService_GetTimeSlot_FullMethodName      = "/events.EventService/GetTimeSlot"
	EventService_GetTimeSlots_FullMethodName     = "/events.EventService/GetTimeSlots"
	EventService_CreateTimeSlot_FullMethodName   = "/events.EventService/CreateTimeSlot"
	EventService_UpdateTimeSlot_FullMethodName   = "/events.EventService/UpdateTimeSlot"
	EventService_DeleteTimeSlot_FullMethodName   = "/events.EventService/DeleteTimeSlot"
	EventService_ArchiveTimeSlot_FullMethodName  = "/events.EventService/ArchiveTimeSlot"
	EventService_ActivateTimeSlot_FullMethodName = "/events.EventService/ActivateTimeSlot"
	EventService_GetLocations_FullMethodName     = "/events.EventService/GetLocations"
	EventService_CreateLocation_FullMethodName   = "/events.EventService/CreateLocation"
	EventService_GetServices_FullMethodName      = "/events.EventService/GetServices"
	EventService_GetServiceById_FullMethodName   = "/events.EventService/GetServiceById"
)

// EventServiceClient is the client API for EventService service.
//
// For semantics around ctx use and closing/ending streaming RPCs, please refer to https://pkg.go.dev/google.golang.org/grpc/?tab=doc#ClientConn.NewStream.
//
// Service definition
type EventServiceClient interface {
	// Time slots
	GetTimeSlot(ctx context.Context, in *GetTimeSlotRequest, opts ...grpc.CallOption) (*TimeSlot, error)
	GetTimeSlots(ctx context.Context, in *GetTimeSlotsRequest, opts ...grpc.CallOption) (*GetTimeSlotsResponse, error)
	CreateTimeSlot(ctx context.Context, in *CreateTimeSlotRequest, opts ...grpc.CallOption) (*TimeSlot, error)
	UpdateTimeSlot(ctx context.Context, in *UpdateTimeSlotRequest, opts ...grpc.CallOption) (*TimeSlot, error)
	DeleteTimeSlot(ctx context.Context, in *DeleteTimeSlotRequest, opts ...grpc.CallOption) (*DeleteTimeSlotResponse, error)
	ArchiveTimeSlot(ctx context.Context, in *ArchiveTimeSlotRequest, opts ...grpc.CallOption) (*TimeSlot, error)
	ActivateTimeSlot(ctx context.Context, in *ActivateTimeSlotRequest, opts ...grpc.CallOption) (*TimeSlot, error)
	// Locations
	GetLocations(ctx context.Context, in *GetLocationsRequest, opts ...grpc.CallOption) (*GetLocationsResponse, error)
	CreateLocation(ctx context.Context, in *CreateLocationRequest, opts ...grpc.CallOption) (*Location, error)
	// Services
	GetServices(ctx context.Context, in *GetServicesRequest, opts ...grpc.CallOption) (*GetServicesResponse, error)
	GetServiceById(ctx context.Context, in *GetServiceByIdRequest, opts ...grpc.CallOption) (*ServiceType, error)
}

type eventServiceClient struct {
	cc grpc.ClientConnInterface
}

func NewEventServiceClient(cc grpc.ClientConnInterface) EventServiceClient {
	return &eventServiceClient{cc}
}

func (c *eventServiceClient) GetTimeSlot(ctx context.Context, in *GetTimeSlotRequest, opts ...grpc.CallOption) (*TimeSlot, error) {
	cOpts := append([]grpc.CallOption{grpc.StaticMethod()}, opts...)
	out := new(TimeSlot)
	err := c.cc.Invoke(ctx, EventService_GetTimeSlot_FullMethodName, in, out, cOpts...)
	if err != nil {
		return nil, err
	}
	return out, nil
}

func (c *eventServiceClient) GetTimeSlots(ctx context.Context, in *GetTimeSlotsRequest, opts ...grpc.CallOption) (*GetTimeSlotsResponse, error) {
	cOpts := append([]grpc.CallOption{grpc.StaticMethod()}, opts...)
	out := new(GetTimeSlotsResponse)
	err := c.cc.Invoke(ctx, EventService_GetTimeSlots_FullMethodName, in, out, cOpts...)
	if err != nil {
		return nil, err
	}
	return out, nil
}

func (c *eventServiceClient) CreateTimeSlot(ctx context.Context, in *CreateTimeSlotRequest, opts ...grpc.CallOption) (*TimeSlot, error) {
	cOpts := append([]grpc.CallOption{grpc.StaticMethod()}, opts...)
	out := new(TimeSlot)
	err := c.cc.Invoke(ctx, EventService_CreateTimeSlot_FullMethodName, in, out, cOpts...)
	if err != nil {
		return nil, err
	}
	return out, nil
}

func (c *eventServiceClient) UpdateTimeSlot(ctx context.Context, in *UpdateTimeSlotRequest, opts ...grpc.CallOption) (*TimeSlot, error) {
	cOpts := append([]grpc.CallOption{grpc.StaticMethod()}, opts...)
	out := new(TimeSlot)
	err := c.cc.Invoke(ctx, EventService_UpdateTimeSlot_FullMethodName, in, out, cOpts...)
	if err != nil {
		return nil, err
	}
	return out, nil
}

func (c *eventServiceClient) DeleteTimeSlot(ctx context.Context, in *DeleteTimeSlotRequest, opts ...grpc.CallOption) (*DeleteTimeSlotResponse, error) {
	cOpts := append([]grpc.CallOption{grpc.StaticMethod()}, opts...)
	out := new(DeleteTimeSlotResponse)
	err := c.cc.Invoke(ctx, EventService_DeleteTimeSlot_FullMethodName, in, out, cOpts...)
	if err != nil {
		return nil, err
	}
	return out, nil
}

func (c *eventServiceClient) ArchiveTimeSlot(ctx context.Context, in *ArchiveTimeSlotRequest, opts ...grpc.CallOption) (*TimeSlot, error) {
	cOpts := append([]grpc.CallOption{grpc.StaticMethod()}, opts...)
	out := new(TimeSlot)
	err := c.cc.Invoke(ctx, EventService_ArchiveTimeSlot_FullMethodName, in, out, cOpts...)
	if err != nil {
		return nil, err
	}
	return out, nil
}

func (c *eventServiceClient) ActivateTimeSlot(ctx context.Context, in *ActivateTimeSlotRequest, opts ...grpc.CallOption) (*TimeSlot, error) {
	cOpts := append([]grpc.CallOption{grpc.StaticMethod()}, opts...)
	out := new(TimeSlot)
	err := c.cc.Invoke(ctx, EventService_ActivateTimeSlot_FullMethodName, in, out, cOpts...)
	if err != nil {
		return nil, err
	}
	return out, nil
}

func (c *eventServiceClient) GetLocations(ctx context.Context, in *GetLocationsRequest, opts ...grpc.CallOption) (*GetLocationsResponse, error) {
	cOpts := append([]grpc.CallOption{grpc.StaticMethod()}, opts...)
	out := new(GetLocationsResponse)
	err := c.cc.Invoke(ctx, EventService_GetLocations_FullMethodName, in, out, cOpts...)
	if err != nil {
		return nil, err
	}
	return out, nil
}

func (c *eventServiceClient) CreateLocation(ctx context.Context, in *CreateLocationRequest, opts ...grpc.CallOption) (*Location, error) {
	cOpts := append([]grpc.CallOption{grpc.StaticMethod()}, opts...)
	out := new(Location)
	err := c.cc.Invoke(ctx, EventService_CreateLocation_FullMethodName, in, out, cOpts...)
	if err != nil {
		return nil, err
	}
	return out, nil
}

func (c *eventServiceClient) GetServices(ctx context.Context, in *GetServicesRequest, opts ...grpc.CallOption) (*GetServicesResponse, error) {
	cOpts := append([]grpc.CallOption{grpc.StaticMethod()}, opts...)
	out := new(GetServicesResponse)
	err := c.cc.Invoke(ctx, EventService_GetServices_FullMethodName, in, out, cOpts...)
	if err != nil {
		return nil, err
	}
	return out, nil
}

func (c *eventServiceClient) GetServiceById(ctx context.Context, in *GetServiceByIdRequest, opts ...grpc.CallOption) (*ServiceType, error) {
	cOpts := append([]grpc.CallOption{grpc.StaticMethod()}, opts...)
	out := new(ServiceType)
	err := c.cc.Invoke(ctx, EventService_GetServiceById_FullMethodName, in, out, cOpts...)
	if err != nil {
		return nil, err
	}
	return out, nil
}

// EventServiceServer is the server API for EventService service.
// All implementations must embed UnimplementedEventServiceServer
// for forward compatibility.
//
// Service definition
type EventServiceServer interface {
	// Time slots
	GetTimeSlot(context.Context, *GetTimeSlotRequest) (*TimeSlot, error)
	GetTimeSlots(context.Context, *GetTimeSlotsRequest) (*GetTimeSlotsResponse, error)
	CreateTimeSlot(context.Context, *CreateTimeSlotRequest) (*TimeSlot, error)
	UpdateTimeSlot(context.Context, *UpdateTimeSlotRequest) (*TimeSlot, error)
	DeleteTimeSlot(context.Context, *DeleteTimeSlotRequest) (*DeleteTimeSlotResponse, error)
	ArchiveTimeSlot(context.Context, *ArchiveTimeSlotRequest) (*TimeSlot, error)
	ActivateTimeSlot(context.Context, *ActivateTimeSlotRequest) (*TimeSlot, error)
	// Locations
	GetLocations(context.Context, *GetLocationsRequest) (*GetLocationsResponse, error)
	CreateLocation(context.Context, *CreateLocationRequest) (*Location, error)
	// Services
	GetServices(context.Context, *GetServicesRequest) (*GetServicesResponse, error)
	GetServiceById(context.Context, *GetServiceByIdRequest) (*ServiceType, error)
	mustEmbedUnimplementedEventServiceServer()
}

// UnimplementedEventServiceServer must be embedded to have
// forward compatible implementations.
//
// NOTE: this should be embedded by value instead of pointer to avoid a nil
// pointer dereference when methods are called.
type UnimplementedEventServiceServer struct{}

func (UnimplementedEventServiceServer) GetTimeSlot(context.Context, *GetTimeSlotRequest) (*TimeSlot, error) {
	return nil, status.Errorf(codes.Unimplemented, "method GetTimeSlot not implemented")
}
func (UnimplementedEventServiceServer) GetTimeSlots(context.Context, *GetTimeSlotsRequest) (*GetTimeSlotsResponse, error) {
	return nil, status.Errorf(codes.Unimplemented, "method GetTimeSlots not implemented")
}
func (UnimplementedEventServiceServer) CreateTimeSlot(context.Context, *CreateTimeSlotRequest) (*TimeSlot, error) {
	return nil, status.Errorf(codes.Unimplemented, "method CreateTimeSlot not implemented")
}
func (UnimplementedEventServiceServer) UpdateTimeSlot(context.Context, *UpdateTimeSlotRequest) (*TimeSlot, error) {
	return nil, status.Errorf(codes.Unimplemented, "method UpdateTimeSlot not implemented")
}
func (UnimplementedEventServiceServer) DeleteTimeSlot(context.Context, *DeleteTimeSlotRequest) (*DeleteTimeSlotResponse, error) {
	return nil, status.Errorf(codes.Unimplemented, "method DeleteTimeSlot not implemented")
}
func (UnimplementedEventServiceServer) ArchiveTimeSlot(context.Context, *ArchiveTimeSlotRequest) (*TimeSlot, error) {
	return nil, status.Errorf(codes.Unimplemented, "method ArchiveTimeSlot not implemented")
}
func (UnimplementedEventServiceServer) ActivateTimeSlot(context.Context, *ActivateTimeSlotRequest) (*TimeSlot, error) {
	return nil, status.Errorf(codes.Unimplemented, "method ActivateTimeSlot not implemented")
}
func (UnimplementedEventServiceServer) GetLocations(context.Context, *GetLocationsRequest) (*GetLocationsResponse, error) {
	return nil, status.Errorf(codes.Unimplemented, "method GetLocations not implemented")
}
func (UnimplementedEventServiceServer) CreateLocation(context.Context, *CreateLocationRequest) (*Location, error) {
	return nil, status.Errorf(codes.Unimplemented, "method CreateLocation not implemented")
}
func (UnimplementedEventServiceServer) GetServices(context.Context, *GetServicesRequest) (*GetServicesResponse, error) {
	return nil, status.Errorf(codes.Unimplemented, "method GetServices not implemented")
}
func (UnimplementedEventServiceServer) GetServiceById(context.Context, *GetServiceByIdRequest) (*ServiceType, error) {
	return nil, status.Errorf(codes.Unimplemented, "method GetServiceById not implemented")
}
func (UnimplementedEventServiceServer) mustEmbedUnimplementedEventServiceServer() {}
func (UnimplementedEventServiceServer) testEmbeddedByValue()                      {}

// UnsafeEventServiceServer may be embedded to opt out of forward compatibility for this service.
// Use of this interface is not recommended, as added methods to EventServiceServer will
// result in compilation errors.
type UnsafeEventServiceServer interface {
	mustEmbedUnimplementedEventServiceServer()
}

func RegisterEventServiceServer(s grpc.ServiceRegistrar, srv EventServiceServer) {
	// If the following call pancis, it indicates UnimplementedEventServiceServer was
	// embedded by pointer and is nil.  This will cause panics if an
	// unimplemented method is ever invoked, so we test this at initialization
	// time to prevent it from happening at runtime later due to I/O.
	if t, ok := srv.(interface{ testEmbeddedByValue() }); ok {
		t.testEmbeddedByValue()
	}
	s.RegisterService(&EventService_ServiceDesc, srv)
}

func _EventService_GetTimeSlot_Handler(srv interface{}, ctx context.Context, dec func(interface{}) error, interceptor grpc.UnaryServerInterceptor) (interface{}, error) {
	in := new(GetTimeSlotRequest)
	if err := dec(in); err != nil {
		return nil, err
	}
	if interceptor == nil {
		return srv.(EventServiceServer).GetTimeSlot(ctx, in)
	}
	info := &grpc.UnaryServerInfo{
		Server:     srv,
		FullMethod: EventService_GetTimeSlot_FullMethodName,
	}
	handler := func(ctx context.Context, req interface{}) (interface{}, error) {
		return srv.(EventServiceServer).GetTimeSlot(ctx, req.(*GetTimeSlotRequest))
	}
	return interceptor(ctx, in, info, handler)
}

func _EventService_GetTimeSlots_Handler(srv interface{}, ctx context.Context, dec func(interface{}) error, interceptor grpc.UnaryServerInterceptor) (interface{}, error) {
	in := new(GetTimeSlotsRequest)
	if err := dec(in); err != nil {
		return nil, err
	}
	if interceptor == nil {
		return srv.(EventServiceServer).GetTimeSlots(ctx, in)
	}
	info := &grpc.UnaryServerInfo{
		Server:     srv,
		FullMethod: EventService_GetTimeSlots_FullMethodName,
	}
	handler := func(ctx context.Context, req interface{}) (interface{}, error) {
		return srv.(EventServiceServer).GetTimeSlots(ctx, req.(*GetTimeSlotsRequest))
	}
	return interceptor(ctx, in, info, handler)
}

func _EventService_CreateTimeSlot_Handler(srv interface{}, ctx context.Context, dec func(interface{}) error, interceptor grpc.UnaryServerInterceptor) (interface{}, error) {
	in := new(CreateTimeSlotRequest)
	if err := dec(in); err != nil {
		return nil, err
	}
	if interceptor == nil {
		return srv.(EventServiceServer).CreateTimeSlot(ctx, in)
	}
	info := &grpc.UnaryServerInfo{
		Server:     srv,
		FullMethod: EventService_CreateTimeSlot_FullMethodName,
	}
	handler := func(ctx context.Context, req interface{}) (interface{}, error) {
		return srv.(EventServiceServer).CreateTimeSlot(ctx, req.(*CreateTimeSlotRequest))
	}
	return interceptor(ctx, in, info, handler)
}

func _EventService_UpdateTimeSlot_Handler(srv interface{}, ctx context.Context, dec func(interface{}) error, interceptor grpc.UnaryServerInterceptor) (interface{}, error) {
	in := new(UpdateTimeSlotRequest)
	if err := dec(in); err != nil {
		return nil, err
	}
	if interceptor == nil {
		return srv.(EventServiceServer).UpdateTimeSlot(ctx, in)
	}
	info := &grpc.UnaryServerInfo{
		Server:     srv,
		FullMethod: EventService_UpdateTimeSlot_FullMethodName,
	}
	handler := func(ctx context.Context, req interface{}) (interface{}, error) {
		return srv.(EventServiceServer).UpdateTimeSlot(ctx, req.(*UpdateTimeSlotRequest))
	}
	return interceptor(ctx, in, info, handler)
}

func _EventService_DeleteTimeSlot_Handler(srv interface{}, ctx context.Context, dec func(interface{}) error, interceptor grpc.UnaryServerInterceptor) (interface{}, error) {
	in := new(DeleteTimeSlotRequest)
	if err := dec(in); err != nil {
		return nil, err
	}
	if interceptor == nil {
		return srv.(EventServiceServer).DeleteTimeSlot(ctx, in)
	}
	info := &grpc.UnaryServerInfo{
		Server:     srv,
		FullMethod: EventService_DeleteTimeSlot_FullMethodName,
	}
	handler := func(ctx context.Context, req interface{}) (interface{}, error) {
		return srv.(EventServiceServer).DeleteTimeSlot(ctx, req.(*DeleteTimeSlotRequest))
	}
	return interceptor(ctx, in, info, handler)
}

func _EventService_ArchiveTimeSlot_Handler(srv interface{}, ctx context.Context, dec func(interface{}) error, interceptor grpc.UnaryServerInterceptor) (interface{}, error) {
	in := new(ArchiveTimeSlotRequest)
	if err := dec(in); err != nil {
		return nil, err
	}
	if interceptor == nil {
		return srv.(EventServiceServer).ArchiveTimeSlot(ctx, in)
	}
	info := &grpc.UnaryServerInfo{
		Server:     srv,
		FullMethod: EventService_ArchiveTimeSlot_FullMethodName,
	}
	handler := func(ctx context.Context, req interface{}) (interface{}, error) {
		return srv.(EventServiceServer).ArchiveTimeSlot(ctx, req.(*ArchiveTimeSlotRequest))
	}
	return interceptor(ctx, in, info, handler)
}

func _EventService_ActivateTimeSlot_Handler(srv interface{}, ctx context.Context, dec func(interface{}) error, interceptor grpc.UnaryServerInterceptor) (interface{}, error) {
	in := new(ActivateTimeSlotRequest)
	if err := dec(in); err != nil {
		return nil, err
	}
	if interceptor == nil {
		return srv.(EventServiceServer).ActivateTimeSlot(ctx, in)
	}
	info := &grpc.UnaryServerInfo{
		Server:     srv,
		FullMethod: EventService_ActivateTimeSlot_FullMethodName,
	}
	handler := func(ctx context.Context, req interface{}) (interface{}, error) {
		return srv.(EventServiceServer).ActivateTimeSlot(ctx, req.(*ActivateTimeSlotRequest))
	}
	return interceptor(ctx, in, info, handler)
}

func _EventService_GetLocations_Handler(srv interface{}, ctx context.Context, dec func(interface{}) error, interceptor grpc.UnaryServerInterceptor) (interface{}, error) {
	in := new(GetLocationsRequest)
	if err := dec(in); err != nil {
		return nil, err
	}
	if interceptor == nil {
		return srv.(EventServiceServer).GetLocations(ctx, in)
	}
	info := &grpc.UnaryServerInfo{
		Server:     srv,
		FullMethod: EventService_GetLocations_FullMethodName,
	}
	handler := func(ctx context.Context, req interface{}) (interface{}, error) {
		return srv.(EventServiceServer).GetLocations(ctx, req.(*GetLocationsRequest))
	}
	return interceptor(ctx, in, info, handler)
}

func _EventService_CreateLocation_Handler(srv interface{}, ctx context.Context, dec func(interface{}) error, interceptor grpc.UnaryServerInterceptor) (interface{}, error) {
	in := new(CreateLocationRequest)
	if err := dec(in); err != nil {
		return nil, err
	}
	if interceptor == nil {
		return srv.(EventServiceServer).CreateLocation(ctx, in)
	}
	info := &grpc.UnaryServerInfo{
		Server:     srv,
		FullMethod: EventService_CreateLocation_FullMethodName,
	}
	handler := func(ctx context.Context, req interface{}) (interface{}, error) {
		return srv.(EventServiceServer).CreateLocation(ctx, req.(*CreateLocationRequest))
	}
	return interceptor(ctx, in, info, handler)
}

func _EventService_GetServices_Handler(srv interface{}, ctx context.Context, dec func(interface{}) error, interceptor grpc.UnaryServerInterceptor) (interface{}, error) {
	in := new(GetServicesRequest)
	if err := dec(in); err != nil {
		return nil, err
	}
	if interceptor == nil {
		return srv.(EventServiceServer).GetServices(ctx, in)
	}
	info := &grpc.UnaryServerInfo{
		Server:     srv,
		FullMethod: EventService_GetServices_FullMethodName,
	}
	handler := func(ctx context.Context, req interface{}) (interface{}, error) {
		return srv.(EventServiceServer).GetServices(ctx, req.(*GetServicesRequest))
	}
	return interceptor(ctx, in, info, handler)
}

func _EventService_GetServiceById_Handler(srv interface{}, ctx context.Context, dec func(interface{}) error, interceptor grpc.UnaryServerInterceptor) (interface{}, error) {
	in := new(GetServiceByIdRequest)
	if err := dec(in); err != nil {
		return nil, err
	}
	if interceptor == nil {
		return srv.(EventServiceServer).GetServiceById(ctx, in)
	}
	info := &grpc.UnaryServerInfo{
		Server:     srv,
		FullMethod: EventService_GetServiceById_FullMethodName,
	}
	handler := func(ctx context.Context, req interface{}) (interface{}, error) {
		return srv.(EventServiceServer).GetServiceById(ctx, req.(*GetServiceByIdRequest))
	}
	return interceptor(ctx, in, info, handler)
}

// EventService_ServiceDesc is the grpc.ServiceDesc for EventService service.
// It's only intended for direct use with grpc.RegisterService,
// and not to be introspected or modified (even as a copy)
var EventService_ServiceDesc = grpc.ServiceDesc{
	ServiceName: "events.EventService",
	HandlerType: (*EventServiceServer)(nil),
	Methods: []grpc.MethodDesc{
		{
			MethodName: "GetTimeSlot",
			Handler:    _EventService_GetTimeSlot_Handler,
		},
		{
			MethodName: "GetTimeSlots",
			Handler:    _EventService_GetTimeSlots_Handler,
		},
		{
			MethodName: "CreateTimeSlot",
			Handler:    _EventService_CreateTimeSlot_Handler,
		},
		{
			MethodName: "UpdateTimeSlot",
			Handler:    _EventService_UpdateTimeSlot_Handler,
		},
		{
			MethodName: "DeleteTimeSlot",
			Handler:    _EventService_DeleteTimeSlot_Handler,
		},
		{
			MethodName: "ArchiveTimeSlot",
			Handler:    _EventService_ArchiveTimeSlot_Handler,
		},
		{
			MethodName: "ActivateTimeSlot",
			Handler:    _EventService_ActivateTimeSlot_Handler,
		},
		{
			MethodName: "GetLocations",
			Handler:    _EventService_GetLocations_Handler,
		},
		{
			MethodName: "CreateLocation",
			Handler:    _EventService_CreateLocation_Handler,
		},
		{
			MethodName: "GetServices",
			Handler:    _EventService_GetServices_Handler,
		},
		{
			MethodName: "GetServiceById",
			Handler:    _EventService_GetServiceById_Handler,
		},
	},
	Streams:  []grpc.StreamDesc{},
	Metadata: "pkg/pb/events.proto",
}
