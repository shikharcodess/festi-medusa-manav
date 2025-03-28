import { model } from "@medusajs/framework/utils";

export const VarySyncConfiguration = model.define("vary_sync_configuration", {
  id: model.id().primaryKey(),
  active: model.boolean().default(false),
  running: model.boolean().default(false),
  trigger_duration: model.number(),
  trigger_unit: model.text(),
  metadata: model.json().nullable(),
});
