import { MedusaRequest, MedusaResponse } from "@medusajs/framework";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import { AdminGetVaryLogsParamsType } from "../validators";
import { VARY_MODULES } from "../../../../modules/vary";
import VaryService from "../../../../modules/vary/service";

export const GET = async (
  req: MedusaRequest<AdminGetVaryLogsParamsType>,
  res: MedusaResponse
) => {
  const varyService: VaryService = req.scope.resolve(VARY_MODULES);
  const configuration = await varyService.getVarySyncConfiguration();
  res.json({ configuration });
};

export const PATCH = async (req: MedusaRequest, res: MedusaResponse) => {
  const s = req.body as {
    active?: boolean;
    trigger_duration?: number;
    trigger_unit?: string;
  };
  const varyService: VaryService = req.scope.resolve(VARY_MODULES);

  if (
    s.active === undefined ||
    s.trigger_duration === undefined ||
    !s.trigger_unit
  ) {
    return res.status(400).json({
      message:
        "Missing required fields: active, trigger_duration, trigger_unit",
    });
  }

  const updateBody: any = {
    active: s.active,
    trigger_duration: s.trigger_duration,
    trigger_unit: s.trigger_unit,
  };

  const configuration = await varyService.updateVarySyncConfigurations({
    id: "1",
    ...updateBody,
  });
  res.json({ configuration });
};
