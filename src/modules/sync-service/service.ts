import { MedusaService, Modules } from "@medusajs/framework/utils";
import {
  IProductModuleService,
  CreateProductDTO,
} from "@medusajs/framework/types";
import { container } from "@medusajs/framework";
const BASE_URL = "https://virtserver.swaggerhub.com/Vary_srl/REST/v1.1";

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
    const token = await this.requestToken();
    const response = await fetch(`${BASE_URL}/item`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error("Failed to sync products");

    const data = await response.json();
    const items: VaryItem[] = data.Items;

    for (const item of items) {
      await this.createOrUpdateProductAndVariant(item);
    }
    return `${items.length} Products and variants synced successfully.`;
  }

  async syncOrders(): Promise<string> {
    if (!this.varyToken) await this.requestToken();
    const orderService_ = container.resolve(Modules.ORDER);
    const productService_ = container.resolve(Modules.PRODUCT);

    const lastProducts = await productService_.listProducts(
      {
        id: ["prod_01JBC4NQPDF8AV9AP3YJHJGNTZ"],
      },
      {
        relations: ["categories", "variants"],
      }
    );
    console.log("lastProducts", lastProducts);
    const orderItems = [
      {
        variant_id: lastProducts[0].variants[0].id,
        quantity: 1, // Default to 1 if no quantity specified
      },
    ];
    // const orderData = {
    //   customer_id: customer.id,
    //   email: customerData.email,
    //   items: orderItems,
    //   billing_address: {
    //     first_name: customerData.first_name,
    //     last_name: customerData.last_name,
    //     address_1: "123 Test Street",
    //     city: "Test City",
    //     country_code: "us",
    //     postal_code: "12345",
    //   },
    //   shipping_address: {
    //     first_name: customerData.first_name,
    //     last_name: customerData.last_name,
    //     address_1: "123 Test Street",
    //     city: "Test City",
    //     country_code: "us",
    //     postal_code: "12345",
    //   },
    // };
    const order = await orderService_.createOrders([
      {
        currency_code: "usd",
        items: [
          {
            variant_id: lastProducts[0].variants[0].id,
            title: lastProducts[0].variants[0].title,
            quantity: 1,
            unit_price: 20,
          },
        ],
        shipping_address: {
          first_name: "Sambit",
          last_name: "majhi",
          address_1: "123 Test Street",
          city: "Test City",
          country_code: "us",
          postal_code: "12345",
        },
        shipping_methods: [],
      },
    ]);
    console.log(order);

    return "Orders synced successfully.";
  }

  private async requestToken(): Promise<string> {
    const response = await fetch(`${BASE_URL}/auth/token`, {
      method: "POST",
      body: JSON.stringify({
        user: "WEB-API-USR",
        password: "WEB-API-PW",
      }),
    });
    const data = await response.json();
    this.varyToken = data.token;
    return data.token;
  }

  private async createOrUpdateProductAndVariant(item: VaryItem) {
    const productService_ = container.resolve(Modules.PRODUCT);
    const existingProduct = await productService_
      .retrieveProduct(item.sItemCode)
      .catch(() => null);

    const productData = {
      title: item.sDescr_1,
      handle: item.sItemCode,
      description: item.sHTMLDescr_Intro_1 || item.sDescr_1,
      is_giftcard: false,
      // options: item.tabOptions?.map((option) => ({
      //   title: option.sOptionCode,
      // })),
      metadata: this.extractMetadata(item),
    };

    let product;
    if (existingProduct) {
      product = await productService_.updateProducts(
        existingProduct.id,
        productData
      );
    } else {
      const d = productData as CreateProductDTO;
      product = await productService_.createProducts(d);
    }

    await this.createOrUpdateVariant(product.id, item);
  }

  // Function to create or update variants
  private async createOrUpdateVariant(productId: string, item: VaryItem) {
    const productService_ = container.resolve(Modules.PRODUCT);
    const variantOptions: Record<string, string> = {};
    // if (item.tabOptions) {
    //   for (const option of item.tabOptions) {
    //     variantOptions[option.sOptionCode] = option.sValue;
    //   }
    // }

    const variantData = {
      product_id: productId,
      title: item.sModel || "Default Variant",
      sku: item.sItemCode,
      inventory_quantity: item.StkInfo?.Items[0]?.rQuantity || 0,
      manage_inventory: true,
      prices: [
        { amount: item.tabSalePrice?.[0]?.nPrice || 0, currency_code: "usd" },
      ],
      options: variantOptions, // Updated to match required Record<string, string> type
      metadata: this.extractMetadata(item),
    };

    const existingVariants = await productService_.listProductVariants({
      product_id: productId,
    });
    if (existingVariants.length) {
      await productService_.updateProductVariants(
        existingVariants[0].id,
        variantData
      );
    } else {
      await productService_.createProductVariants([variantData]);
    }
  }

  // Helper function to extract metadata
  private extractMetadata(item: VaryItem): Record<string, any> {
    const metadataFields = [
      "sReplacementItemCode",
      "sDescr_2",
      "sDescr_3",
      "sDescr_4",
      "bHided",
      "sMasterItemCode",
      "nLength",
      "nWidth",
      "nHeight",
      "nWeight",
      "sFIELD1_PLATFORM",
      "sENGINE_MAIN",
      "sENGINE_SECOND",
      "sTIRES_TYPE",
      "sBATTERY_TYPE",
    ];
    const metadata: Record<string, any> = {};
    for (const key of metadataFields) {
      if (item[key] !== undefined) {
        metadata[key] = item[key];
      }
    }
    return metadata;
  }
}

export default SyncService;
