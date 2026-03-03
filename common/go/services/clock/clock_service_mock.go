package clock

import "time"

type MockClockService struct{}

func (clock MockClockService) Now() time.Time {
	return time.Date(2025, 2, 22, 0, 2, 0, 0, time.UTC)
}
