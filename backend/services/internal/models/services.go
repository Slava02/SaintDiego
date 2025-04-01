package models

import (
	"time"

	"github.com/uptrace/bun"
)

type ServiceType struct {
	bun.BaseModel `bun:"table:service_type,alias:st"`

	ID          int64     `bun:"id,pk,autoincrement" json:"id"`
	CreatedByID *int64    `bun:"created_by_id" json:"created_by_id,omitempty"`
	UpdatedByID *int64    `bun:"updated_by_id" json:"updated_by_id,omitempty"`
	Name        string    `bun:"name" json:"name" validate:"required,max=255"`
	Pay         bool      `bun:"pay" json:"pay"`
	Document    bool      `bun:"document" json:"document"`
	SyncID      *int64    `bun:"sync_id" json:"sync_id,omitempty"`
	Sort        *int64    `bun:"sort" json:"sort,omitempty"`
	CreatedAt   time.Time `bun:"created_at" json:"created_at"`
	UpdatedAt   time.Time `bun:"updated_at" json:"updated_at"`
}

type Service struct {
	bun.BaseModel `bun:"table:service,alias:s"`

	ID          int64     `bun:"id,pk,autoincrement" json:"id"`
	ClientID    *int64    `bun:"client_id" json:"client_id,omitempty"`
	TypeID      *int64    `bun:"type_id" json:"type_id,omitempty"`
	CreatedByID *int64    `bun:"created_by_id" json:"created_by_id,omitempty"`
	UpdatedByID *int64    `bun:"updated_by_id" json:"updated_by_id,omitempty"`
	Comment     string    `bun:"comment" json:"comment,omitempty"`
	Amount      *int64    `bun:"amount" json:"amount,omitempty"`
	SyncID      *int64    `bun:"sync_id" json:"sync_id,omitempty"`
	Sort        *int64    `bun:"sort" json:"sort,omitempty"`
	CreatedAt   time.Time `bun:"created_at" json:"created_at"`
	UpdatedAt   time.Time `bun:"updated_at" json:"updated_at"`
}

type ServiceTypeSettings struct {
	bun.BaseModel `bun:"table:service_type_settings,alias:sts"`

	ID            int64     `bun:"id,pk,autoincrement" json:"id"`
	ServiceTypeID int64     `bun:"service_type_id" json:"service_type_id"`
	PeriodDays    int64     `bun:"period_days" json:"period_days"`
	CreatedAt     time.Time `bun:"created_at" json:"created_at"`
	UpdatedAt     time.Time `bun:"updated_at" json:"updated_at"`

	// Relations
	ServiceType *ServiceType `bun:"rel:belongs-to,join:service_type_id=id" json:"service_type,omitempty"`
}
