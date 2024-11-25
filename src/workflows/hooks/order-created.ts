import { createOrdersWorkflow } from "@medusajs/medusa/core-flows";
import { SYNC_MODULE } from "src/modules/sync-service";
import SyncService from "src/modules/sync-service/service";

createOrdersWorkflow.hooks.orderCreated(async ({ order }, { container }) => {
  try {
    const syncService: SyncService = container.resolve(SYNC_MODULE);
    console.log("createOrdersWorkflow => ", order);

    const result = await syncService.syncOrderToVary(order);
    console.log(result);
  } catch (error) {
    console.log("create order workflow hooks error => ", error);
  }
});
