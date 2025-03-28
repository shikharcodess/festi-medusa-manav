import { Migration } from '@mikro-orm/migrations';

export class Migration20250327123136 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "product_assoc" ("id" text not null, "name" text not null, "metadata" jsonb null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "product_assoc_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_product_assoc_deleted_at" ON "product_assoc" (deleted_at) WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "product_assoc" cascade;`);
  }

}
