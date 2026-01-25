package app

import (
	"github.com/gdamore/tcell/v2"
)

func (a *App) setupHandlers() {
	a.Gui.ProcessesList.SetChangedFunc(func(index int, mainText, secondaryText string, shortcut rune) {
		// Logic to update selectedProc based on index
		a.updateDisplay()
	})
}

func (a *App) setupKeybindings() {
	a.Gui.App.SetInputCapture(func(event *tcell.EventKey) *tcell.EventKey {
		switch event.Key() {
		case tcell.KeyTab:
			a.Gui.FocusIndex = (a.Gui.FocusIndex + 1) % len(a.Gui.Focusable)
			a.Gui.UpdateFocus()
			return nil
		}

		switch event.Rune() {
		case 'q':
			a.Stop()
			a.Gui.App.Stop()
		case 's':
			a.Manager.StartProcess(a.SelectedProc, a.AddLog)
		case 'x':
			a.Manager.StopProcess(a.SelectedProc)
		}
		return event
	})
}

func (a *App) AddLog(procName string, msg string) {
	proc := a.Manager.Processes[procName]
	proc.LogsMutex.Lock()
	proc.Logs = append(proc.Logs, msg)
	proc.LogsMutex.Unlock()

	if procName == a.SelectedProc {
		a.Gui.App.QueueUpdateDraw(func() {
			a.Gui.UpdateLogs(proc)
		})
	}
}
