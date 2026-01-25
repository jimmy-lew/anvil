package gui

import "github.com/rivo/tview"

func (g *Gui) SetupLayout() {
	leftColumn := tview.NewFlex().SetDirection(tview.FlexRow).
		AddItem(g.ProcessesList, 0, 1, true)

	rightColumn := tview.NewFlex().SetDirection(tview.FlexRow).
		AddItem(g.Logs, 0, 3, false).
		AddItem(g.Stats, 10, 0, false).
		AddItem(g.Info, 0, 1, false)

	main := tview.NewFlex().
		AddItem(leftColumn, 0, 1, true).
		AddItem(rightColumn, 0, 2, false)

	g.Focusable = []tview.Primitive{g.ProcessesList, g.Logs, g.Stats, g.Info}
	g.App.SetRoot(main, true)
}
