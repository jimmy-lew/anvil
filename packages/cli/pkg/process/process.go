package process

import (
	"fmt"
	"os/exec"
	"sync"
	"time"

	"github.com/jimmy-lew/anvil/packages/cli/pkg/config"
)

type AppProcess struct {
	Name      string
	Path      string
	Config    *config.AppConfig
	Cmd       *exec.Cmd
	Running   bool
	StartTime time.Time
	Logs      []string
	LogsMutex sync.Mutex
	CPU       float64
	Memory    uint64
}

func FormatDuration(d time.Duration) string {
	d = d.Round(time.Second)
	h := d / time.Hour
	d -= h * time.Hour
	m := d / time.Minute
	d -= m * time.Minute
	s := d / time.Second

	if h > 0 {
		return fmt.Sprintf("%dh %dm %ds", h, m, s)
	} else if m > 0 {
		return fmt.Sprintf("%dm %ds", m, s)
	}
	return fmt.Sprintf("%ds", s)
}
