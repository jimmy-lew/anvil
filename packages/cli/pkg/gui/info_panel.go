package gui

import (
	"fmt"
	"strings"

	"github.com/jimmy-lew/anvil/packages/cli/pkg/process"
)

func (g *Gui) UpdateInfo(proc *process.AppProcess) {
	if proc == nil {
		return
	}
	cmdStr := "npm run dev"
	if proc.Config != nil {
		cmdStr = proc.Config.Command + " " + strings.Join(proc.Config.Args, " ")
	}

	info := fmt.Sprintf(`[yellow]App:[white]      %s
[yellow]Path:[white]     %s
[yellow]Command:[white]  %s
`, proc.Name, proc.Path, cmdStr)

	g.Info.SetText(info)
}
