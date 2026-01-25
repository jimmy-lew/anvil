package config

import (
	"encoding/json"
	"os"
	"path/filepath"
)

type AppConfig struct {
	Name       string   `json:"name"`
	Path       string   `json:"path"`
	Command    string   `json:"command"`
	Args       []string `json:"args"`
	WorkingDir string   `json:"workingDir,omitempty"`
}

func LoadConfig(root string) ([]AppConfig, error) {
	configPath := filepath.Join(root, "monorepo-tui.json")
	data, err := os.ReadFile(configPath)
	if err != nil {
		return nil, err
	}
	var configs []AppConfig
	if err := json.Unmarshal(data, &configs); err != nil {
		return nil, err
	}
	return configs, nil
}
