import { useEffect, useState } from "react";
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
  collection: { id: string; title: string } | null;
  sales_channels: { id: string; name: string }[];
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

const dummyData: AssociationDataType = {
  id: "1",
  name: "Vary Association 1",
  created_at: "2023-03-01T00:00:00.000Z",
  updated_at: "2023-03-01T00:00:00.000Z",
  products: [
    {
      id: "prod_01JQBT9RQGZ75K4BPGV67VE9KY",
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
      id: "prod_01JQBTAA85NDC50VH27BYQEPZ8",
      title: "Product B",
      categories: [{ id: "c3", name: "Category 3" }],
      collection: { id: "col2", title: "Winter Collection" },
      sales_channels: [{ id: "sc3", name: "Wholesale" }],
      variants: [{ id: "v3" }],
      status: "inactive",
    },
  ],
};

const columnHelper = createDataTableColumnHelper<ProductDataType>();

const ProductsTable = ({
  paginationConfig = { pageSize: 10, pageIndex: 0 },
}: { paginationConfig?: { pageSize: number; pageIndex: number } }) => {
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<ProductDataType[]>([]);
  const navigate = useNavigate();

  const [pagination, setPagination] = useState<DataTablePaginationState>({
    pageSize: paginationConfig.pageSize,
    pageIndex: paginationConfig.pageIndex,
  });

  const columns = [
    columnHelper.display({
      id: "serial_no",
      header: "S/No.",
      cell: ({ row }) => row.index + 1 + pagination.pageIndex * pagination.pageSize,
    }),
    columnHelper.accessor("title", { header: "Product Title" }),
    columnHelper.accessor("categories", {
      header: "Categories",
      cell: ({ getValue }) => getValue().map((cat) => cat.name).join(", "),
    }),
    columnHelper.accessor("collection", {
      header: "Collection",
      cell: ({ getValue }) => (getValue() ? getValue()?.title : "N/A"),
    }),
    columnHelper.accessor("sales_channels", {
      header: "Sales Channels",
      cell: ({ getValue }) => getValue().map((sc) => sc.name).join(", "),
    }),
    columnHelper.accessor("variants", {
      header: "Variants",
      cell: ({ getValue }) => getValue().length,
    }),
    columnHelper.accessor("status", { header: "Status" }),
  ];

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        // const response = await fetch("/admin/products", {
        //   method: "GET",
        //   headers: { "Content-Type": "application/json" },
        // });

        // if (!response.ok) {
        //   throw new Error(`HTTP error! Status: ${response.status}`);
        // }

        // const jsonResponse = await response.json();

        // if (!jsonResponse.products) {
        //   throw new Error("Invalid data format: Missing 'products' field");
        // }

        // setProducts(jsonResponse.products);

        setProducts(dummyData.products);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const table = useDataTable({
    columns,
    data: products,
    getRowId: (row) => row.id,
    rowCount: products.length,
    isLoading: loading,
    pagination: { state: pagination, onPaginationChange: setPagination },
    onRowClick: (event, row) => {
      navigate(`/products/${row.id}`);
    },
  });

  return (
    <Container className="flex flex-col w-full p-6">
      <Heading className="mb-4">Product Listings</Heading>
      <DataTable instance={table}>
        <DataTable.Table />
        <DataTable.Pagination />
      </DataTable>
    </Container>
  );
};

export default ProductsTable;
