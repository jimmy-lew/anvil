package gui

import (
	"strings"

	"github.com/gdamore/tcell/v2"
	"github.com/rivo/tview"
)

type KeyBinding struct {
	Key  string
	Desc string
}

type Help struct {
	*tview.TextView
	bindings []KeyBinding
	showHelp bool
}

func (g *Gui) CreateHelp(bindings []KeyBinding) *Help {
	h := &Help{
		TextView: tview.NewTextView(),
		bindings: []KeyBinding{},
		showHelp: false,
	}

	h.bindings = bindings
	h.SetDynamicColors(true)
	h.SetBorder(true).SetBorderPadding(0, 0, 1, 1)
	h.SetWordWrap(false)
	h.SetBackgroundColor(tcell.ColorDefault)

	return h
}

func (h *Help) IsVisible() bool {
	return h.showHelp
}

func (h *Help) ToggleHelp() {
	h.showHelp = !h.showHelp
	h.render()
}

func (h *Help) render() {
	if len(h.bindings) == 0 {
		h.Clear()
		return
	}

	var output strings.Builder

	h.renderFullHelp(&output)
	h.Clear()
	h.SetText(output.String())
}

func (h *Help) renderFullHelp(output *strings.Builder) {
	maxKeyWidth := 0
	for _, kb := range h.bindings {
		if len(kb.Key) > maxKeyWidth {
			maxKeyWidth = len(kb.Key)
		}
	}

	for _, kb := range h.bindings {
		keyWidth := tview.TaggedStringWidth(kb.Key)
		padding := strings.Repeat(" ", maxKeyWidth-keyWidth+2)

		output.WriteString("[brightgray::b]" + kb.Key + "[::-]")
		output.WriteString(padding)
		output.WriteString("[gray]" + kb.Desc + "[-]" + "\n")
	}
}
