import { defineRouteConfig } from "@medusajs/admin-sdk";
import { CircleThreeQuartersSolid } from "@medusajs/icons";
import {
  Container,
  Heading,
  Label,
  Switch,
  Input,
  Select,
  Table,
  Toaster,
  Button,
  Skeleton,
} from "@medusajs/ui";
import { VarySyncLog } from "../../../types";
import { useEffect, useState } from "react";
import { useConfiguration } from "../../hooks/api/vary";

const fakeData: VarySyncLog[] = [];

interface VarySyncFormData {
  active: boolean;
  trigger_duration: number;
  trigger_unit: string;
}

const VarySync = () => {
  const [loading, setLoading] = useState(false);

  const { data, isLoading } = useConfiguration();

  const configuration = (data as any)?.configuration;

  const [formData, setFormData] = useState<VarySyncFormData | null>(null);

  useEffect(() => {
    if (configuration) {
      setFormData({
        active: configuration.active,
        trigger_duration: configuration.trigger_duration,
        trigger_unit: configuration.trigger_unit,
      });
    }
  }, [configuration]);

  const handleSyncConfig = async () => {
    setLoading(true);
    try {
      const response = await fetch("/admin/vary/configuration", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          active: formData?.active,
          trigger_duration: formData?.trigger_duration,
          trigger_unit: formData?.trigger_unit,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Something went wrong");
      }
    } catch (error) {
      console.log(error);
      return error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="flex flex-row w-full gap-4">
        {/* Logs Section */}
        <Container className="flex flex-col w-[80%] p-6 overflow-hidden">
          <Heading className="pb-4 font-sans font-medium text-lg">Logs</Heading>
          <Table>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>S/No.</Table.HeaderCell>
                <Table.HeaderCell>Start Time</Table.HeaderCell>
                <Table.HeaderCell>End Time</Table.HeaderCell>
                <Table.HeaderCell>Modified Count</Table.HeaderCell>
                <Table.HeaderCell>Count On Vary</Table.HeaderCell>
                <Table.HeaderCell>Count On Medusa</Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {fakeData.map((logs) => {
                return (
                  <Table.Row
                    key={logs.id}
                    className="[&_td:last-child]:w-[1%] [&_td:last-child]:whitespace-nowrap"
                  >
                    <Table.Cell>{logs.id}</Table.Cell>
                    <Table.Cell>{logs.start_time.toLocaleString()}</Table.Cell>
                    <Table.Cell>{logs.end_time.toLocaleString()}</Table.Cell>
                  </Table.Row>
                );
              })}
            </Table.Body>
          </Table>
        </Container>

        {/* Configuration Section */}
        <Container className="flex flex-col w-[20%] p-6 overflow-hidden">
          <Heading className="pb-4 font-sans font-medium text-lg">
            Configurations
          </Heading>

          {/* Enable/Disable Toggle */}
          <div className="mb-4 flex justify-between w-full">
            <Label className="mb-2">Enable Sync</Label>
            {isLoading || !formData ? (
              <Skeleton className="h-6 w-12 rounded" />
            ) : (
              <Switch
                checked={formData.active}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, active: checked })
                }
                disabled={loading}
              />
            )}
          </div>

          {/* Trigger Duration Input */}
          <div className="space-y-2 mb-4">
            <Label className="mb-2">Trigger Duration</Label>
            {isLoading || !formData ? (
              <Skeleton className="h-10 w-full rounded" />
            ) : (
              <Input
                type="number"
                placeholder="Enter duration"
                value={formData.trigger_duration}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    trigger_duration: Number(e.target.value),
                  })
                }
                disabled={loading || !formData.active}
              />
            )}
          </div>

          {/* Trigger Unit Dropdown */}
          <div className="w-full mb-4">
            {isLoading || !formData ? (
              <Skeleton className="h-10 w-full rounded" />
            ) : (
              <Select
                value={formData.trigger_unit}
                onValueChange={(value) =>
                  setFormData({ ...formData, trigger_unit: value })
                }
                disabled={!formData.active || loading}
              >
                <Select.Trigger>
                  <Select.Value placeholder="Select a unit" />
                </Select.Trigger>
                <Select.Content>
                  {triggerUnits.map((item) => (
                    <Select.Item key={item.value} value={item.value}>
                      {item.label}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select>
            )}
          </div>
          {/* Trigger config Save Button */}
          <div className="w-full flex justify-center">
            {isLoading || !formData ? (
              <Skeleton className="h-10 w-3/4 rounded" />
            ) : (
              <Button
                variant="primary"
                className="w-3/4"
                onClick={handleSyncConfig}
                disabled={loading}
              >
                {loading ? "Saving..." : "Save"}
              </Button>
            )}
          </div>
        </Container>
      </div>
      <Toaster />
    </>
  );
};

export const config = defineRouteConfig({
  label: "Vary Sync",
  icon: CircleThreeQuartersSolid,
});

export default VarySync;

const triggerUnits = [
  {
    value: "second",
    label: "Second",
  },
  {
    value: "minute",
    label: "Minute",
  },
  {
    value: "hour",
    label: "Hour",
  },
  {
    value: "day",
    label: "Day",
  },
  {
    value: "month",
    label: "Month",
  },
  {
    value: "year",
    label: "Year",
  },
];
