import { MedusaRequest, MedusaResponse } from "@medusajs/framework";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import { AdminGetVaryLogsParamsType } from "../validators";

export const GET = async (
  req: MedusaRequest<AdminGetVaryLogsParamsType>,
  res: MedusaResponse
) => {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);

  const { fields, pagination } = req.queryConfig;
  const { data: logs, metadata } = await query.graph({
    entity: "vary_sync_logs",
    fields,
    pagination: {
      ...pagination,
      skip: pagination.skip!,
    },
  });

  res.json({
    logs,
    count: metadata!.count,
    offset: metadata!.skip,
    limit: metadata!.take,
  });
};
