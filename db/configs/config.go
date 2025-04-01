package configs

import (
	"fmt"
	"io"
	"os"

	"github.com/Slava02/SaintDiego/backend/common/validator"
	"github.com/pelletier/go-toml"
)

type Config struct {
	Database DatabaseConfig `toml:"database"`
	Global   GlobalConfig   `toml:"global"`
	Log      LogConfig      `toml:"log"`
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

func ParseAndValidate(filename string) (Config, error) {
	file, err := os.Open(filename)
	if err != nil {
		return Config{}, fmt.Errorf("couldn't open config file: %w", err)
	}
	defer file.Close()

	var config Config

	b, err := io.ReadAll(file)
	if err != nil {
		return Config{}, fmt.Errorf("couldn't read config file: %w", err)
	}

	err = toml.Unmarshal(b, &config)
	if err != nil {
		return Config{}, fmt.Errorf("couldn't unmarshall config file: %w", err)
	}

	err = validator.Validator.Struct(config)
	if err != nil {
		return Config{}, fmt.Errorf("validation error: %w", err)
	}

	return config, nil
}
