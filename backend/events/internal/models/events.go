package models

import (
	"time"

	"github.com/uptrace/bun"
)

type Event struct {
	bun.BaseModel `bun:"table:event,alias:e"`

	ID                int64     `bun:"id,pk,autoincrement" json:"id"`
	TimeSlotServiceID int64     `bun:"time_slot_service_id" json:"time_slot_service_id"`
	Capacity          int32     `bun:"capacity" json:"capacity"`
	Datetime          time.Time `bun:"datetime" json:"datetime"`
	ServiceTypeID     int64     `bun:"service_type_id" json:"service_type_id"`
}
