import { defineRouteConfig } from "@medusajs/admin-sdk";
import { Link } from "@medusajs/icons";
import { Container, Heading, Toaster } from "@medusajs/ui";
import VaryAssociationsTable from "./components/vary-associations-table";

const VaryAssociations = () => {
  return (
    <>
      <div className="m-4">
        <Container className="flex flex-col w-full p-6 overflow-hidden">
          <Heading className="pb-4 font-sans font-medium text-lg">
            Associations
          </Heading>
          <VaryAssociationsTable />
        </Container>
        <Toaster />
      </div>
    </>
  );
};

export const config = defineRouteConfig({
  label: "Associations",
  icon: Link,
});

export default VaryAssociations;
