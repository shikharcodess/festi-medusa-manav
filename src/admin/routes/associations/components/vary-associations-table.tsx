import { useEffect, useMemo, useState } from "react";
import {
  createDataTableColumnHelper,
  useDataTable,
  DataTable,
  Heading,
  Container,
  DataTablePaginationState,
} from "@medusajs/ui";

import { useNavigate } from "react-router-dom";

interface AssociationDataType {
  id: string;
  name: string;
}

const columnHelper = createDataTableColumnHelper<AssociationDataType>();


const VaryAssociationsTable = ({paginationConfig}: {paginationConfig?: {pageSize: number, pageIndex: number}}) => {
  
  const [loading, setLoading] = useState(false);
  const [associations, setAssociations] = useState<AssociationDataType[]>([]);
  const navigate = useNavigate();

  const [pagination, setPagination] = useState<DataTablePaginationState>({
    pageSize: paginationConfig?.pageSize ?? 10,
    pageIndex: paginationConfig?.pageIndex ?? 0,
  });

  const columns = [
    columnHelper.display({
      id: "serial_no",
      header: "S/No.",
      cell: ({ row }) => row.index + 1 + pagination.pageIndex * pagination.pageSize, 
    }),
    columnHelper.accessor("name", { header: "Association Name" })
  ];

  useEffect(() => {
    const fetchAssociations = async () => {
      setLoading(true);
      try {
        const response = await fetch('/admin/vary/associations', {
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
      } finally {
        setLoading(false);
      }
    };

    fetchAssociations();
  }, []);

  const shownData = useMemo(() => {
    return associations.slice(
      pagination.pageIndex * pagination.pageSize,
      (pagination.pageIndex + 1) * pagination.pageSize
    );
  }, [pagination, associations]); 

  const table = useDataTable({
    columns,
    data: shownData,
    getRowId: (row) => row.id,
    rowCount: associations.length, // Use actual data length
    isLoading: loading,
    pagination: { state: pagination, onPaginationChange: setPagination },
    onRowClick: (event, row) => {
      navigate('/associations/' + row.id);
    }
  });

  return (
    <Container className="flex flex-col w-full p-6">
      <Heading>Vary Associations</Heading>
      <DataTable instance={table}>
        <DataTable.Table />
        <DataTable.Pagination />
      </DataTable>
    </Container>
  );
};

export default VaryAssociationsTable;
