import { MedusaRequest, MedusaResponse } from "@medusajs/framework";
import { IProductModuleService } from "@medusajs/framework/types";
import { Modules } from "@medusajs/framework/utils";
import { SYNC_MODULE } from "src/modules/sync-service";
import SyncService from "src/modules/sync-service/service";

interface SyncRequestBody {
  action: "syncProducts" | "syncOrders" | "syncCustomers";
}

export async function POST(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  try {
    // Determine action based on route or request body
    const { action } = req.body as SyncRequestBody;

    const syncService: SyncService = req.scope.resolve(SYNC_MODULE);

    // const syncService = new SyncService({});

    if (!action) {
      res
        .status(400)
        .json({ error: "Action is required in the request body." });
    }

    if (action === "syncProducts") {
      const message = await syncService.syncProducts();
      res.status(200).json({ message });
    } else if (action === "syncOrders") {
      const message = await syncService.createAndSyncOrder();
      res.status(200).json({ message });
    } else {
      res.status(400).json({ error: "Invalid action specified." });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const productModuleService: IProductModuleService = req.scope.resolve(
    Modules.PRODUCT
  );

  const [, count] = await productModuleService.listAndCountProducts();

  res.json({
    count,
  });
};
