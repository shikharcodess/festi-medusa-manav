import { model } from "@medusajs/framework/utils";

export const VaryProductAssoc = model.define("product_assoc", {
  id: model.id().primaryKey(),
  name: model.text(),
  metadata: model.json().nullable(),
});
