import {
  ICustomerModuleService,
  IOrderModuleService,
  IProductModuleService,
  MedusaContainer,
} from "@medusajs/framework/types";
import { Modules } from "@medusajs/framework/utils";
import { createSalesChannelsWorkflow } from "@medusajs/medusa/core-flows";
import { VARY_MODULES } from "./../modules/vary";
import VaryService from "./../modules/vary/service";

var syncRunning: boolean = false;

export default async function greetingJob(container: MedusaContainer) {
  if (!syncRunning) {
    syncRunning = true;
    try {
      const logger = container.resolve("logger");
      logger.info("Vary Product Sync Trigger Started...");

      const salesChannelModuleService = container.resolve(
        Modules.SALES_CHANNEL
      );
      let defaultSalesChannel =
        await salesChannelModuleService.listSalesChannels({
          name: "Default Sales Channel",
        });

      if (!defaultSalesChannel.length) {
        // create the default sales channel
        const { result: salesChannelResult } =
          await createSalesChannelsWorkflow(container).run({
            input: {
              salesChannelsData: [
                {
                  name: "Default Sales Channel",
                },
              ],
            },
          });
        defaultSalesChannel = salesChannelResult;
      }

      if (defaultSalesChannel.length <= 0) {
        return;
      }

      const productService: IProductModuleService = container.resolve(
        Modules.PRODUCT
      );
      const orderService: IOrderModuleService = container.resolve(
        Modules.ORDER
      );
      const customerService: ICustomerModuleService = container.resolve(
        Modules.CUSTOMER
      );

      const varyService: VaryService = container.resolve(VARY_MODULES);
      varyService.setDependencies(
        productService,
        orderService,
        customerService
      );

      const allVaryProducts = await varyService.pullAllProductFromVary();
      console.log(
        `All Vary Products Fetched | Length: ${allVaryProducts.length}`
      );

      var count: number = 0;

      for (const varyProduct of allVaryProducts) {
        if (varyProduct.idWebCat > 0) {
          const found = await varyService.checkProductExistanceOnMedusa(
            varyProduct.idItem,
            varyProduct.sItemCode
          );

          if (!found) {
            await varyService.createNewProductInMedusa(
              varyProduct,
              defaultSalesChannel[0].id
            );
          }

          count++;
          if (count > 5) {
            break;
          }
        }
      }

      logger.info("Vary Product Sync Trigger Completed!");
      syncRunning = false;
    } catch (error) {
      syncRunning = false;
      console.error(error);
    }
  }
}

export const config = {
  name: "vary_medusa_product_sync",
  schedule: "* * * * *",
  // schedule: "*/30 * * * *",
};
