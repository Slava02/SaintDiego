# Build stage
FROM golang:1.24.2-alpine AS builder

WORKDIR /app

# Install build dependencies
RUN apk add --no-cache git

# Copy only the files needed for dependency resolution
COPY go.mod go.sum ./

# Download dependencies
RUN go mod download

# Copy the rest of the source code
COPY . .

# Build the application with optimizations
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-s -w" -o main cmd/clients/main.go

# Production stage
FROM alpine:latest AS production


WORKDIR /app

# Copy binary and config from builder
COPY --from=builder /app/main .
COPY --from=builder /app/configs/ ./configs/

# Runtime configuration
ENTRYPOINT ["./main"]
CMD ["-config=configs/config.docker.toml"]