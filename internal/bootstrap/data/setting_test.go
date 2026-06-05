package data

import (
	"testing"

	"github.com/alist-org/alist/v3/internal/conf"
)

func TestInitialSettingsAllowsRegistrationByDefault(t *testing.T) {
	if conf.Conf == nil {
		conf.Conf = conf.DefaultConfig()
	}

	settings := InitialSettings()

	for _, item := range settings {
		if item.Key == conf.AllowRegister {
			if item.Value != "true" {
				t.Fatalf("expected %s to default to true, got %q", conf.AllowRegister, item.Value)
			}
			if item.PreDefault != "false" {
				t.Fatalf("expected %s previous default to be false, got %q", conf.AllowRegister, item.PreDefault)
			}
			return
		}
	}

	t.Fatalf("expected %s setting to exist", conf.AllowRegister)
}
