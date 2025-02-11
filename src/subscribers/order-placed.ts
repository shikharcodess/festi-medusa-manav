import { SubscriberArgs, type SubscriberConfig } from "@medusajs/framework";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import { SYNC_MODULE } from "../modules/sync-service";
import SyncService from "../modules/sync-service/service";

console.log("loading orderPlacedHandler subscriber");

export default async function orderPlacedHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  // console.log("orderPlacedHandler data => ", data);

  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  // logger.info(`data: ${data}`);

  const syncService: SyncService = container.resolve(SYNC_MODULE);
  const result = await syncService.syncOrderToVary(data.id);

  console.log("result: ", result);
}

export const config: SubscriberConfig = {
  event: "order.placed",
};
