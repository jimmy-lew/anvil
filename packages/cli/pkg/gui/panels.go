package gui

import (
	"github.com/gdamore/tcell/v2"
	"github.com/jimmy-lew/anvil/packages/cli/pkg/theme"
	"github.com/rivo/tview"
)

func (g *Gui) CreateList(title string) *tview.List {
	list := tview.NewList().ShowSecondaryText(false)
	list.SetBorder(true).SetTitle(title).SetBorderPadding(0, 0, 1, 1)
	list.SetBackgroundColor(tcell.ColorDefault)
	list.SetSelectedBackgroundColor(tcell.ColorBlack)
	list.SetSelectedTextColor(tcell.ColorWhite)
	list.SetHighlightFullLine(true)

	list.SetMainTextStyle(theme.AppItemStyle)

	list.SetFocusFunc(func() { list.SetBorderColor(theme.BorderFocusColor) })
	list.SetBlurFunc(func() { list.SetBorderColor(theme.BorderBlurColor) })
	return list
}

func (g *Gui) CreateTextView(title string, scrollable bool) *tview.TextView {
	textView := tview.NewTextView().SetDynamicColors(true).SetScrollable(scrollable).SetWrap(true)
	textView.SetBorder(true).SetTitle(title).SetBorderPadding(0, 0, 1, 1)
	textView.SetBackgroundColor(tcell.ColorDefault)
	textView.SetChangedFunc(func() { g.App.Draw() })

	textView.SetFocusFunc(func() { textView.SetBorderColor(theme.BorderFocusColor) })
	textView.SetBlurFunc(func() { textView.SetBorderColor(theme.BorderBlurColor) })
	return textView
}
