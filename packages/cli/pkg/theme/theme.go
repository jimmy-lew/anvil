package theme

import (
	"github.com/gdamore/tcell/v2"
	"github.com/rivo/tview"
)

var (
	BorderFocusColor = tcell.Color62
	BorderBlurColor  = tcell.ColorGray
	StatusRunning    = "[green]●"
	StatusStopped    = "[red]○"
	AppItemStyle     = tcell.StyleDefault.Background(tcell.ColorDefault).Foreground(tcell.ColorWhite)
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
