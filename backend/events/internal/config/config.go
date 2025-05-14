package config

import (
	"fmt"
	"time"
)

type Config struct {
	Global     GlobalConfig     `toml:"global"`
	Log        LogConfig        `toml:"log"`
	Database   DatabaseConfig   `toml:"database"`
	Server     ServerConfig     `toml:"server"`
	GRPCClient GRPCClientConfig `toml:"grpc_client"`
}

type GlobalConfig struct {
	Env  string `toml:"env" validate:"required,oneof=dev stage prod"`
	Name string `toml:"name"`
}

func (c GlobalConfig) IsProduction() bool {
	return c.Env == "prod"
}

type LogConfig struct {
	Level string `toml:"level" validate:"required,oneof=debug info warn error"`
}

type ServerConfig struct {
	Addr              string        `toml:"addr" validate:"required,hostname_port"`
	MaxConnectionIdle time.Duration `toml:"max_connection_idle" validate:"required,min=0"`
	Timeout           time.Duration `toml:"timeout" validate:"required,min=0"`
	MaxConnectionAge  time.Duration `toml:"max_connection_age" validate:"required,min=0"`
	Time              time.Duration `toml:"time" validate:"required,min=0"`
}

type DatabaseConfig struct {
	Host     string `toml:"host" validate:"required"`
	DBName   string `toml:"db_name" validate:"required"`
	Password string `toml:"password" validate:"required"`
	User     string `toml:"user" validate:"required"`
	Port     string `toml:"port" validate:"required"`
}

func (c DatabaseConfig) Conn() string {
	res := fmt.Sprintf("%s:%s@tcp(%s:%s)/%s", c.User, c.Password, c.Host, c.Port, c.DBName)
	fmt.Println(res)
	return res
}

type GRPCClientConfig struct {
	Services   ServicesConfig   `toml:"services" validate:"required"`
	Volunteers VolunteersConfig `toml:"volunteers" validate:"required"`
	Clients    ClientsConfig    `toml:"clients" validate:"required"`
	Locations  LocationsConfig  `toml:"locations" validate:"required"`
}

type ServicesConfig struct {
	Addr string `toml:"addr" validate:"required,hostname_port"`
}

type VolunteersConfig struct {
	Addr string `toml:"addr" validate:"required,hostname_port"`
}

type ClientsConfig struct {
	Addr string `toml:"addr" validate:"required,hostname_port"`
}

type LocationsConfig struct {
	Addr string `toml:"addr" validate:"required,hostname_port"`
}
