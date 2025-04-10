package storage

import (
	"context"
	"database/sql"
	"fmt"

	"github.com/uptrace/bun"
	"github.com/uptrace/bun/dialect/mysqldialect"
	"github.com/uptrace/bun/extra/bundebug"
)

type txKey struct{}

// Transactor runs logic inside a single database transaction
type Transactor interface {
	WithinTransaction(ctx context.Context, tFunc func(ctx context.Context) error) error
}

//go:generate options-gen -out-filename=db_options.gen.go -from-struct=Options
type Options struct {
	SqlDB *sql.DB `option:"mandatory" validate:"required"`
	Prod  bool    `validate:"omitempty"`
}

// Database implements Transactor interface
type Database struct {
	db *bun.DB
}

// NewDatabase creates a new Database instance
func New(opts Options) (*Database, error) {
	if err := opts.Validate(); err != nil {
		return nil, fmt.Errorf("validate options: %v", err)
	}

	db := bun.NewDB(opts.SqlDB, mysqldialect.New())

	if !opts.Prod {
		db.AddQueryHook(bundebug.NewQueryHook(
			bundebug.WithVerbose(true),
		))
	}

	return &Database{db}, nil
}

// injectTx injects transaction to context
func injectTx(ctx context.Context, tx bun.Tx) context.Context {
	return context.WithValue(ctx, txKey{}, tx)
}

// extractTx extracts transaction from context
func extractTx(ctx context.Context) (bun.Tx, bool) {
	if tx, ok := ctx.Value(txKey{}).(bun.Tx); ok {
		return tx, true
	}
	var emptyTx bun.Tx
	return emptyTx, false
}

// Select returns a select query that works with or without transaction
func (db *Database) Select(ctx context.Context, model interface{}) *bun.SelectQuery {
	tx, ok := extractTx(ctx)
	if ok {
		return tx.NewSelect().Model(model)
	}
	return db.db.NewSelect().Model(model)
}

// Insert returns an insert query that works with or without transaction
func (db *Database) Insert(ctx context.Context, model interface{}) *bun.InsertQuery {
	tx, ok := extractTx(ctx)
	if ok {
		return tx.NewInsert().Model(model)
	}
	return db.db.NewInsert().Model(model)
}

// Update returns an update query that works with or without transaction
func (db *Database) Update(ctx context.Context, model interface{}) *bun.UpdateQuery {
	tx, ok := extractTx(ctx)
	if ok {
		return tx.NewUpdate().Model(model)
	}
	return db.db.NewUpdate().Model(model)
}

// Delete returns a delete query that works with or without transaction
func (db *Database) Delete(ctx context.Context, model interface{}) *bun.DeleteQuery {
	tx, ok := extractTx(ctx)
	if ok {
		return tx.NewDelete().Model(model)
	}
	return db.db.NewDelete().Model(model)
}

// WithinTransaction runs function within transaction
//
// The transaction commits when function were finished without error
func (db *Database) WithinTransaction(ctx context.Context, tFunc func(ctx context.Context) error) error {
	// begin transaction
	tx, err := db.db.BeginTx(ctx, nil)
	if err != nil {
		return fmt.Errorf("begin transaction: %w", err)
	}

	defer func() {
		// finalize transaction on panic, etc.
		if errTx := tx.Rollback(); errTx != nil {
			fmt.Printf("rollback transaction: %v", errTx)
		}
	}()

	// run callback
	err = tFunc(injectTx(ctx, tx))
	if err != nil {
		// if error, rollback
		if errRollback := tx.Rollback(); errRollback != nil {
			fmt.Printf("rollback transaction: %v", errRollback)
		}
		return err
	}

	// if no error, commit
	if errCommit := tx.Commit(); errCommit != nil {
		fmt.Printf("commit transaction: %v", errCommit)
	}
	return nil
}
