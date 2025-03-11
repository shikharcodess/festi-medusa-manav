import { MedusaContainer } from "@medusajs/framework/types";
import { VARY_MODULES } from "src/modules/vary";
import VaryService from "src/modules/vary/service";

var syncRunning: boolean = false;

export default async function greetingJob(container: MedusaContainer) {
  if (!syncRunning) {
    syncRunning = true;
    try {
      const logger = container.resolve("logger");
      logger.info("Vary Product Sync Trigger Started...");

      const varyService: VaryService = container.resolve(VARY_MODULES);

      const allVaryProducts = await varyService.pullMultipleProductFromVary();
      for (const varyProduct of allVaryProducts) {
        const found = await varyService.checkProductExistanceOnMedusa(
          varyProduct.idWebCat
        );
        if (!found) {
          await varyService.createNewProductInMedusa(varyProduct);
        }
      }

      logger.info("Vary Product Sync Trigger Completed!");
    } catch (error) {
      console.error(error);
    }
    syncRunning = false;
  }
}

export const config = {
  name: "vary_medusa_product_sync",
  schedule: "* * * * *",
};
