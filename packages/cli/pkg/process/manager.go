package process

import (
	"bufio"
	"fmt"
	"io"
	"os/exec"
	"sync"
	"syscall"
	"time"
)

type Manager struct {
	Processes    map[string]*AppProcess
	ProcessesMux sync.Mutex
}

func NewManager() *Manager {
	return &Manager{
		Processes: make(map[string]*AppProcess),
	}
}

func ReadOutput(procName string, reader io.Reader, color string, callback func(string, string)) {
	scanner := bufio.NewScanner(reader)
	for scanner.Scan() {
		line := scanner.Text()
		timestamp := time.Now().Format("15:04:05")
		msg := fmt.Sprintf("[gray]%s[white] %s%s", timestamp, color, line)
		callback(procName, msg)
	}
}

func (m *Manager) StartProcess(name string, onLog func(string, string)) error {
	m.ProcessesMux.Lock()
	proc, exists := m.Processes[name]
	m.ProcessesMux.Unlock()

	if !exists || proc.Running {
		return nil
	}

	var cmd *exec.Cmd
	if proc.Config != nil {
		cmd = exec.Command(proc.Config.Command, proc.Config.Args...)
		cmd.Dir = proc.Config.WorkingDir
	} else {
		cmd = exec.Command("npm", "run", "dev")
		cmd.Dir = proc.Path
	}

	cmd.SysProcAttr = &syscall.SysProcAttr{Setpgid: true}

	stdout, _ := cmd.StdoutPipe()
	stderr, _ := cmd.StderrPipe()

	if err := cmd.Start(); err != nil {
		return err
	}

	proc.Cmd = cmd
	proc.Running = true
	proc.StartTime = time.Now()

	go ReadOutput(name, stdout, "[white]", onLog)
	go ReadOutput(name, stderr, "[yellow]", onLog)

	go func() {
		cmd.Wait()
		m.ProcessesMux.Lock()
		proc.Running = false
		proc.Cmd = nil
		m.ProcessesMux.Unlock()
	}()

	return nil
}

func (m *Manager) StopProcess(name string) {
	m.ProcessesMux.Lock()
	proc, exists := m.Processes[name]
	m.ProcessesMux.Unlock()

	if !exists || !proc.Running || proc.Cmd == nil {
		return
	}

	pgid, err := syscall.Getpgid(proc.Cmd.Process.Pid)
	if err == nil {
		syscall.Kill(-pgid, syscall.SIGTERM)
	} else {
		proc.Cmd.Process.Kill()
	}
}

func (m *Manager) StopAll() {
	for name := range m.Processes {
		m.StopProcess(name)
	}
}
