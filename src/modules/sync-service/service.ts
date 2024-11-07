import { MedusaService, Modules, ProductStatus } from "@medusajs/framework/utils";
import {
  IProductModuleService,
  CreateProductDTO,
} from "@medusajs/framework/types";
import { container } from "@medusajs/framework";
const BASE_URL = "http://festi.vary.rent:1331/test/1/";

interface VaryItem {
  idItem: number;
  sItemCode: string;
  sDescr_1: string;
  sModel: string;
  tabOptions?: Array<{ sOptionCode: string; sValue: string }>;
  StkInfo?: { Items: Array<{ rQuantity: number }> };
  tabSalePrice?: Array<{ nPrice: number }>;
  [key: string]: any; // For non-standard fields
}

interface VaryOrder {
  orderId: string;
  items: Array<{ productId: string; quantity: number }>;
  customerInfo: { name: string; email: string };
}

class SyncService extends MedusaService({}) {
  private varyToken: string;
  constructor(container) {
    super(container);
    this.varyToken = "";
  }
  async syncProducts(): Promise<string> {
    // Request token and fetch items from the source API
    const token = await this.requestToken();
    const response = await fetch(`${BASE_URL}/item`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) throw new Error("Failed to sync products");

    const data = await response.json();
    const items: VaryItem[] = data.Items;

    // Initialize productService and container (assuming Medusa's container setup)
    const productService = container.resolve(Modules.PRODUCT);

    for (const item of items) {
        // Check if product already exists in Medusa by unique identifier (sItemCode or idItem)
        
        const existingProduct = await productService.listProducts(
          { handle: this.createSlugFromItemCode(item.sItemCode) },
          { take: 1 } // Limit to 1 result for efficiency
      );

        if (existingProduct.length > 0) {
            console.log(`Product with code ${item.sItemCode} already exists, skipping creation.`);
            continue; // Skip to the next item
        }

        // Prepare product metadata for custom fields
        const metadata = {
            idBrand: item.idBrand,
            sDescr_1: item.sDescr_1,
            sFolderCode: item.sFolderCode,
            sMasterItemCode: item.sMasterItemCode,
            bHided: item.bHided,
            bBlocked: item.bBlocked,
            nLevel: item.nLevel,
            nLength: item.nLength,
            nWidth: item.nWidth,
            nHeight: item.nHeight,
            nWeight: item.nWeight,
            nThickness: item.nThickness,
            nCapacity: item.nCapacity,
            nDiameter: item.nDiameter,
            bRentOnly: item.bRentOnly,
            bSaleOnly: item.bSaleOnly,
            sPackages: item.sPackages,
            ...item.tabRentalPrice ? { tabRentalPrice: item.tabRentalPrice } : {},
            ...item.tabSalePrice ? { tabSalePrice: item.tabSalePrice } : {}
        };

        // Prepare the product with necessary fields
        const newProduct = {
            title: item.sDescr_1 || "Default Title",
            handle: this.createSlugFromItemCode(item.sItemCode),
            description: item.sDescrFull_1 || "",
            // status: ProductStatus.PUBLISHED,
            is_giftcard: false,
            metadata: metadata,
            // options: [
            //     {
            //         title: "Default Option",
            //     },
            // ],
            variants: [
                {
                    title: item.sDescr_1 || "Default Variant",
                    // inventory_quantity: 100, // Default quantity, adjust as needed
                    // options: [
                    //     {
                    //         value: "Default", // Default variant value
                    //     },
                    // ],
                    // prices: [
                    //     {
                    //         amount: item.tabSalePrice?.[0]?.nPrice || 0,
                    //         currency_code: "usd" // Replace with the correct currency if needed
                    //     }
                    // ],
                },
            ],
        };

        // Create the product with a variant in Medusa
        await productService.createProducts([newProduct]);
        console.log(`Product ${item.sItemCode} created with variant.`);
    }

    return `${items.length} Products and variants synced successfully.`;
}

async createOrder(): Promise<string> {
  // Initialize required Medusa services
  const productService = container.resolve(Modules.PRODUCT);
  const orderService = container.resolve(Modules.ORDER);
  const customerService = container.resolve(Modules.CUSTOMER);

  // Step 1: Fetch products and select a random one
  const products = await productService.listProducts({}, { take: 10 }); // Fetches up to 10 products
  if (products.length === 0) throw new Error("No products available to create an order.");

  const randomProduct = products[Math.floor(Math.random() * products.length)];
  const randomVariant = randomProduct.variants[0]; // Assume the first variant is used

  // Step 2: Create a dummy customer
  const customerData = {
      email: "dummy@example.com",
      first_name: "John",
      last_name: "Doe",
      password: "password123" // Password required for customer creation
  };

  let customer;
  try {
      customer = await customerService.createCustomers([customerData]);
  } catch (error) {
      console.error("Failed to create customer:", error);
      throw new Error("Customer creation failed.");
  }

  // Step 3: Prepare line items using the random product
  const lineItems = [
      {
          title: randomProduct.title,
          unit_price: 0, // Use the first price from variant prices
          quantity: 1,
          variant_id: randomVariant.id,
      }
  ];

  // Step 4: Create the order with the selected product, dummy customer, and order details
  const orderData = {
      currency_code: "usd",
      email: customer.email,
      customer_id: customer.id,
      items: lineItems,
      shipping_address: {
          first_name: "John",
          last_name: "Doe",
          address_1: "123 Dummy St",
          city: "Dummville",
          country_code: "US",
          postal_code: "12345",
          phone: "555-555-5555"
      },
      billing_address: {
          first_name: "John",
          last_name: "Doe",
          address_1: "123 Dummy St",
          city: "Dummville",
          country_code: "US",
          postal_code: "12345",
          phone: "555-555-5555"
      },
      shipping_methods: [
          {
              shipping_option_id: "your-shipping-option-id", // Replace with actual shipping option ID
              name: "Standard Shipping",
              amount: 500 // Adjust this amount as needed
          }
      ],
      payment_method: {
          provider_id: "stripe", // Specify your payment provider
          data: {}
      }
  };

  const order = await orderService.createOrders([orderData]);

  console.log("Order created with ID:", order[0].id);
  return `Order created successfully with ID: ${order[0].id}`;
}


  private async requestToken(): Promise<string> {
    const payload = {
      user: "maastery-test",
      password: "v6JU6FgF4ap43b"
    };

    const response = await fetch(`${BASE_URL}/auth/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Error response:", errorText);
      throw new Error("Failed to fetch token: " + errorText);
    }
    const data = await response.json();
    console.log("dataa", data);
    this.varyToken = data.Token;
    return data.Token;
  }

  createSlugFromItemCode(sItemCode: string): string {
    // Step 1: Convert to lowercase
    let slug = sItemCode.toLowerCase();

    // Step 2: Replace spaces with hyphens
    slug = slug.replace(/\s+/g, '-');

    // Step 3: Remove any non-alphanumeric characters except hyphens
    slug = slug.replace(/[^a-z0-9-]/g, '');

    // Step 4: Trim hyphens from the beginning and end
    slug = slug.replace(/^-+|-+$/g, '');

    // Fallback if the slug is empty
    return slug || `item-${Date.now()}`; // Generate a unique slug if needed
  }
}
export default SyncService;
