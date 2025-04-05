"use client"
import { useMemo, useState } from "react";
import {
  createDataTableColumnHelper,
  useDataTable,
  DataTable,
  Heading,
  Container,
  DataTablePaginationState,
} from "@medusajs/ui";
import { useNavigate } from "react-router-dom";

interface ProductDataType {
  id: string;
  title: string;
  categories: { id: string; name: string }[];
  collection?: { id: string; title: string } | null;
  sales_channels?: { id: string; name: string }[];
  variants: { id: string }[];
  status: string;
}

interface AssociationDataType {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
  products: ProductDataType[];
}

const columnHelper = createDataTableColumnHelper<ProductDataType>();

const ProductsTable = ({
  paginationConfig = { pageSize: 10, pageIndex: 0 },
  association,
}: {
  paginationConfig?: { pageSize: number; pageIndex: number };
  association: AssociationDataType | null;
}) => {
  const navigate = useNavigate();

  const [pagination, setPagination] = useState<DataTablePaginationState>({
    pageSize: paginationConfig.pageSize,
    pageIndex: paginationConfig.pageIndex,
  });

  const columns = useMemo(
    () => [
      columnHelper.display({
        id: "serial_no",
        header: "S/No.",
        cell: ({ row }) =>
          row.index + 1 + pagination.pageIndex * pagination.pageSize,
      }),
      columnHelper.accessor("title", { header: "Product Title" }),
      columnHelper.accessor("categories", {
        header: "Categories",
        cell: ({ getValue }) =>
          getValue().map((cat) => cat.name).join(", "),
      }),
      columnHelper.accessor("collection", {
        header: "Collection",
        cell: ({ getValue }) => getValue()?.title ?? "N/A",
      }),
      columnHelper.accessor("variants", {
        header: "Variants",
        cell: ({ getValue }) => getValue().length,
      }),
      columnHelper.accessor("status", { header: "Status" }),
    ],
    [pagination]
  );

  const products = useMemo(() => association?.products ?? [], [association]);

  const table = useDataTable({
    columns,
    data: products,
    getRowId: (row) => row.id,
    rowCount: products.length,
    pagination: { state: pagination, onPaginationChange: setPagination },
    onRowClick: (_, row) => navigate(`/products/${row.id}`),
  });

  return (
    <Container className="flex flex-col w-full p-6">
      <Heading className="mb-4">Product Listings</Heading>
 
      {!association ? (
        <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-12 bg-ui-bg-subtle animate-pulse rounded-md" />
        ))}
      </div>
      ) : products.length === 0 ? (
        <div className="text-sm text-gray-500">No association found.</div>
      ) : (
        <DataTable instance={table}>
          <DataTable.Table />
          <DataTable.Pagination />
        </DataTable>
      )}
    </Container>
  );
};

export default ProductsTable;
