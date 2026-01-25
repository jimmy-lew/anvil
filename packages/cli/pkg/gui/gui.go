package gui

import (
	"github.com/rivo/tview"
)

type Gui struct {
	App           *tview.Application
	ProcessesList *tview.List
	Logs          *tview.TextView
	Stats         *tview.TextView
	Info          *tview.TextView
	Focusable     []tview.Primitive
	FocusIndex    int
}

func NewGui() *Gui {
	return &Gui{
		App: tview.NewApplication(),
	}
}

func (g *Gui) UpdateFocus() {
	g.App.SetFocus(g.Focusable[g.FocusIndex])
}
