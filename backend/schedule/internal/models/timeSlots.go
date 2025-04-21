package models

import (
	"time"

	"github.com/uptrace/bun"
)

type TimeSlot struct {
	bun.BaseModel `bun:"table:time_slot,alias:ts"`

	ID         int64     `bun:"id,pk,autoincrement" json:"id"`
	Title      string    `bun:"title,notnull" json:"title" validate:"required,max=255"`
	Type       string    `bun:"type,notnull,type:enum('single','recurring')" json:"type" validate:"required,oneof=single recurring"`
	LocationID int64     `bun:"location_id,notnull" json:"location_id" validate:"required"`
	Capacity   int32     `bun:"capacity,notnull" json:"capacity" validate:"required,min=1"`
	StartDate  time.Time `bun:"start_date,notnull" json:"start_date" validate:"required"`
	EndDate    time.Time `bun:"end_date,notnull" json:"end_date" validate:"required,gtfield=StartDate"`
	Status     string    `bun:"status,notnull,default:'active',type:enum('active','archived')" json:"status" validate:"required,oneof=active archived"`
	CreatedAt  time.Time `bun:"created_at,notnull,default:current_timestamp" json:"created_at"`
	UpdatedAt  time.Time `bun:"updated_at,notnull,default:current_timestamp" json:"updated_at"`

	// Relations
	Location *Location `bun:"rel:belongs-to,join:location_id=id" json:"location,omitempty"`

	// Not mapped fields
	Services   []*TimeSlotService  `bun:"-" json:"services,omitempty"`
	Recurrence *TimeSlotRecurrence `bun:"-" json:"recurrence,omitempty"`
}

type TimeSlotRecurrence struct {
	bun.BaseModel `bun:"table:time_slot_recurrence,alias:tsr"`

	TimeSlotID int64     `bun:"time_slot_id,pk" json:"time_slot_id" validate:"required"`
	Frequency  string    `bun:"frequency,notnull,type:enum('daily','weekly','monthly')" json:"frequency" validate:"required,oneof=daily weekly monthly"`
	Interval   int32     `bun:"interval,notnull,default:1" json:"interval" validate:"required,min=1"`
	EndType    string    `bun:"end_type,notnull,type:enum('never','date')" json:"end_type" validate:"required,oneof=never date"`
	EndValue   time.Time `bun:"end_value" json:"end_value,omitempty" validate:"omitempty,gtfield=TimeSlot.StartDate"`

	// Relations
	TimeSlot *TimeSlot `bun:"rel:belongs-to,join:time_slot_id=id" json:"time_slot,omitempty"`
}

type TimeSlotService struct {
	bun.BaseModel `bun:"table:time_slot_service,alias:tss"`

	ID            int64     `bun:"id,pk,autoincrement" json:"id"`
	TimeSlotID    int64     `bun:"time_slot_id,notnull" json:"time_slot_id" validate:"required"`
	ServiceTypeID int64     `bun:"service_type_id,notnull" json:"service_type_id" validate:"required"`
	Capacity      int32     `bun:"capacity,notnull" json:"capacity" validate:"required,min=1"`
	BookingWindow int32     `bun:"booking_window,notnull" json:"booking_window" validate:"required,min=1"`
	Time          time.Time `bun:"time,notnull" json:"time" validate:"required"`

	// Relations
	TimeSlot *TimeSlot `bun:"rel:belongs-to,join:time_slot_id=id" json:"time_slot,omitempty"`
}

type Event struct {
	bun.BaseModel `bun:"table:event,alias:e"`

	ID                int64     `bun:"id,pk,autoincrement" json:"id"`
	TimeSlotServiceID int64     `bun:"time_slot_service_id,notnull" json:"time_slot_service_id" validate:"required"`
	ServiceName       string    `bun:"service_name,notnull" json:"service_name" validate:"required,max=256"` // TODO: get from service services
	Capacity          int32     `bun:"capacity,notnull" json:"capacity" validate:"required,min=1"`
	DateTime          time.Time `bun:"datetime,notnull" json:"datetime" validate:"required"`
	ServiceTypeID     int64     `bun:"service_type_id,notnull" json:"service_type_id" validate:"required"`

	// Relations
	TimeSlotService *TimeSlotService `bun:"rel:belongs-to,join:time_slot_service_id=id" json:"time_slot_service,omitempty"`
}

type ServiceType struct {
	ID   int64  ` json:"id" validate:"required,min=1"`
	Name string `json:"name" validate:"required,max=256"`
}
