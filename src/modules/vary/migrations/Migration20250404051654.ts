import { Migration } from '@mikro-orm/migrations';

export class Migration20250404051654 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "product_assoc" ("id" text not null, "name" text not null, "rank" integer null, "metadata" jsonb null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "product_assoc_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_product_assoc_deleted_at" ON "product_assoc" (deleted_at) WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "vary_sync_configuration" ("id" text not null, "active" boolean not null default false, "running" boolean not null default false, "trigger_duration" integer not null, "trigger_unit" text not null, "metadata" jsonb null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "vary_sync_configuration_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_vary_sync_configuration_deleted_at" ON "vary_sync_configuration" (deleted_at) WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "vary_sync_logs" ("id" text not null, "start_time" timestamptz not null, "end_time" timestamptz not null, "modified_actions" integer not null, "count_on_vary" integer not null, "count_on_medusa" integer not null, "metadata" jsonb null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "vary_sync_logs_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_vary_sync_logs_deleted_at" ON "vary_sync_logs" (deleted_at) WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "product_assoc" cascade;`);

    this.addSql(`drop table if exists "vary_sync_configuration" cascade;`);

    this.addSql(`drop table if exists "vary_sync_logs" cascade;`);
  }

}
