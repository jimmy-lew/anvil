package main

import (
	"bufio"
	"encoding/json"
	"fmt"
	"io"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"sync"
	"syscall"
	"time"

	"github.com/gdamore/tcell/v2"
	"github.com/rivo/tview"
)

type AppConfig struct {
	Name       string   `json:"name"`
	Path       string   `json:"path"`
	Command    string   `json:"command"`
	Args       []string `json:"args"`
	WorkingDir string   `json:"workingDir,omitempty"`
}

type AppProcess struct {
	Name      string
	Path      string
	Config    *AppConfig
	Cmd       *exec.Cmd
	Running   bool
	StartTime time.Time
	Logs      []string
	LogsMutex sync.Mutex
	CPU       float64
	Memory    uint64
}

type App struct {
	app           *tview.Application
	processesList *tview.List
	logs          *tview.TextView
	stats         *tview.TextView
	info          *tview.TextView
	focusable     []tview.Primitive
	focusIndex    int

	processes    map[string]*AppProcess
	processesMux sync.Mutex
	selectedProc string
	monorepoRoot string
}

func main() {
	app := &App{
		processes: make(map[string]*AppProcess),
	}

	// Get monorepo root (current directory or specified)
	var err error
	app.monorepoRoot, err = os.Getwd()
	if err != nil {
		panic(err)
	}

	// Detect apps in monorepo
	app.detectApps()

	// Detect already running processes
	app.detectRunningProcesses()

	app.setupUI()

	go app.autoRefresh()

	if err := app.app.Run(); err != nil {
		// Clean up processes on exit
		app.stopAllProcesses()
		panic(err)
	}
}

func (a *App) detectApps() {
	// First check for config file
	configPath := filepath.Join(a.monorepoRoot, "monorepo-tui.json")
	if data, err := os.ReadFile(configPath); err == nil {
		var configs []AppConfig
		if err := json.Unmarshal(data, &configs); err == nil {
			for _, cfg := range configs {
				fullPath := cfg.Path
				if !filepath.IsAbs(fullPath) {
					fullPath = filepath.Join(a.monorepoRoot, fullPath)
				}
				if cfg.WorkingDir == "" {
					cfg.WorkingDir = fullPath
				} else if !filepath.IsAbs(cfg.WorkingDir) {
					cfg.WorkingDir = filepath.Join(a.monorepoRoot, cfg.WorkingDir)
				}

				a.processes[cfg.Name] = &AppProcess{
					Name:    cfg.Name,
					Path:    fullPath,
					Config:  &cfg,
					Running: false,
					Logs:    make([]string, 0, 1000),
				}
			}
			return
		}
	}

	// Fallback to auto-detection
	appsDir := filepath.Join(a.monorepoRoot, "apps")

	// Check for apps/bot
	botPath := filepath.Join(appsDir, "bot")
	if _, err := os.Stat(botPath); err == nil {
		a.processes["bot"] = &AppProcess{
			Name: "bot",
			Path: botPath,
			Config: &AppConfig{
				Name:       "bot",
				Path:       botPath,
				Command:    "npm",
				Args:       []string{"run", "dev"},
				WorkingDir: botPath,
			},
			Running: false,
			Logs:    make([]string, 0, 1000),
		}
	}

	// Check for apps/dashboard
	dashboardPath := filepath.Join(appsDir, "dashboard")
	if _, err := os.Stat(dashboardPath); err == nil {
		a.processes["dashboard"] = &AppProcess{
			Name: "dashboard",
			Path: dashboardPath,
			Config: &AppConfig{
				Name:       "dashboard",
				Path:       dashboardPath,
				Command:    "npm",
				Args:       []string{"run", "dev"},
				WorkingDir: dashboardPath,
			},
			Running: false,
			Logs:    make([]string, 0, 1000),
		}
	}
}

func (a *App) detectRunningProcesses() {
	// Try to detect if processes are already running
	// This is a simple check - you might want to make it more robust
	// by checking for PID files or using process name matching

	for name, proc := range a.processes {
		// Check if there's a common lock file or PID file
		pidFile := filepath.Join(proc.Path, ".pid")
		if data, err := os.ReadFile(pidFile); err == nil {
			// PID file exists, process might be running
			pid := strings.TrimSpace(string(data))
			a.addLog(name, fmt.Sprintf("Detected existing PID file: %s", pid))
		}
	}
}

func (a *App) setupUI() {
	a.app = tview.NewApplication()

	// Set rounded borders globally
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

	// Create UI components
	a.processesList = a.createList("Apps")
	a.logs = a.createTextView("Logs", true)
	a.stats = a.createTextView("Stats", false)
	a.info = a.createTextView("Info", true)

	// Populate processes list
	a.refreshProcessesList()

	// Left column layout - just the processes list
	leftColumn := tview.NewFlex().SetDirection(tview.FlexRow).
		AddItem(a.processesList, 0, 1, true)

	// Right column layout - stacked vertically
	rightColumn := tview.NewFlex().SetDirection(tview.FlexRow).
		AddItem(a.logs, 0, 3, false).
		AddItem(a.stats, 10, 0, false).
		AddItem(a.info, 0, 1, false)

	// Main layout - two columns side by side
	mainLayout := tview.NewFlex().
		AddItem(leftColumn, 0, 1, true).
		AddItem(rightColumn, 0, 2, false)

	// Setup focusable elements
	a.focusable = []tview.Primitive{
		a.processesList,
		a.logs,
		a.stats,
		a.info,
	}
	a.focusIndex = 0
	a.updateFocus()

	// Set selection handler
	a.processesList.SetSelectedFunc(func(index int, mainText, secondaryText string, shortcut rune) {
		a.handleProcessSelection(index)
	})

	a.processesList.SetChangedFunc(func(index int, mainText, secondaryText string, shortcut rune) {
		// Update display when selection changes (even without Enter)
		keys := a.getProcessNames()
		if index >= 0 && index < len(keys) {
			a.selectedProc = keys[index]
			a.updateDisplay()
		}
	})

	// Global key bindings
	a.app.SetInputCapture(func(event *tcell.EventKey) *tcell.EventKey {
		switch event.Key() {
		case tcell.KeyTab:
			a.focusNext()
			return nil
		case tcell.KeyBacktab:
			a.focusPrev()
			return nil
		}

		switch event.Rune() {
		case 'q':
			a.stopAllProcesses()
			a.app.Stop()
			return nil
		case 'r':
			a.refreshProcessesList()
			return nil
		case 'x':
			a.handleStopProcess()
			return nil
		case 's':
			a.handleStartProcess()
			return nil
		case 'R':
			a.handleRestartProcess()
			return nil
		case 'c':
			a.handleClearLogs()
			return nil
		case 'j':
			// Move down in list
			if a.focusIndex == 0 {
				currentItem := a.processesList.GetCurrentItem()
				if currentItem < a.processesList.GetItemCount()-1 {
					a.processesList.SetCurrentItem(currentItem + 1)
				}
				return nil
			}
		case 'k':
			// Move up in list
			if a.focusIndex == 0 {
				currentItem := a.processesList.GetCurrentItem()
				if currentItem > 0 {
					a.processesList.SetCurrentItem(currentItem - 1)
				}
				return nil
			}
		}
		return event
	})

	a.app.SetRoot(mainLayout, true)

	// Select first process if available
	if len(a.processes) > 0 {
		a.processesList.SetCurrentItem(0)
		keys := a.getProcessNames()
		a.selectedProc = keys[0]
		a.updateDisplay()
	}
}

func (a *App) createList(title string) *tview.List {
	list := tview.NewList().ShowSecondaryText(false)
	style := tcell.StyleDefault.Background(tcell.ColorDefault).Foreground(tcell.ColorWhite)
	list.SetBorder(true).SetTitle(title).SetBorderPadding(0, 0, 1, 1)
	list.SetBackgroundColor(tcell.ColorDefault)
	list.SetMainTextStyle(style)

	// Light grey background for selected item only
	list.SetSelectedBackgroundColor(tcell.ColorBlack)
	list.SetSelectedTextColor(tcell.ColorWhite)
	list.SetHighlightFullLine(true)

	// Focus handlers - ANSI 62 for focused border
	list.SetFocusFunc(func() {
		list.SetBorderColor(tcell.Color62) // ANSI 62
	})
	list.SetBlurFunc(func() {
		list.SetBorderColor(tcell.ColorGray)
	})

	return list
}

func (a *App) createTextView(title string, scrollable bool) *tview.TextView {
	tv := tview.NewTextView().SetDynamicColors(true).SetScrollable(scrollable).SetWrap(true)
	tv.SetBorder(true).SetTitle(title).SetBorderPadding(0, 0, 1, 1)
	tv.SetBackgroundColor(tcell.ColorDefault)
	tv.SetChangedFunc(func() {
		a.app.Draw()
	})

	// Focus handlers
	tv.SetFocusFunc(func() {
		tv.SetBorderColor(tcell.ColorBlue)
	})
	tv.SetBlurFunc(func() {
		tv.SetBorderColor(tcell.ColorGray)
	})

	return tv
}

func (a *App) getProcessNames() []string {
	a.processesMux.Lock()
	defer a.processesMux.Unlock()

	names := make([]string, 0, len(a.processes))
	for name := range a.processes {
		names = append(names, name)
	}
	// Sort for consistent ordering
	return names
}

func (a *App) refreshProcessesList() {
	a.processesList.Clear()
	a.processesMux.Lock()
	defer a.processesMux.Unlock()

	// Get the current width of the list to fill it
	_, _, width, _ := a.processesList.GetInnerRect()
	if width == 0 {
		width = 30 // fallback width
	}
	// Account for border padding
	width = width - 2

	for name, proc := range a.processes {
		icon := "○"
		color := "[red]"
		if proc.Running {
			icon = "●"
			color = "[green]"
		}
		// Create display text - name is always white
		baseText := fmt.Sprintf(" %s %s[-][white]%s[-]", icon, color, name)
		// Calculate padding needed (accounting for the icon, space, and name)
		// tview color tags don't count toward display width
		displayLen := 1 + 1 + len(name) // icon + space + name
		padding := width - displayLen
		if padding < 0 {
			padding = 0
		}
		displayText := baseText + strings.Repeat(" ", padding)
		a.processesList.AddItem(displayText, "", 0, nil)
	}
}

func (a *App) handleProcessSelection(index int) {
	keys := a.getProcessNames()
	if index >= 0 && index < len(keys) {
		a.selectedProc = keys[index]
		a.updateDisplay()
	}
}

func (a *App) handleStartProcess() {
	if a.selectedProc == "" {
		return
	}

	a.processesMux.Lock()
	proc, exists := a.processes[a.selectedProc]
	a.processesMux.Unlock()

	if !exists || proc.Running {
		return
	}

	// Use configured command or default
	var cmd *exec.Cmd
	if proc.Config != nil {
		if len(proc.Config.Args) > 0 {
			cmd = exec.Command(proc.Config.Command, proc.Config.Args...)
		} else {
			cmd = exec.Command(proc.Config.Command)
		}
		cmd.Dir = proc.Config.WorkingDir
	} else {
		// Fallback to npm run dev
		cmd = exec.Command("npm", "run", "dev")
		cmd.Dir = proc.Path
	}

	cmd.SysProcAttr = &syscall.SysProcAttr{Setpgid: true}

	// Capture stdout and stderr
	stdout, err := cmd.StdoutPipe()
	if err != nil {
		a.addLog(a.selectedProc, fmt.Sprintf("[red]Error creating stdout pipe: %v", err))
		return
	}

	stderr, err := cmd.StderrPipe()
	if err != nil {
		a.addLog(a.selectedProc, fmt.Sprintf("[red]Error creating stderr pipe: %v", err))
		return
	}

	if err := cmd.Start(); err != nil {
		a.addLog(a.selectedProc, fmt.Sprintf("[red]Error starting process: %v", err))
		return
	}

	proc.Cmd = cmd
	proc.Running = true
	proc.StartTime = time.Now()

	cmdStr := proc.Config.Command + " " + strings.Join(proc.Config.Args, " ")
	a.addLog(a.selectedProc, fmt.Sprintf("[green]Started %s (PID: %d)", proc.Name, cmd.Process.Pid))
	a.addLog(a.selectedProc, fmt.Sprintf("[gray]Command: %s", cmdStr))

	// Start goroutines to read stdout and stderr
	go a.readOutput(a.selectedProc, stdout, "[white]")
	go a.readOutput(a.selectedProc, stderr, "[yellow]")

	// Monitor process completion
	go func() {
		err := cmd.Wait()
		a.processesMux.Lock()
		proc.Running = false
		proc.Cmd = nil
		a.processesMux.Unlock()

		if err != nil {
			a.addLog(a.selectedProc, fmt.Sprintf("[red]Process exited with error: %v", err))
		} else {
			a.addLog(a.selectedProc, fmt.Sprintf("[yellow]Process exited normally"))
		}
		a.app.QueueUpdateDraw(func() {
			a.refreshProcessesList()
			a.updateDisplay()
		})
	}()

	a.refreshProcessesList()
	a.updateDisplay()
}

func (a *App) handleStopProcess() {
	if a.selectedProc == "" {
		return
	}

	a.processesMux.Lock()
	proc, exists := a.processes[a.selectedProc]
	a.processesMux.Unlock()

	if !exists || !proc.Running || proc.Cmd == nil {
		return
	}

	a.addLog(a.selectedProc, fmt.Sprintf("[yellow]Stopping %s...", proc.Name))

	// Kill the process group to stop all child processes
	pgid, err := syscall.Getpgid(proc.Cmd.Process.Pid)
	if err == nil {
		syscall.Kill(-pgid, syscall.SIGTERM)
	} else {
		proc.Cmd.Process.Kill()
	}

	proc.Running = false
	proc.Cmd = nil

	a.refreshProcessesList()
	a.updateDisplay()
}

func (a *App) handleRestartProcess() {
	if a.selectedProc == "" {
		return
	}

	a.processesMux.Lock()
	proc, exists := a.processes[a.selectedProc]
	a.processesMux.Unlock()

	if !exists {
		return
	}

	if proc.Running {
		a.handleStopProcess()
		time.Sleep(500 * time.Millisecond)
	}

	a.handleStartProcess()
}

func (a *App) handleClearLogs() {
	if a.selectedProc == "" {
		return
	}

	a.processesMux.Lock()
	proc, exists := a.processes[a.selectedProc]
	a.processesMux.Unlock()

	if !exists {
		return
	}

	proc.LogsMutex.Lock()
	proc.Logs = make([]string, 0, 1000)
	proc.LogsMutex.Unlock()

	a.updateDisplay()
}

func (a *App) stopAllProcesses() {
	a.processesMux.Lock()
	defer a.processesMux.Unlock()

	for _, proc := range a.processes {
		if proc.Running && proc.Cmd != nil {
			pgid, err := syscall.Getpgid(proc.Cmd.Process.Pid)
			if err == nil {
				syscall.Kill(-pgid, syscall.SIGTERM)
			} else {
				proc.Cmd.Process.Kill()
			}
		}
	}
}

func (a *App) readOutput(procName string, reader io.Reader, color string) {
	scanner := bufio.NewScanner(reader)
	for scanner.Scan() {
		line := scanner.Text()
		timestamp := time.Now().Format("15:04:05")
		a.addLog(procName, fmt.Sprintf("[gray]%s[white] %s%s", timestamp, color, line))
	}
}

func (a *App) addLog(procName, message string) {
	a.processesMux.Lock()
	proc, exists := a.processes[procName]
	a.processesMux.Unlock()

	if !exists {
		return
	}

	proc.LogsMutex.Lock()
	proc.Logs = append(proc.Logs, message)
	// Keep only last 1000 logs
	if len(proc.Logs) > 1000 {
		proc.Logs = proc.Logs[len(proc.Logs)-1000:]
	}
	proc.LogsMutex.Unlock()

	if procName == a.selectedProc {
		a.app.QueueUpdateDraw(func() {
			a.updateLogs()
		})
	}
}

func (a *App) updateDisplay() {
	a.updateLogs()
	a.updateStats()
	a.updateInfo()
}

func (a *App) updateLogs() {
	if a.selectedProc == "" {
		a.logs.SetText("")
		return
	}

	a.processesMux.Lock()
	proc, exists := a.processes[a.selectedProc]
	a.processesMux.Unlock()

	if !exists {
		return
	}

	proc.LogsMutex.Lock()
	defer proc.LogsMutex.Unlock()

	// Show last 100 logs
	start := 0
	if len(proc.Logs) > 100 {
		start = len(proc.Logs) - 100
	}

	a.logs.SetText(strings.Join(proc.Logs[start:], "\n"))
	a.logs.ScrollToEnd()
}

func (a *App) updateStats() {
	if a.selectedProc == "" {
		a.stats.SetText("")
		return
	}

	a.processesMux.Lock()
	proc, exists := a.processes[a.selectedProc]
	a.processesMux.Unlock()

	if !exists {
		return
	}

	if !proc.Running {
		a.stats.SetText("[red]Not Running")
		return
	}

	uptime := time.Since(proc.StartTime)
	stats := fmt.Sprintf(`[yellow]Status:[white]    [green]Running
[yellow]Uptime:[white]    %s
[yellow]PID:[white]       %d
[yellow]CPU:[white]       %.1f%%
[yellow]Memory:[white]    %.1f MB`,
		formatDuration(uptime),
		proc.Cmd.Process.Pid,
		proc.CPU,
		float64(proc.Memory)/(1024*1024))

	a.stats.SetText(stats)
}

func (a *App) updateInfo() {
	if a.selectedProc == "" {
		a.info.SetText("")
		return
	}

	a.processesMux.Lock()
	proc, exists := a.processes[a.selectedProc]
	a.processesMux.Unlock()

	if !exists {
		return
	}

	cmdStr := "npm run dev"
	if proc.Config != nil {
		cmdStr = proc.Config.Command + " " + strings.Join(proc.Config.Args, " ")
	}

	info := fmt.Sprintf(`[yellow]App:[white]      %s
[yellow]Path:[white]     %s
[yellow]Command:[white]  %s

[yellow]Keybindings:[white]
  [cyan]j/k, ↑/↓[white] - Navigate
  [cyan]S[white] - Start
  [cyan]s[white] - Stop
  [cyan]R[white] - Restart
  [cyan]c[white] - Clear logs
  [cyan]q[white] - Quit`,
		proc.Name,
		proc.Path,
		cmdStr)

	a.info.SetText(info)
}

func (a *App) focusNext() {
	a.focusIndex = (a.focusIndex + 1) % len(a.focusable)
	a.updateFocus()
}

func (a *App) focusPrev() {
	a.focusIndex = (a.focusIndex - 1 + len(a.focusable)) % len(a.focusable)
	a.updateFocus()
}

func (a *App) updateFocus() {
	a.app.SetFocus(a.focusable[a.focusIndex])
}

func (a *App) autoRefresh() {
	ticker := time.NewTicker(1 * time.Second)
	defer ticker.Stop()

	for range ticker.C {
		a.app.QueueUpdateDraw(func() {
			a.updateStats()
		})
	}
}

func formatDuration(d time.Duration) string {
	d = d.Round(time.Second)
	h := d / time.Hour
	d -= h * time.Hour
	m := d / time.Minute
	d -= m * time.Minute
	s := d / time.Second

	if h > 0 {
		return fmt.Sprintf("%dh %dm %ds", h, m, s)
	} else if m > 0 {
		return fmt.Sprintf("%dm %ds", m, s)
	}
	return fmt.Sprintf("%ds", s)
}
