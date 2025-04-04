import { useParams } from "react-router-dom";
import { Container, Heading } from "@medusajs/ui";
import { useEffect, useState } from "react";
import { Row } from "../components/Row";
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
  sales_channels: { id: string; name: string }[];
  variants: { id: string }[];
  status: string;
}

const dummyData: AssociationDataType = {
  id: "1",
  name: "Vary Association 1",
  created_at: "2023-03-01T00:00:00.000Z",
  updated_at: "2023-03-01T00:00:00.000Z",
  products: [
    {
      id: "101",
      title: "Product A",
      categories: [
        { id: "c1", name: "Category 1" },
        { id: "c2", name: "Category 2" },
      ],
      collection: { id: "col1", title: "Summer Collection" },
      sales_channels: [
        { id: "sc1", name: "Online Store" },
        { id: "sc2", name: "Retail Outlet" },
      ],
      variants: [{ id: "v1" }, { id: "v2" }],
      status: "active",
    },
    {
      id: "102",
      title: "Product B",
      categories: [{ id: "c3", name: "Category 3" }],
      collection: { id: "col2", title: "Winter Collection" },
      sales_channels: [{ id: "sc3", name: "Wholesale" }],
      variants: [{ id: "v3" }],
      status: "inactive",
    },
  ],
};

const CustomPage = () => {
  const { id } = useParams();
  const [association, setAssociation] = useState<AssociationDataType | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchAssociations = async () => {
      setLoading(true);
      try {
        setAssociation(dummyData);
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
          <div>{association?.name}</div>
          <Dropdown/>
        </Heading>
        {loading ? (
          <p className="text-gray-500">Loading...</p>
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
          <ProductsTable/>
      </Container>
    </div>
  );
};

export default CustomPage;
