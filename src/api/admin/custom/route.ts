import { MedusaRequest, MedusaResponse } from "@medusajs/framework";
// import SyncService from "src/modules/sync-service/service";

// const syncService = new SyncService({});

// interface SyncRequestBody {
//   action: "syncProducts" | "syncOrders" | "syncCustomers";
// }

// export async function POST(
//   req: MedusaRequest,
//   res: MedusaResponse
// ): Promise<void> {
//   try {
//     // Determine action based on route or request body
//     const { action } = req.body as SyncRequestBody;

//     if (!action) {
//       res
//         .status(400)
//         .json({ error: "Action is required in the request body." });
//     }

//     if (action === "syncProducts") {
//       const data = await syncService.syncProducts();
//       res.status(200).json({ data });
//     } else if (action === "syncOrders") {
//       const message = await syncService.syncOrders();
//       res.status(200).json({ message });
//     } else if (action === "syncCustomers") {
//       const message = await syncService.syncCustomers();
//       res.status(200).json({ message });
//     } else {
//       res.status(400).json({ error: "Invalid action specified." });
//     }
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// }

export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  res.json({
    message: "[GET] Hello world!",
  });
}
