import { useParams } from "react-router-dom";
import { Container, Heading } from "@medusajs/ui";
import { useEffect, useState } from "react";
import { Row } from "./components/Row";
import {Dropdown} from "./components/Dropdown";
import ProductsTable from "./components/productTable";

interface AssociationDataType {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
  products: ProductDataType[];
}

interface ProductDataType {
  id: string;
  title: string;
  categories: { id: string; name: string }[];
  collection: { id: string; title: string };
  sales_channels?: { id: string; name: string }[];
  variants: { id: string }[];
  status: string;
}


const CustomPage = () => {
  const { id } = useParams();
  const [association, setAssociation] = useState<AssociationDataType | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchAssociations = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/admin/vary/associations/${id}`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const jsonResponse = await response.json();

        if (!jsonResponse.association) {
          throw new Error("Invalid data format: Missing 'association' field");
        }

        const newData = jsonResponse.association.map((data: AssociationDataType) => (
          {
            created_at: data.created_at,
            id: data.id,
            name: data.name,
            updated_at: data.updated_at,
            products: data.products.map((product: ProductDataType) => ({
              id: product.id,
              title: product.title,
              categories: product.categories.map((category: { id: string; name: string; }) => ({
                id: category.id,
                name: category.name,
              })),
              collection: product.collection,
              variants: product.variants.map((variant: { id: string; }) => ({
                id: variant.id,
              })),
              status: product.status,
            })),
          }
        ))
        setAssociation(newData[0]);
      } catch (error) {
        console.error("Error fetching association:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAssociations();
  }, [id]);

  return (
    <div className="flex flex-col w-full gap-6">
      <Container className="p-6 bg-ui-bg-base shadow-md rounded-lg">
        <Heading className="text-xl font-semibold mb-4 border-b-[1px] border-slate-700 pb-4 flex justify-between">
          <div>{association?.name || "Association Name"}</div>
          <Dropdown/>
        </Heading>
        {loading ? (
          <div className="grid grid-cols-2 gap-6">
            {[...Array(3)].map((_, index) => (
              <div
                key={index}
                className="animate-pulse bg-ui-bg-subtle rounded-md px-6 py-4 space-y-2"
              >
                <div className="h-4 w-24 bg-ui-bg-hover rounded" />
                <div className="h-4 w-48 bg-ui-bg-hover rounded" />
              </div>
            ))}
          </div>
        ) : association ? (
          <div className="grid grid-cols-2 gap-6">
            <Row title="ID" id="" value={association.id} />
            <Row title="Created At" id="" value={association.created_at} />
            <Row title="Updated At" id="" value={association.updated_at} />
          </div>
        ) : (
          <p className="text-red-500">No association found.</p>
        )}
      </Container>

      <Container className="p-6 bg-ui-bg-base shadow-md rounded-lg">
        <Heading className="text-xl font-semibold mb-4">Association Products</Heading>
          <ProductsTable association={association}/>
      </Container>
    </div>
  );
};

export default CustomPage;
