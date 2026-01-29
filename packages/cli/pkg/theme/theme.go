package theme

import (
	"github.com/gdamore/tcell/v2"
	"github.com/rivo/tview"
)

var (
	BorderFocusColor = tcell.ColorBlue
	BorderBlurColor  = tcell.ColorGray
	FocusedColor     = tcell.ColorBlack
	StatusRunning    = "[green]●"
	StatusStopped    = "[red]○"
	StatusInactive   = "○"
	AppItemStyle     = tcell.StyleDefault.Background(tcell.ColorDefault).Foreground(tcell.ColorWhite)
	FocusedStyle     = tcell.StyleDefault.Background(FocusedColor).Bold(true)
)

func ApplyRoundedBorders() {
	tview.Borders.Horizontal = '─'
	tview.Borders.Vertical = '│'
	tview.Borders.TopLeft = '╭'
	tview.Borders.TopRight = '╮'
	tview.Borders.BottomLeft = '╰'
	tview.Borders.BottomRight = '╯'
	tview.Borders.HorizontalFocus = '─'
	tview.Borders.VerticalFocus = '│'
	tview.Borders.TopLeftFocus = '╭'
	tview.Borders.TopRightFocus = '╮'
	tview.Borders.BottomLeftFocus = '╰'
	tview.Borders.BottomRightFocus = '╯'
}
