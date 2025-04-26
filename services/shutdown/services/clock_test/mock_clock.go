package clock_test

import "time"

type MockClock struct{}

func (clock MockClock) Now() time.Time {
	return time.Date(2025, 2, 22, 0, 2, 0, 0, time.UTC)
}
