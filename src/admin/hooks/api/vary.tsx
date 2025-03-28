import { VarySyncConfiguration } from "../../../types";
import { sdk } from "../../lib/client";
import { useQuery } from "@tanstack/react-query";

export const useConfiguration = () => {
  const fetchedConfiguration = async () =>
    sdk.client.fetch<VarySyncConfiguration>(`/admin/vary/configuration`, {
      method: "GET",
    });

  return useQuery({
    queryKey: [],
    queryFn: fetchedConfiguration,
  });
};
