import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk";
import {
  completeCartWorkflow,
  completeCartWorkflowId,
  createOrdersWorkflow,
} from "@medusajs/medusa/core-flows";
import { SYNC_MODULE } from "src/modules/sync-service";
import SyncService from "src/modules/sync-service/service";

// createOrdersWorkflow.hooks.orderCreated(async ({ order }, { container }) => {
//   try {
//     console.log("createOrdersWorkflow => ", order);
//     const syncService: SyncService = container.resolve(SYNC_MODULE);

//     const result = await syncService.syncOrderToVary(order);
//     console.log(result);
//   } catch (error) {
//     console.log("create order workflow hooks error => ", error);
//   }
// });

const SyncVaryStep = createStep(
  "sync-vary-step",
  async ({ order }, { container }) => {
    try {
      const syncService: SyncService = container.resolve(SYNC_MODULE);

      const result = await syncService.syncOrderToVary(order);
      return new StepResponse(result, null);
    } catch (error) {
      return new StepResponse(null, error);
    }
  }
);

createOrdersWorkflow.hooks.orderCreated(
  SyncVaryStep,
  async ({ result }, { container }) => {
    console.log(
      "createOrdersWorkflow compensation function output =================="
    );
    console.log(result);
  }
);
