FROM golang:1.24

#ENV TZ=Europe/Moscow
#RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

ENV config=docker

WORKDIR /app

COPY ./ /app

RUN go mod download

# Install CompileDaemon
RUN go install github.com/githubnemo/CompileDaemon@latest

EXPOSE 5000

# Use JSON format for ENTRYPOINT to handle signals properly
ENTRYPOINT ["CompileDaemon", "--build=go build cmd/api_gateway/main.go", "--command=./main"]