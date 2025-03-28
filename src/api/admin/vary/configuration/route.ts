import { MedusaRequest, MedusaResponse } from "@medusajs/framework";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import { AdminGetVaryLogsParamsType } from "../validators";
import { VARY_MODULES } from "src/modules/vary";
import VaryService from "src/modules/vary/service";

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

export const PATCH = async (req: MedusaRequest, res: MedusaResponse) => {
  const s = req.body as { active?: boolean; trigger_unit?: string };
  const varyService: VaryService = req.scope.resolve(VARY_MODULES);
  const updateBody: any = {};

  const configuration = await varyService.updateVarySyncConfigurations({
    id: "1",
    ...updateBody,
  });
  res.json({ configuration });
};
