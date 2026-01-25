package gui

import (
	"fmt"
	"strings"

	"github.com/jimmy-lew/anvil/packages/cli/pkg/process"
	"github.com/jimmy-lew/anvil/packages/cli/pkg/theme"
)

func (g *Gui) RefreshProcesses(processes map[string]*process.AppProcess) {
	g.ProcessesList.Clear()
	_, _, width, _ := g.ProcessesList.GetInnerRect()
	if width == 0 {
		width = 30
	}
	width -= 2

	for name, proc := range processes {
		icon := theme.StatusStopped
		if proc.Running {
			icon = theme.StatusRunning
		}

		baseText := fmt.Sprintf(" %s [-][white]%s[-]", icon, name)
		displayLen := 1 + 1 + len(name)
		padding := width - displayLen
		if padding < 0 {
			padding = 0
		}

		g.ProcessesList.AddItem(baseText+strings.Repeat(" ", padding), "", 0, nil)
	}
}
