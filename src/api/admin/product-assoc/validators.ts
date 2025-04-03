import z from "zod";
import {
  createFindParams,
  createOperatorMap,
} from "@medusajs/medusa/api/utils/validators";

export type AdminGetProductAssocType = z.infer<typeof AdminGetProductAssoc>;

export const AdminGetProductAssoc = createFindParams()
  .merge(z.object({}))
  .strict();

export type AdminUpdateProductAssocType = z.infer<
  typeof AdminUpdateProductAssoc
>;
export const AdminUpdateProductAssoc = z.object({
  name: z.string(),
  rank: z.number(),
});
