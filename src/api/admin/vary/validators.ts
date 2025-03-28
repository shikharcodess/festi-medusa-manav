import {
  createFindParams,
  createOperatorMap,
} from "@medusajs/medusa/api/utils/validators";
import z from "zod";

export type AdminGetVaryLogsParamsType = z.infer<typeof AdminGetVaryLogsParams>;
export const AdminGetVaryLogsParams = createFindParams({
  limit: 15,
  offset: 0,
})
  .merge(
    z.object({
      q: z.string().optional(),
      id: z
        .union([z.string(), z.array(z.string()), createOperatorMap()])
        .optional(),
    })
  )
  .strict();
