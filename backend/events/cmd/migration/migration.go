package main

import (
	"database/sql"
	"flag"
	"fmt"
	"log"
	"os"
	"strings"

	"github.com/uptrace/bun"
	"github.com/uptrace/bun/dialect/mysqldialect"
	"github.com/uptrace/bun/extra/bundebug"
	"github.com/uptrace/bun/migrate"
	"github.com/urfave/cli/v2"
	"go.uber.org/zap"

	"github.com/Slava02/SaintDiego/backend/events/internal/config"
	migrations "github.com/Slava02/SaintDiego/backend/events/migrations"
	"github.com/Slava02/SaintDiego/backend/events/pkg/logger"

	_ "github.com/go-sql-driver/mysql"
)

var configPath = flag.String("config", "configs/config.toml", "Path to config file")

const nameMain = "migration"

func main() {
	cfg, err := config.ParseAndValidate(*configPath)
	if err != nil {
		log.Fatal(err)
	}

	if err := logger.Init(logger.NewOptions(
		cfg.Log.Level,
		logger.WithProductionMode(cfg.Global.IsProduction()),
	)); err != nil {
		log.Fatal(err)
	}

	defer logger.Sync()

	lg := zap.L().Named(nameMain)

	sqlDb, err := sql.Open("mysql", cfg.Database.Conn())

	if err != nil {
		lg.Fatal(err.Error())
	}

	db := bun.NewDB(sqlDb, mysqldialect.New())

	db.AddQueryHook(bundebug.NewQueryHook(
		bundebug.WithEnabled(true),
		bundebug.FromEnv(),
	))

	app := &cli.App{
		Name: "migrate",
		Commands: []*cli.Command{
			newMigrationCmd(
				migrate.NewMigrator(db, migrations.New(), migrate.WithMarkAppliedOnSuccess(true)),
				lg,
			),
		},
	}
	if err := app.Run(os.Args); err != nil {
		log.Fatal(err)
	}
}

//nolint:errcheck // internal use only
func newMigrationCmd(m *migrate.Migrator, l *zap.Logger) *cli.Command {
	return &cli.Command{
		Name:  "migrate",
		Usage: "Database migration management commands",
		Description: `Manage database migrations for the service.
This command provides tools to create, apply, and rollback database migrations.
Each migration is a set of SQL files that define how to upgrade (up) and downgrade (down) the database schema.`,
		Subcommands: []*cli.Command{
			{
				Name:  "init",
				Usage: "Initialize the migrations table",
				Description: `Creates the migrations table in the database if it doesn't exist.
This table is used to track which migrations have been applied.
Example:
  events migrate init`,
				Action: func(ctx *cli.Context) error {
					return m.Init(ctx.Context)
				},
			},
			{
				Name:  "up",
				Usage: "Apply pending migrations",
				Description: `Applies all pending migrations in the correct order.
This command will:
1. Lock the migrations table to prevent concurrent migrations
2. Apply all pending migrations in a transaction
3. Release the lock when done
Example:
  events migrate up`,
				Action: func(ctx *cli.Context) error {
					if err := m.Lock(ctx.Context); err != nil {
						return fmt.Errorf("lock: %w", err)
					}
					defer m.Unlock(ctx.Context)

					group, err := m.Migrate(ctx.Context)
					if err != nil {
						return fmt.Errorf("migrate: %w", err)
					}
					if group.IsZero() {
						l.Info("there are no new migrations to run (database is up to date)")
						return nil
					}
					l.Info("migrated to ", zap.Any("grous", group))
					return nil
				},
			},
			{
				Name:  "down",
				Usage: "Rollback the last migration group",
				Description: `Rolls back the most recently applied migration group.
This command will:
1. Lock the migrations table to prevent concurrent migrations
2. Roll back the last group of migrations in a transaction
3. Release the lock when done
Example:
  events migrate down`,
				Action: func(ctx *cli.Context) error {
					if err := m.Lock(ctx.Context); err != nil {
						return fmt.Errorf("lock migration: %w", err)
					}
					defer m.Unlock(ctx.Context)

					group, err := m.Rollback(ctx.Context)
					if err != nil {
						return fmt.Errorf("rollback: %w", err)
					}
					if group.IsZero() {
						l.Info("there are no groups to rollback")
						return nil
					}
					l.Info("rolled back to ", zap.Any("grous", group))
					return nil
				},
			},
			{
				Name:  "create",
				Usage: "Create new migration files",
				Description: `Creates new up and down SQL migration files.
The migration name will be created from the provided arguments joined with underscores.
Example:
  events migrate create add_user_table
  events migrate create add index to users`,
				Action: func(ctx *cli.Context) error {
					name := strings.Join(ctx.Args().Slice(), "_")
					files, err := m.CreateTxSQLMigrations(ctx.Context, name)
					if err != nil {
						return fmt.Errorf("create migration: %w", err)
					}
					for _, f := range files {
						l.Info("created migration %s (%s)", zap.String("name", f.Name), zap.String("path", f.Path))
					}
					return nil
				},
			},
			{
				Name:  "status",
				Usage: "Show migration status",
				Description: `Displays the current status of all migrations.
This command shows:
- Total number of migrations
- Number of unapplied migrations
- The last applied migration group
Example:
  events migrate status`,
				Action: func(ctx *cli.Context) error {
					ms, err := m.MigrationsWithStatus(ctx.Context)
					if err != nil {
						return fmt.Errorf("migration status: %w", err)
					}
					var buf strings.Builder
					buf.WriteString(fmt.Sprintf("migrations: %s - ", ms))
					buf.WriteString(fmt.Sprintf("unapplied migrations: %s - ", ms.Unapplied()))
					buf.WriteString(fmt.Sprintf("last migration group: %s", ms.LastGroup()))
					l.Info(buf.String())
					return nil
				},
			},
		},
	}
}
