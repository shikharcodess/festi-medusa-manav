import { defineLink } from "@medusajs/framework/utils";
import ProductModule from "@medusajs/medusa/product";
import vary from "src/modules/vary";

export default defineLink(
  {
    linkable: ProductModule.linkable.product,
    isList: true,
  },
  vary.linkable.productAssoc
);
