package clock

import "time"

type IClock interface {
	Now() time.Time
}

type Clock struct {
}

func (Clock) Now() time.Time {
	return time.Now()
}
