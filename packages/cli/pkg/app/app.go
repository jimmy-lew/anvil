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
	wd, _ := os.Getwd()

	a := &App{
		Gui:     gui.NewGui(),
		Manager: process.NewManager(),
		Root:    wd,
	}

	a.Manager.DetectApps(a.Root)
	a.setupUI()
	return a
}

func (app *App) setupUI() {
	theme.ApplyRoundedBorders()
	app.Gui.ProcessesList = app.Gui.CreateList("Apps")
	app.Gui.Logs = app.Gui.CreateTextView("Logs", true)
	app.Gui.Stats = app.Gui.CreateTextView("Stats", false)
	app.Gui.Info = app.Gui.CreateTextView("Info", true)

	app.Gui.RefreshProcesses(app.Manager.Processes)

	app.Gui.SetupLayout()
	app.setupHandlers()
	app.setupKeybindings()

	for name := range app.Manager.Processes {
		app.SelectedProc = name
		app.Update()
		break
	}
}

func (app *App) Update() {
	proc := app.Manager.Processes[app.SelectedProc]
	app.Gui.UpdateLogs(proc)
	app.Gui.UpdateStats(proc)
	app.Gui.UpdateInfo(proc)
}

func (app *App) Run() error {
	go app.autoRefresh()
	return app.Gui.App.Run()
}

func (app *App) Stop() {
	app.Manager.StopAll()
}

func (app *App) autoRefresh() {
	ticker := time.NewTicker(1 * time.Second)
	for range ticker.C {
		app.Gui.App.QueueUpdateDraw(func() {
			app.Gui.UpdateStats(app.Manager.Processes[app.SelectedProc])
		})
	}
}
