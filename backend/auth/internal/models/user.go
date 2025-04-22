package models

import "github.com/uptrace/bun"

type User struct {
	bun.BaseModel `bun:"table:schedule_users"`

	ID       int64  `bun:"id,pk,autoincrement"`
	Username string `bun:"login"`
	Password []byte `bun:"password_hash"`
}
