import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { Container, Heading } from "@medusajs/ui"
import { SectionRow } from "./components/section-row"
import { useEffect, useState } from "react"

// The widget
const ProductAssociationWidget = () => {

  const [associations, setAssociations] = useState<any>([])

  const productId = window.location.pathname.split("/").pop();

  useEffect(() => {
    const fetchAssociations = async () => {
      try {
        const response = await fetch(`/admin/vary/associations`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const jsonResponse = await response.json();

        if (!jsonResponse.associations) {
          throw new Error("Invalid data format: Missing 'associations' field");
        }

        setAssociations(
          jsonResponse.associations.map((assoc: any) => ({
            id: assoc.id,
            name: assoc.name,
          }))
        );

      } catch (error) {
        console.error("Error fetching associations:", error);
      }
    };

    fetchAssociations();
  }, []);

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <Heading level="h2">Associations</Heading>
      </div>
      {
        associations.map((assoc: any, index: number) => (
          <SectionRow title={assoc.name} id={assoc.id} key={index} value={index + 1} />
        ))
      }
    </Container>
  )
}

// The widget's configurations
export const config = defineWidgetConfig({
  zone: "product.details.side.after",
})

export default ProductAssociationWidget