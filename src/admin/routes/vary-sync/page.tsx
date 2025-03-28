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
} from "@medusajs/ui";
import { VarySyncLog } from "../../../types";

const fakeData: VarySyncLog[] = [];

const VarySync = () => {
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
          <div className="mb-4">
            <Label className="mb-2">Enable Sync</Label>
            <Switch />
          </div>

          {/* Trigger Duration Input */}
          <div className="mb-4">
            <Label className="mb-2">Trigger Duration</Label>
            <Input type="number" placeholder="Enter duration" />
          </div>

          {/* Trigger Unit Dropdown */}
          <div className="w-[256px]">
            <Select>
              <Select.Trigger>
                <Select.Value placeholder="Select a currency" />
              </Select.Trigger>
              <Select.Content>
                {triggerUnits.map((item) => (
                  <Select.Item key={item.value} value={item.value}>
                    {item.label}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select>
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
