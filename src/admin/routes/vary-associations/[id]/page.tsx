import { useParams } from "react-router-dom"
import { Container, createDataTableColumnHelper, DataTable, Heading, useDataTable } from "@medusajs/ui"
import { useEffect, useState } from "react";

interface AssociationDataType {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

const columnHelper = createDataTableColumnHelper<AssociationDataType>();

const CustomPage = () => {
  const { id } = useParams()

  const [association, setAssociation] = useState<AssociationDataType | null>(null);
  const [loading, setLoading] = useState(false);
  const columns = [
    columnHelper.display({
      id: "serial_no",
      header: "Rank",
      cell: ({ row }) => row.index + 1, 
    }),
    columnHelper.accessor("name", { header: "Association Name" }),
    columnHelper.accessor("created_at", { header: "Created At" }),
    columnHelper.accessor("updated_at", { header: "Updated At" })
  ];

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
  
          setAssociation(
            {
              id: jsonResponse.association.id,
              name: jsonResponse.association.name,
              created_at: jsonResponse.association.created_at,  
              updated_at: jsonResponse.association.updated_at,
            }
          );
  
        } catch (error) {
          console.error("Error fetching associations:", error);
        } finally {
          setLoading(false);
        }
      };
  
      fetchAssociations();
    }, [id]);

    const table = useDataTable({
      columns,
      data: association? [association] : [],
      rowCount: 1, 
      isLoading: loading
    });

  return (
    <div className="flex flex-col w-full p-6 gap-4">
      <Container className="divide-y p-0">
        <div className="flex items-center justify-between px-6 py-4">
          <Heading level="h1">{association? association.name : ""}</Heading>
        </div>
      </Container>
      <Container className="flex flex-col w-full p-6 gap-4">
        <Heading>{association? "association" : ""}</Heading>
        <DataTable instance={table}>
          <DataTable.Table />
        </DataTable>
      </Container>
    </div>
  )
}



export default CustomPage 