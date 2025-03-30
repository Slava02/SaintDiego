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
RUN CGO_ENABLED=0 GOOS=linux go build -o main cmd/app/main.go

# Final stage
FROM alpine:latest

WORKDIR /app

# Copy binary from builder
COPY --from=builder /app/main .

# Install CompileDaemon
RUN apk add --no-cache go && \
    go install github.com/githubnemo/CompileDaemon@latest && \
    apk del go

EXPOSE 5000

# Use JSON format for ENTRYPOINT to handle signals properly
ENTRYPOINT ["CompileDaemon", "--build=go build cmd/app/main.go", "--command=./main"]