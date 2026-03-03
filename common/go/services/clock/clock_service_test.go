package clock

import (
	"testing"
	"time"
)

func TestNow(t *testing.T) {
	clock := NewClockService()
	currentTime := clock.Now()

	now := time.Now()

	diff := currentTime.Sub(now)
	if diff < 0 {
		diff = -diff
	}

	if diff > 2*time.Second {
		t.Errorf("Expected current time to be within 2 seconds of now, got difference of %v", diff)
	}
}
