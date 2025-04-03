import { useParams } from "react-router-dom";
import { Container, Heading } from "@medusajs/ui";
import { useEffect, useState } from "react";
import {Row} from '../components/Row'

interface AssociationDataType {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

const dummyData = {
    id: "1",
    name: "Vary Association 1",
    created_at: "2023-03-01T00:00:00.000Z",
    updated_at: "2023-03-01T00:00:00.000Z",
  }

const CustomPage = () => {
  const { id } = useParams();

  const [association, setAssociation] = useState<AssociationDataType | null>(null);
  const [loading, setLoading] = useState(false);

  
  useEffect(() => {
    const fetchAssociations = async () => {
      setLoading(true);
      try {
        // const response = await fetch(`/admin/vary/associations/${id}`, {
        //   method: "GET",
        //   headers: { "Content-Type": "application/json" },
        // });

        // if (!response.ok) {
        //   throw new Error(`HTTP error! Status: ${response.status}`);
        // }

        // const jsonResponse = await response.json();

        // if (!jsonResponse.association) {
        //   throw new Error("Invalid data format: Missing 'association' field");
        // }

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
      {/* First Container - Association Details */}
    <Container className="p-6 bg-ui-bg-base shadow-md rounded-lg">
    <Heading className="text-xl font-semibold mb-4 border-b-[1px] border-slate-700 pb-4">{association?.name}</Heading>
    {loading ? (
      <p className="text-gray-500">Loading...</p>
    ) : association ? (
      <div className="grid grid-cols-2 gap-6 divide-x">
        <Row title={"Description"} id="" value={association.id}/>
        <Row title={"Created At"} id="" value={association.created_at}/>
        <Row title={"Updated At"} id="" value={association.updated_at} />
      </div>
    ) : (
      <p className="text-red-500">No association found.</p>
    )}
  </Container>

      <Container className="p-4 bg-ui-bg-base shadow-md rounded-lg">
        <Heading>Associated Products</Heading>
        {/* <div>
          {association && (association?.products.map((product: any) => (
            <Row title={product.title} id={product.id} value={product.id} />
          )))}
        </div> */}
      </Container>
    </div>
  );
};

export default CustomPage;
