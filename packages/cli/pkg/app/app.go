package app

import (
	"os"
	"time"

	"github.com/jimmy-lew/anvil/packages/cli/pkg/gui"
	"github.com/jimmy-lew/anvil/packages/cli/pkg/process"
	"github.com/jimmy-lew/anvil/packages/cli/pkg/theme"
)

type App struct {
	Gui          *gui.Gui
	Manager      *process.Manager
	SelectedProc string
	Root         string
}

func NewApp() *App {
	theme.ApplyRoundedBorders()
	wd, _ := os.Getwd()

	a := &App{
		Gui:     gui.NewGui(),
		Manager: process.NewManager(),
		Root:    wd,
	}

	a.Manager.DetectApps(a.Root)
	a.initGui()
	return a
}

func (a *App) initGui() {
	a.Gui.ProcessesList = a.Gui.CreateList("Apps")
	a.Gui.Logs = a.Gui.CreateTextView("Logs", true)
	a.Gui.Stats = a.Gui.CreateTextView("Stats", false)
	a.Gui.Info = a.Gui.CreateTextView("Info", true)

	a.Gui.SetupLayout()
	a.setupHandlers()
	a.setupKeybindings()

	for name := range a.Manager.Processes {
		a.SelectedProc = name
		a.updateDisplay()
		break
	}
}

func (a *App) updateDisplay() {
	proc := a.Manager.Processes[a.SelectedProc]
	a.Gui.UpdateLogs(proc)
	a.Gui.UpdateStats(proc)
	a.Gui.UpdateInfo(proc)
}

func (a *App) Run() error {
	go a.autoRefresh()
	return a.Gui.App.Run()
}

func (a *App) Stop() {
	a.Manager.StopAll()
}

func (a *App) autoRefresh() {
	ticker := time.NewTicker(1 * time.Second)
	for range ticker.C {
		a.Gui.App.QueueUpdateDraw(func() {
			a.Gui.UpdateStats(a.Manager.Processes[a.SelectedProc])
		})
	}
}
