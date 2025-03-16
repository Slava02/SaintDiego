package logger_test

import (
	"time"

	"go.uber.org/zap"

	logger2 "github.com/Slava02/SaintDiego/pkg/logger"
)

func ExampleInit() {
	if err := logger2.Init(logger2.NewOptions(
		"error",
		logger2.WithProductionMode(true),
		logger2.WithClock(fakeClock{}),
	)); err != nil {
		panic(err)
	}

	zap.L().Named("user-cache").Error("inconsistent state", zap.String("uid", "1234"))

	// Output:
	// {"level":"ERROR","T":"2024-01-01T00:00:01.000Z","component":"user-cache","msg":"inconsistent state","uid":"1234"}
}

type fakeClock time.Time

func (f fakeClock) Now() time.Time {
	return time.Date(2024, 1, 1, 0, 0, 1, 0, time.UTC)
}

func (f fakeClock) NewTicker(d time.Duration) *time.Ticker {
	return time.NewTicker(d)
}
