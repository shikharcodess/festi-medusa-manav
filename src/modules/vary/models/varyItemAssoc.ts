import { model } from "@medusajs/framework/utils";

export const ProductAssocs = model.define("product_assoc", {
  id: model.id().primaryKey(),
  name: model.text(),
  rank: model.number().nullable(),
  metadata: model.json().nullable(),
});
