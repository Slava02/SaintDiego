FROM golang:1.24-alpine AS builder

WORKDIR /app

# Install build dependencies
RUN apk add --no-cache git

# Copy go mod and sum files
COPY go.mod go.sum ./

# Download dependencies
RUN go mod download

# Copy source code
COPY . .

# Build the application
RUN CGO_ENABLED=0 GOOS=linux go build -o main cmd/services/main.go

# Final stage
FROM alpine:latest

WORKDIR /app

# Copy binary from builder
COPY --from=builder /app/main .

# Install Go and build dependencies
RUN apk add --no-cache go git

# Install CompileDaemon
RUN go install github.com/githubnemo/CompileDaemon@latest && \
    ln -s /root/go/bin/CompileDaemon /usr/local/bin/CompileDaemon

# Copy source code for hot reload
COPY . .

# Use JSON format for ENTRYPOINT to handle signals properly
ENTRYPOINT ["CompileDaemon", "--build=go build cmd/services/main.go", "--command=./main -config=configs/config.docker.toml"]