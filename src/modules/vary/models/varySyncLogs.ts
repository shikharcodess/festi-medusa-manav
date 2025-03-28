import { model } from "@medusajs/framework/utils";

export const VarySyncLogs = model.define("vary_sync_logs", {
  id: model.id().primaryKey(),
  start_time: model.dateTime(),
  end_time: model.dateTime(),
  modified_actions: model.number(),
  count_on_vary: model.number(),
  count_on_medusa: model.number(),
  metadata: model.json().nullable(),
});
