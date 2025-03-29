import { defineLink } from "@medusajs/framework/utils";
import ProductModule from "@medusajs/medusa/product";
import vary from "../modules/vary";

export default defineLink(
  {
    linkable: ProductModule.linkable.product,
    isList: true,
  },
  vary.linkable.productAssoc
);
