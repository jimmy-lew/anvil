package gui

import (
	"strings"

	"github.com/jimmy-lew/anvil/packages/cli/pkg/process"
)

func (g *Gui) UpdateLogs(proc *process.AppProcess) {
	if proc == nil {
		g.Logs.SetText("")
		return
	}
	proc.LogsMutex.Lock()
	defer proc.LogsMutex.Unlock()

	start := 0
	if len(proc.Logs) > 100 {
		start = len(proc.Logs) - 100
	}
	g.Logs.SetText(strings.Join(proc.Logs[start:], "\n"))
	g.Logs.ScrollToEnd()
}
