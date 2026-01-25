package gui

import (
	"fmt"
	"time"

	"github.com/jimmy-lew/anvil/packages/cli/pkg/process"
)

func (g *Gui) UpdateStats(proc *process.AppProcess) {
	if proc == nil || !proc.Running {
		g.Stats.SetText("[red]Not Running")
		return
	}

	uptime := time.Since(proc.StartTime)
	stats := fmt.Sprintf(`[yellow]Status:[white]    [green]Running
[yellow]Uptime:[white]    %s
[yellow]PID:[white]       %d
[yellow]CPU:[white]       %.1f%%
[yellow]Memory:[white]    %.1f MB`,
		process.FormatDuration(uptime),
		proc.Cmd.Process.Pid, proc.CPU, float64(proc.Memory)/(1024*1024))

	g.Stats.SetText(stats)
}
