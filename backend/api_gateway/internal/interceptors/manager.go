package interceptors

import (
	"context"
	"fmt"
	"time"

	"github.com/opentracing/opentracing-go"
	"go.uber.org/zap"
	"google.golang.org/grpc"
	"google.golang.org/grpc/metadata"
)

//go:generate options-gen -out-filename=interceptor_options.gen.go -from-struct=Options
type Options struct {
	logger *zap.Logger        `option:"mandatory" validate:"required"`
	tracer opentracing.Tracer `option:"mandatory" validate:"required"`
}

// InterceptorManager handles gRPC interceptors.
type InterceptorManager struct {
	logger *zap.Logger
	tracer opentracing.Tracer
}

// InterceptorManager constructor.
func NewInterceptorManager(opts Options) (*InterceptorManager, error) {
	if err := opts.Validate(); err != nil {
		return nil, fmt.Errorf("validate options: %v", err)
	}
	return &InterceptorManager{logger: opts.logger, tracer: opts.tracer}, nil
}

// Logger intercepts and logs gRPC calls.
func (im *InterceptorManager) Logger(
	ctx context.Context,
	req any,
	info *grpc.UnaryServerInfo,
	handler grpc.UnaryHandler,
) (resp any, err error) {
	start := time.Now()
	md, _ := metadata.FromIncomingContext(ctx)

	defer func() {
		im.logger.Info("Interceptor",
			zap.String("Method", info.FullMethod),
			zap.String("Time", start.String()),
			zap.Any("Metadata", md),
			zap.Any("Err", err),
		)
	}()

	return handler(ctx, req)
}

// GetInterceptor returns the interceptor chain.
func (im *InterceptorManager) GetInterceptor() grpc.UnaryClientInterceptor {
	return func(
		ctx context.Context,
		method string,
		req any,
		reply any,
		cc *grpc.ClientConn,
		invoker grpc.UnaryInvoker,
		opts ...grpc.CallOption,
	) error {
		start := time.Now()
		err := invoker(ctx, method, req, reply, cc, opts...)

		im.logger.Info("GetInterceptor",
			zap.String("Method", method),
			zap.Any("req", req),
			zap.Any("reply", reply),
			zap.String("Time", start.String()),
			zap.Any("Err", err),
		)

		return err
	}
}

// GetTracer.
func (im *InterceptorManager) GetTracer() opentracing.Tracer {
	return im.tracer
}
