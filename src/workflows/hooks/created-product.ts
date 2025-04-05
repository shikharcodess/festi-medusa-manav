import { createProductsWorkflow } from "@medusajs/medusa/core-flows";
import { StepResponse } from "@medusajs/framework/workflows-sdk";
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils";
import { LinkDefinition } from "@medusajs/framework/types";
import { VARY_MODULES } from "../../modules/vary";
import VaryService from "../../modules/vary/service";
import { Link } from "@medusajs/framework/modules-sdk";

createProductsWorkflow.hooks.productsCreated(
  async ({ products, additional_data }, { container }) => {
    if (!additional_data?.product_assoc_ids) {
      return new StepResponse([], []);
    }

    const varyService: VaryService = container.resolve(VARY_MODULES);

    const link: Link = container.resolve(ContainerRegistrationKeys.LINK);
    const links: LinkDefinition[] = [];

    for (const ids of additional_data.product_assoc_ids as string[]) {
      const productAssoc =
        await varyService.getOneVaryProductAssocFromMedusaById(ids as string);
      if (products.length > 0) {
        links.push({
          [Modules.PRODUCT]: {
            product_id: products[0].id,
          },
          [VARY_MODULES]: {
            product_assoc_id: productAssoc.id,
          },
        });
      }
    }

    await link.create(links);
    return new StepResponse(links, links);
  }
);
