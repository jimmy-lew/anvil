package app

import (
	"github.com/gdamore/tcell/v2"
)

func (app *App) setupHandlers() {
	app.Gui.ProcessesList.SetChangedFunc(func(index int, mainText, secondaryText string, shortcut rune) {
		// Logic to update selectedProc based on index
		app.updateDisplay()
	})
}

func (app *App) setupKeybindings() {
	app.Gui.App.SetInputCapture(func(event *tcell.EventKey) *tcell.EventKey {
		switch event.Key() {
		case tcell.KeyTab:
			app.Gui.FocusIndex = (app.Gui.FocusIndex + 1) % len(app.Gui.Focusable)
			app.Gui.UpdateFocus()
			return nil
		case tcell.KeyCtrlC:
			app.Stop()
			app.Gui.App.Stop()
		}

		switch event.Rune() {
		case 'q':
			app.Stop()
			app.Gui.App.Stop()
		case 's':
			app.Manager.StartProcess(app.SelectedProc, app.AddLog)
		case 'x':
			app.Manager.StopProcess(app.SelectedProc)
		}
		return event
	})
}

func (app *App) AddLog(procName string, msg string) {
	proc := app.Manager.Processes[procName]
	proc.LogsMutex.Lock()
	proc.Logs = append(proc.Logs, msg)
	proc.LogsMutex.Unlock()

	if procName == app.SelectedProc {
		app.Gui.App.QueueUpdateDraw(func() {
			app.Gui.UpdateLogs(proc)
		})
	}
}
