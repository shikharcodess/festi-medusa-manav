import { Module } from "@medusajs/framework/utils";
import VaryService from "./service";

export const VARY_MODULES = "varyService";

export default Module(VARY_MODULES, {
  service: VaryService,
});
