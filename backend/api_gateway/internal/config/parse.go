package config

import (
	"fmt"
	"io"
	"os"

	"github.com/pelletier/go-toml"

	"github.com/Slava02/SaintDiego/backend/api_gateway/pkg/validator"
)

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
