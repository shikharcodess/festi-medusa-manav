import { Container, Heading, Button, Text } from "@medusajs/ui";
import { useEffect, useState } from "react";
import { defineRouteConfig } from "@medusajs/admin-sdk";
import { CircleStack } from "@medusajs/icons";

const BrandsPage = () => {
  const [progress, setProgress] = useState("Not started");
  const [error, setError] = useState<string | null>(null);

  const handleSyncClick = async () => {
    try {
      setProgress("Starting product sync...");
      var response = await fetch("/sync", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "syncProducts", // specify the action type here
        }),
      });

      const result = await response.json();
      if (response.status == 200) {
        setProgress(
          "Products Sync complete, " +
            result.message.Items.length +
            " items synced"
        );
      } else {
        setProgress("Products Sync info: " + result.error);
      }

      setProgress("Products synced. Syncing orders...");

      var response2 = await fetch("/sync", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "syncOrders", // specify the action type here
        }),
      });
      const result2 = await response2.json();
      if (response2.status == 200) {
        setProgress("orders Sync complete, 1" + result2.message);
      } else {
        setProgress("orders Sync info: " + result2.error);
      }
    } catch (error) {
      if (error instanceof Error) {
        setError("Sync failed: " + error.message);
      } else {
        setError("Sync failed due to an unknown error.");
      }
    }
  };

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <Heading level="h2">Sync</Heading>
      </div>
      <div className="flex h-full flex-col overflow-hidden !border-t-0 px-6 py-4">
        <Button onClick={handleSyncClick}>Start Sync</Button>
        {error ? <Text color="red">{error}</Text> : <Text>{progress}</Text>}
      </div>
    </Container>
  );
};

export default BrandsPage;

export const config = defineRouteConfig({
  label: "Sync",
  icon: CircleStack,
});
