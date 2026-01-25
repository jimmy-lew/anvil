package process

import (
	"os"
	"path/filepath"

	"github.com/jimmy-lew/anvil/packages/cli/pkg/config"
)

func (m *Manager) DetectApps(root string) {
	// Try config first
	if configs, err := config.LoadConfig(root); err == nil {
		for _, cfg := range configs {
			fullPath := cfg.Path
			if !filepath.IsAbs(fullPath) {
				fullPath = filepath.Join(root, fullPath)
			}
			m.Processes[cfg.Name] = &AppProcess{
				Name: cfg.Name, Path: fullPath, Config: &cfg, Logs: make([]string, 0, 1000),
			}
		}
		return
	}

	// Manual fallback
	appsDir := filepath.Join(root, "apps")
	dirs := []string{"bot", "dashboard"}
	for _, d := range dirs {
		path := filepath.Join(appsDir, d)
		if _, err := os.Stat(path); err == nil {
			m.Processes[d] = &AppProcess{
				Name: d, Path: path, Logs: make([]string, 0, 1000),
			}
		}
	}
}
