package handles

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strconv"
	"testing"

	"github.com/alist-org/alist/v3/internal/conf"
	"github.com/alist-org/alist/v3/internal/db"
	"github.com/alist-org/alist/v3/internal/model"
	"github.com/alist-org/alist/v3/internal/op"
	"github.com/gin-gonic/gin"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

func setupRegisterTestDB(t *testing.T) {
	t.Helper()

	conf.Conf = conf.DefaultConfig()
	conf.Conf.Database.Type = "sqlite"

	gormDB, err := gorm.Open(sqlite.Open(":memory:"), &gorm.Config{})
	if err != nil {
		t.Fatalf("open sqlite db: %v", err)
	}
	db.Init(gormDB)
	op.SettingCacheUpdate()

	if err := op.CreateRole(&model.Role{
		ID:          uint(model.GUEST),
		Name:        "guest",
		Description: "Guest",
		PermissionScopes: []model.PermissionEntry{
			{Path: "/", Permission: 0},
		},
	}); err != nil {
		t.Fatalf("create guest role: %v", err)
	}
	if err := op.CreateRole(&model.Role{
		ID:          uint(model.NEWGENERAL),
		Name:        "general",
		Description: "General",
		PermissionScopes: []model.PermissionEntry{
			{Path: "/", Permission: 0xFFFF},
		},
	}); err != nil {
		t.Fatalf("create general role: %v", err)
	}
	if err := op.SaveSettingItems([]model.SettingItem{
		{Key: conf.AllowRegister, Value: "true"},
		{Key: conf.DefaultRole, Value: strconv.Itoa(model.GUEST)},
	}); err != nil {
		t.Fatalf("save settings: %v", err)
	}
}

func TestRegisterDoesNotCreateGuestUserWhenDefaultRoleIsGuest(t *testing.T) {
	setupRegisterTestDB(t)
	gin.SetMode(gin.TestMode)

	router := gin.New()
	router.POST("/api/auth/register", Register)

	body, err := json.Marshal(RegisterReq{
		Username: "new-user",
		Password: "password123",
	})
	if err != nil {
		t.Fatalf("marshal request: %v", err)
	}
	req := httptest.NewRequest(http.MethodPost, "/api/auth/register", bytes.NewReader(body))
	req.Header.Set("Content-Type", "application/json")
	rec := httptest.NewRecorder()

	router.ServeHTTP(rec, req)

	if rec.Code != http.StatusOK {
		t.Fatalf("expected http 200, got %d", rec.Code)
	}
	user, err := op.GetUserByName("new-user")
	if err != nil {
		t.Fatalf("get registered user: %v", err)
	}
	if user.IsGuest() {
		t.Fatalf("registered user should not have guest role: %#v", user.Role)
	}
}
