package config

type Config struct {
	Global  GlobalConfig      `toml:"global"`
	Log     LogConfig         `toml:"log"`
	Servers ServersConfig     `toml:"servers"`
	APIGW   APIGWServerConfig `toml:"apiGW"`
}

type GlobalConfig struct {
	Env  string `toml:"env" validate:"required,oneof=dev stage prod"`
	Name string `toml:"name"`
}

type LogConfig struct {
	Level string `toml:"level" validate:"required,oneof=debug info warn error"`
}

type ServersConfig struct {
	Debug DebugServerConfig `toml:"debug"`
	APIGW APIGWServerConfig `toml:"apiGW"`
}

type DebugServerConfig struct {
	Addr string `toml:"addr" validate:"required,hostname_port"`
}

type APIGWServerConfig struct {
	Addr         string   `toml:"addr" validate:"required,hostname_port"`
	AllowOrigins []string `toml:"allow_origins" validate:"required,dive,url"`
}
