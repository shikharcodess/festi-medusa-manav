import {
  CreateCustomerDTO,
  ICustomerModuleService,
  IOrderModuleService,
  IProductModuleService,
  ProductCategoryDTO,
} from "@medusajs/framework/types";
import { VaryServiceOptions } from "./utils/types";
import axios, { AxiosInstance } from "axios";
import { container } from "@medusajs/framework";
import { Modules, ProductStatus, toHandle } from "@medusajs/framework/utils";
import {
  createProductsWorkflow,
  createCustomerAccountWorkflow,
} from "@medusajs/medusa/core-flows";

enum VaryLog {
  WARNING,
  ERROR,
  SUCCESS,
  INFO,
}

export interface VaryProduct {
  idItem: number;
  sItemCode: string;
  tabAssoc: string;
  sDescr_1: string;
  sDescr_2: string;
  sDescr_3: string;
  sDescrFull_1: string;
  sDescrFull_2: string;
  sDescrFull_3: string;
  idWebCat: number;
  tabRentalPrice: {
    idListPrice: number;
    nPrice: number;
  }[];
  tabSalePrice: {
    nPrice: number;
    idListPrice: number;
  }[];
  nLength: number;
  nWidth: number;
  nHeight: number;
  nWeight: number;
  nDiameter: number;
  nThickness: number;
  nCapacity: number;
  bBlocked: boolean;
  bHided: boolean;
  nConditioning: number;
  sPackages: string;
  bSaleOnly: boolean;
}

export interface VaryDocument {
  idDocument: number;
  idKey: number;
  sDescription: string;
  sExtension: string;
  nType: number;
  dDate: string;
  tTime: string;
  nSize: number;
  sWebSizes: string;
}

export interface VaryCategory {
  idWebCat: number;
  idParent: number;
  nSortorder: number;
  sDescr_1: string;
  sDescr_2: string;
  sDescr_3: string;
  sDescrFull_1: string;
  sDescrFull_2: string;
  sDescrFull_3: string;
}

export interface VaryContacts {
  idContact: number;
  sFirstName: string;
  sLastName: string;
  sEmail: string;
  wWebLogin: string;
  sPhone: string;
  sMobile: string;
  sCodeLang: string;
  sCountryCode: string;
  bBlocked: boolean;
}

export interface VaryCustomer {
  sCustomerCode: string;
  sName: string;
  sAddressee: string;
  sAddressLine1: string;
  sZipCode: string;
  sCity: string;
  sCountryCode: string;
  sPhone: string;
  sVatCode: string;
  sEmail: string;
  spaymentConditions: string;
  nInsuranceType: number;
  Contacts: VaryContacts;
}

export interface VaryOrder {
  idCompany: number;
  sBasketReference: string;
  sCustomerCode: string;
  idContact: number;
  nDeliveryType: number;
  dStartDate: string; // Assuming ISO date format (YYYY-MM-DD)
  dEndDate: string; // Assuming ISO date format (YYYY-MM-DD)
  tDeliveryStartTime: string; // Assuming HH:MM:SS format
  tDeliveryEndTime: string;
  tReturnStartTime: string;
  tReturnEndTime: string;
  nStatus: number;
  bEndOfRental: boolean;
  sNote?: string;
  sCodeLang: string;
  sName: string;
  sFirstName: string;
  sLastName: string;
  sAddress: string;
  sZipCode: string;
  sCity: string;
  sEmail: string;
  sEmailInvoice?: string;
  sEmailReminder?: string;
  sPhone?: string;
  sMobile?: string;
  sVatCode?: string;
  sDeliveryStreet: string;
  sDeliveryNumber: string;
  sDeliveryZipCode: string;
  sDeliveryCity: string;
  nReturnType: number;
  sReturnStreet: string;
  sReturnNumber: string;
  sReturnZipCode: string;
  sReturnCity: string;
  nFileType: number;
  sDeliveryDetail?: string;
  sReturnDetail?: string;
  BasketLines: VaryProduct[];
}

interface InternalCategoryMapping {
  medusaId: string;
  idWebcat: number;
}

/**
 * Service class for interacting with the Vary API.
 *
 * The `VaryService` class provides methods for managing products and categories,
 * as well as handling authentication and logging for the Vary API.
 *
 * @class
 * @example
 * const varyService = new VaryService(container, options);
 *
 * @property {AxiosInstance} varyAxiosClient_ - Axios client instance for Vary API interactions.
 * @property {string} varyToken - Authentication token for Vary API.
 * @property {VaryServiceOptions} options_ - Configuration options for VaryService.
 * @property {IProductModuleService} productService - Service for managing products in Medusa.
 * @property {IOrderModuleService} orderService - Service for managing orders in Medusa.
 * @property {InternalCategoryMapping[]} categories - Cached category mappings.
 *
 * @constructor
 * @param {any} c - Dependency injection container.
 * @param {VaryServiceOptions} options - Configuration options for VaryService.
 *
 * @method VaryServiceError
 * @description Creates a new error specific to the VaryService.
 * @param {string} message - The error message to be included.
 * @param {any} [data] - Optional additional data to be included in the error message.
 * @returns {Error} A new Error object with the provided message and data.
 *
 * @method VaryServiceLog
 * @description Logs a new line specific to the VaryService.
 * @param {VaryLog} type - The type of the log.
 * @param {...any[]} message - Values of type any in comma separated manner.
 * @returns {void}
 *
 * @method setupAxiosClient
 * @description Sets up the Axios client for Vary API interactions.
 * @private
 *
 * @method getVaryToken
 * @description Retrieves a Vary token by making an authentication request to the Vary API.
 * @returns {Promise<string>} A promise that resolves to the Vary token.
 * @throws {VaryServiceError} If the request fails or an error occurs during the process.
 *
 * @method pullMultipleProductFromVary
 * @description Fetches multiple products from the Vary service.
 * @returns {Promise<VaryProduct[]>} A promise that resolves to an array of `VaryProduct` objects.
 * @throws {VaryServiceError} Will throw an error if the request fails or no products are found.
 *
 * @method pullOneProductFromVary
 * @description Fetches a single product from the Vary service using the provided item ID.
 * @param {number} itemId - The ID of the item to fetch.
 * @returns {Promise<VaryProduct>} A promise that resolves to the fetched VaryProduct.
 * @throws {VaryServiceError} Throws an error if the product is not found or if the request fails.
 *
 * @method checkProductExistanceOnMedusa
 * @description Checks if a product with the given ID exists on Medusa.
 * @param {string} id - The ID of the product to check.
 * @returns {Promise<boolean>} A promise that resolves to `true` if the product exists, `false` otherwise.
 * @throws {VaryServiceError} Throws an error if there is an issue with the product service.
 *
 * @method fetchCategoryFromVary
 * @description Fetches a category from the Vary service using the provided ID.
 * @param {number} id - The ID of the category to fetch.
 * @returns {Promise<VaryCategory>} A promise that resolves to the fetched category.
 * @throws {VaryServiceError} Will throw an error if the request fails or if the response status is not 200.
 *
 * @method getCategoryMapping
 * @description Retrieves the category mapping for a given ID. If the category is not found, it optionally creates a new category based on the provided options.
 * @param {number} id - The ID of the category to retrieve.
 * @param {Object} [options] - Optional parameters for category creation if not found.
 * @param {boolean} [options.createIfNotFound=false] - Whether to create a new category if not found.
 * @param {VaryCategory} [options.data] - Data for the new category if it needs to be created.
 * @returns {Promise<InternalCategoryMapping>} A promise that resolves to the internal category mapping.
 * @throws {VaryServiceError} Will throw an error if the category is not found and `createIfNotFound` is false.
 *
 * @method createNewProductInMedusa
 * @description Creates a new product in Medusa using the provided VaryProduct details.
 * @param {VaryProduct} product - The product details to create in Medusa.
 * @returns {Promise<void>} A promise that resolves when the product is created.
 * @throws {VaryServiceError} Throws an error if the product creation fails.
 *
 * @method createOrderOnVary
 * @description To Be Implemented!
 * @returns {Promise<void>}
 *
 * @method updateOrderOnVary
 * @description To Be Implemented!
 * @returns {Promise<void>}
 */
export default class VaryService {
  private varyAxiosClient_: AxiosInstance;
  private varyToken: string;
  private options_: VaryServiceOptions;
  private productService: IProductModuleService;
  private orderService: IOrderModuleService;
  private customerService: ICustomerModuleService;

  private categories: InternalCategoryMapping[] = [];

  constructor(c, options: VaryServiceOptions) {
    this.options_ = options;
    this.setupAxiosClient();
    this.productService = container.resolve(Modules.PRODUCT);
    this.orderService = container.resolve(Modules.ORDER);
    this.customerService = container.resolve(Modules.CUSTOMER);

    let s: CreateCustomerDTO;
    this.customerService.createCustomers({});
  }

  /**
   * Creates a new error specific to the VaryService.
   *
   * @param message - The error message to be included.
   * @param data - Optional additional data to be included in the error message.
   * @returns A new Error object with the provided message and data.
   */
  private VaryServiceError(message: string, data?: any): Error {
    const dataString = JSON.stringify(data, null, 2);
    return new Error(`[VaryService] [Error] - ${message} \n ${dataString}`);
  }

  /**
   * Logs a new line specific to the VaryService.
   *
   * @param type - The type of the log.
   * @param message - Values of type any in comma seperated manner.
   * @returns {void}
   */
  private VaryServiceLog(type: VaryLog, ...message: any[]): void {
    console.log(
      `[VaryService] [${type}] - ${message
        .map((item) => JSON.stringify(item))
        .join(" | ")}`
    );
    return;
  }

  /**
   * Sets up the Axios client for Vary API interactions.
   *
   * This method initializes an Axios instance with the base URL and headers required for
   * communicating with the Vary API. It also configures request and response interceptors.
   *
   * The request interceptor ensures that the Authorization header is always set with the
   * current Vary token.
   *
   * The response interceptor handles 401 Unauthorized responses by attempting to refresh
   * the Vary token and retrying the failed request with the new token. If the token refresh
   * fails, it logs a warning message.
   *
   * @private
   */
  private setupAxiosClient() {
    this.varyAxiosClient_ = axios.create({
      baseURL: this.options_.varyApiUrl,
      maxContentLength: Infinity,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.varyToken}`,
      },
    });

    this.varyAxiosClient_.interceptors.request.use((request) => {
      request.headers.Authorization = `Bearer ${this.varyToken}`;
      return request;
    });

    this.varyAxiosClient_.interceptors.response.use(async (response) => {
      if (response.status == 401) {
        try {
          this.varyToken = await this.getVaryToken();
          response.config.headers.Authorization = `Bearer ${this.varyToken}`;
          return this.varyAxiosClient_.request(response.config);
        } catch (error) {
          this.VaryServiceLog(
            VaryLog.WARNING,
            "error while retring the request",
            error
          );
        }
      }
      return response.data;
    });
  }

  /**
   * Retrieves a Vary token by making an authentication request to the Vary API.
   *
   * @returns {Promise<string>} A promise that resolves to the Vary token.
   * @throws {VaryServiceError} If the request fails or an error occurs during the process.
   *
   * The method constructs a payload using the Vary user and password from the options,
   * then sends a request to the Vary API to obtain an authentication token. If the request
   * is successful and returns a status of 200, the token is extracted from the response body
   * and returned. If the request fails or any error occurs, a VaryServiceError is thrown with
   * the appropriate error message.
   */
  private async getVaryToken(): Promise<string> {
    try {
      const payload = {
        user: this.options_.varyUser,
        password: this.options_.varyPassword,
      };

      const response = await axios.request({
        url: `${this.options_.varyApiUrl}/auth/token`,
        maxContentLength: Infinity,
        headers: {
          "Content-Type": "application/json",
        },
        data: payload,
      });
      if (response.status == 200) {
        const responseBody = response.data as { token: string };
        return responseBody.token;
      } else {
        throw this.VaryServiceError(
          `request failed with status ${response.status} while access vary token`
        );
      }
    } catch (error: any) {
      throw this.VaryServiceError(error);
    }
  }

  /**
   * Fetches multiple products from the Vary service.
   *
   * This method sends a GET request to the Vary service to retrieve a list of products.
   * If the request is successful and products are found, it returns an array of `VaryProduct` objects.
   * If no products are found or the request fails, it throws an error.
   *
   * @returns {Promise<VaryProduct[]>} A promise that resolves to an array of `VaryProduct` objects.
   * @throws Will throw an error if the request fails or no products are found.
   */
  async pullMultipleProductFromVary(): Promise<VaryProduct[]> {
    try {
      const response = await this.varyAxiosClient_.request({
        url: `/item`,
        method: "GET",
      });
      if (response.status == 200) {
        if ((response.data as any).Items.length > 0) {
          const responseBody = response.data.Items as VaryProduct[];
          return responseBody;
        } else {
          throw this.VaryServiceError("no product found");
        }
      } else {
        throw this.VaryServiceError(
          `vary item fetch request failed with status ${response.status}`
        );
      }
    } catch (error) {
      throw this.VaryServiceError(error);
    }
  }

  /**
   * Fetches a single product from the Vary service using the provided item ID.
   *
   * @param {number} itemId - The ID of the item to fetch.
   * @returns {Promise<VaryProduct>} - A promise that resolves to the fetched VaryProduct.
   * @throws {VaryServiceError} - Throws an error if the product is not found or if the request fails.
   */
  async pullOneProductFromVary(itemId: number): Promise<VaryProduct> {
    try {
      const response = await this.varyAxiosClient_.request({
        url: `/item?idItem=${itemId}`,
        method: "GET",
      });
      if (response.status == 200) {
        if ((response.data as any).Items.length > 0) {
          const responseBody = response.data.Items[0] as VaryProduct;
          return responseBody;
        } else {
          throw this.VaryServiceError("no product found");
        }
      } else {
        throw this.VaryServiceError(
          `vary item fetch request failed with status ${response.status}`
        );
      }
    } catch (error) {
      throw this.VaryServiceError(error);
    }
  }

  /**
   * Checks if a product with the given ID exists on Medusa.
   *
   * @param {string} id - The ID of the product to check.
   * @returns {Promise<boolean>} - A promise that resolves to `true` if the product exists, `false` otherwise.
   * @throws {VaryServiceError} - Throws an error if there is an issue with the product service.
   */
  async checkProductExistanceOnMedusa(id: number): Promise<boolean> {
    try {
      const products = await this.productService.listProducts(
        {},
        { select: ["id"], skip: 0, take: -1 }
      );
      return !!products.find(
        (item) => (item.metadata?.idWebCat as number) == id
      );
    } catch (error) {
      throw this.VaryServiceError(error);
    }
  }

  /**
   * Fetches a category from the Vary service using the provided ID.
   *
   * @param {number} id - The ID of the category to fetch.
   * @returns {Promise<VaryCategory>} A promise that resolves to the fetched category.
   * @throws Will throw an error if the request fails or if the response status is not 200.
   */
  async fetchCategoryFromVary(id: number): Promise<VaryCategory> {
    try {
      const response = await this.varyAxiosClient_.request({
        url: `/item/cat?tabIDWeb=${id}`,
        method: "GET",
      });
      if (response.status == 200) {
        if ((response.data as any).WebCat.length > 0) {
          const responseBody: VaryCategory = (response.data as any)
            .WebCat as VaryCategory;
          return responseBody;
        }
      }
      throw this.VaryServiceError("error while fetching category from vary");
    } catch (error) {
      throw this.VaryServiceError(error);
    }
  }

  /**
   * Retrieves the category mapping for a given ID. If the category is not found,
   * it optionally creates a new category based on the provided options.
   *
   * @param id - The ID of the category to retrieve.
   * @param options - Optional parameters for category creation if not found.
   * @param options.createIfNotFound - Whether to create a new category if not found.
   * @param options.data - Data for the new category if it needs to be created.
   *
   * @returns A promise that resolves to the internal category mapping.
   *
   * @throws Will throw an error if the category is not found and `createIfNotFound` is false.
   */
  async getCategoryMapping(
    id: number,
    options?: {
      createIfNotFound: boolean | false;
      data?: VaryCategory;
    }
  ): Promise<InternalCategoryMapping> {
    try {
      const foundCategory = this.categories.find(
        (item) => item.idWebcat === id
      );
      if (foundCategory) {
        return foundCategory;
      } else {
        const categoryList = await this.productService.listProductCategories(
          {},
          { skip: 0, take: -1 },
          {}
        );
        const medusaCategory = categoryList.find(
          (item) => (item.metadata?.idWebCat as number) === id
        );

        if (medusaCategory) {
          const newMapping: InternalCategoryMapping = {
            idWebcat: id,
            medusaId: medusaCategory.id,
          };
          this.categories.push(newMapping);
          return newMapping;
        } else {
          if (options?.createIfNotFound) {
            let newMedusaCategory: ProductCategoryDTO;
            if (options.data) {
              newMedusaCategory =
                await this.productService.createProductCategories({
                  name: options?.data.sDescr_1,
                  description: options.data.sDescrFull_1,
                  rank: options.data.nSortorder,
                  handle: toHandle(options.data.sDescr_1),
                  metadata: {
                    idWebCat: options.data.idWebCat,
                    idParent: options.data.idParent,
                    title_nl: options.data.sDescr_2,
                    title_en: options.data.sDescr_3,
                    description_nl: options.data.sDescrFull_2,
                    description_en: options.data.sDescrFull_3,
                  },
                  is_active: true,
                });
            } else {
              const varCategory: VaryCategory =
                await this.fetchCategoryFromVary(id);
              newMedusaCategory =
                await this.productService.createProductCategories({
                  name: options?.data.sDescr_1,
                  description: options.data.sDescrFull_1,
                  rank: options.data.nSortorder,
                  handle: toHandle(options.data.sDescr_1),
                  metadata: {
                    idWebCat: options.data.idWebCat,
                    idParent: options.data.idParent,
                    title_nl: options.data.sDescr_2,
                    title_en: options.data.sDescr_3,
                    description_nl: options.data.sDescrFull_2,
                    description_en: options.data.sDescrFull_3,
                  },
                  is_active: true,
                });
            }
            const newMapping: InternalCategoryMapping = {
              idWebcat: id,
              medusaId: newMedusaCategory.id,
            };

            this.categories.push(newMapping);
            return newMapping;
          } else {
            throw this.VaryServiceError("no category found for this id");
          }
        }
      }
    } catch (error) {
      throw this.VaryServiceError(error);
    }
  }

  /**
   * Creates a new product in Medusa using the provided VaryProduct details.
   *
   * @param {VaryProduct} product - The product details to create in Medusa.
   * @returns {Promise<void>} - A promise that resolves when the product is created.
   * @throws {VaryServiceError} - Throws an error if the product creation fails.
   *
   * @remarks
   * - Inventory details are missing.
   * - Image reference in item record is external only.
   * - Sale and rental prices are handled in the same or different sales channels.
   */
  async createNewProductInMedusa(product: VaryProduct): Promise<void> {
    try {
      // Missing inventory details
      // Missing image reference in item record - external reference only?
      // Sale and Rental price - same sale channel or different

      var medusaCategoryId: string | null;
      if (product.idWebCat != null && product.idWebCat != 0) {
        try {
          const category = await this.getCategoryMapping(product.idWebCat, {
            createIfNotFound: true,
          });
          medusaCategoryId = category.medusaId;
        } catch (error) {
          this.VaryServiceLog(
            VaryLog.WARNING,
            `no record found for id: [${product.idWebCat}] in medusa and vary`
          );
        }
      }

      await createProductsWorkflow(container).run({
        input: {
          products: [
            {
              id: String(product.idItem),
              external_id: String(product.sItemCode),
              title: product.sDescr_1,
              category_ids: medusaCategoryId ? [medusaCategoryId] : [],
              description: product.sDescrFull_1,
              handle: toHandle(product.sDescr_1),
              status: ProductStatus.PUBLISHED,
              options: [
                {
                  title: "item",
                  values: [String(product.idItem)],
                },
              ],
              weight: product.nWeight,
              length: product.nLength,
              width: product.nWidth,
              height: product.nWeight,
              variants: [
                {
                  title: product.sDescr_1,
                  sku: product.sItemCode,
                  options: {
                    item: String(product.idItem),
                  },
                  prices: [
                    {
                      amount: product.tabRentalPrice[0].nPrice,
                      currency_code: "usd",
                      id: String(product.tabRentalPrice[0].idListPrice),
                    },
                    {
                      amount: product.tabSalePrice[0].nPrice,
                      currency_code: "usd",
                      id: String(product.tabSalePrice[0].idListPrice),
                    },
                  ],
                  length: product.nLength,
                  weight: product.nWeight,
                  width: product.nWidth,
                  height: product.nHeight,
                  metadata: {
                    title_nl: product.sDescr_2,
                    title_en: product.sDescr_3,
                    description_nl: product.sDescrFull_2,
                    description_en: product.sDescrFull_3,
                    diameter: product.nDiameter,
                    thickness: product.nThickness,
                    capacity: product.nCapacity,
                    blocked: product.bBlocked,
                    hided: product.bHided,
                    conditioning: product.nConditioning,
                    conditioning_bac: product.sPackages,
                    expendable: product.bSaleOnly,
                  },
                },
              ],
              sales_channels: [
                {
                  id: "sc_01JKXK6R9MCCVBN8FQ031ANXWX",
                },
              ],
            },
          ],
        },
      });
    } catch (error) {
      throw this.VaryServiceError(error);
    }
  }

  /**
   * To Be Implemented!
   */
  async createOrderOnVary() {}

  /**
   * To Be Implemented!
   */
  async updateOrderOnVary() {}

  async createNewCustomer() {}
}

// Preview trigger
