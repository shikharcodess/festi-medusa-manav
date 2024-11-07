import SyncService from "./service";
import { Module } from "@medusajs/framework/utils";

export const SYNC_MODULE = "syncModuleService";

export default Module(SYNC_MODULE, {
  service: SyncService,
});
