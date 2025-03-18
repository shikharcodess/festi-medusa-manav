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
  CreateProductsWorkflowInput,
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
  nSortorder: number | string;
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
  private productService_?: IProductModuleService;
  private orderService_?: IOrderModuleService;
  private customerService_?: ICustomerModuleService;

  private internalCategoryMapping: InternalCategoryMapping[] = [];
  private varyCategory: VaryCategory[] = [];

  private isServiceReady_: boolean = false;
  publicMetadata: Record<string, any> = {};

  constructor(c, options: VaryServiceOptions) {
    this.options_ = options;
    this.setupAxiosClient();
  }

  isServiceReady(): boolean {
    return this.isServiceReady_;
  }

  setDependencies(
    productService: IProductModuleService,
    orderService: IOrderModuleService,
    customerService: ICustomerModuleService
  ) {
    this.productService_ = productService;
    this.orderService_ = orderService;
    this.customerService_ = customerService;

    this.isServiceReady_ = true;
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
        Accpet: "application/json",
      },
    });

    this.varyAxiosClient_.interceptors.request.use(async (request) => {
      if (this.varyToken == undefined || this.varyToken == null) {
        this.varyToken = await this.getVaryToken();
      }

      request.headers.Authorization = `${this.varyToken}`;
      return request;
    });

    this.varyAxiosClient_.interceptors.response.use(
      async (response) => {
        if (response.status === 401) {
          try {
            this.varyToken = await this.getVaryToken();
            response.config.headers.Authorization = `${this.varyToken}`;
            return this.varyAxiosClient_.request(response.config);
          } catch (error) {
            this.VaryServiceLog(
              VaryLog.WARNING,
              "Error while retrying the request",
              error
            );
          }
        }
        return response;
      },
      async (error) => {
        if (error.response && error.response.status === 401) {
          try {
            this.varyToken = await this.getVaryToken();
            error.config.headers.Authorization = `${this.varyToken}`;
            return this.varyAxiosClient_.request(error.config);
          } catch (err) {
            this.VaryServiceLog(
              VaryLog.WARNING,
              "Error while retrying the request",
              err
            );
          }
        }

        return Promise.reject(error);
      }
    );
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
      // if (!this.isServiceReady_) {
      //   throw this.VaryServiceError(
      //     "requires external dependencies are not set"
      //   );
      // }
      const payload = {
        user: this.options_.varyUser,
        password: this.options_.varyPassword,
      };

      const response = await axios.request({
        url: `${this.options_.varyApiUrl}/auth/token`,
        method: "POST",
        maxContentLength: Infinity,
        headers: {
          "Content-Type": "application/json",
        },
        data: payload,
      });
      if (response.status == 200) {
        const responseBody = response.data as { Token: string };
        return responseBody.Token;
      } else {
        throw this.VaryServiceError(
          "getVaryToken",
          `request failed with status ${response.status} while access vary token`
        );
      }
    } catch (error: any) {
      throw this.VaryServiceError("getVaryToken", error);
    }
  }

  /**
   * Converts a string representing a sort order into a numeric value.
   *
   * The input string can be either a numeric string or a string in the format of a letter followed by a number.
   *
   * - If the input is a numeric string, it is parsed as an integer.
   * - If the input is in the format of a letter followed by a number (e.g., "A1", "B2"), it is converted to a numeric value
   *   where the letter represents a base value (A -> 100, B -> 200, etc.) and the number is added to this base value.
   *
   * @param nSortOrder - The sort order string to convert.
   * @returns The numeric representation of the sort order.
   * @throws {Error} If the input string does not match the expected format.
   */
  private convertNSortOrder(nSortOrder: string): number {
    if (/^\d+$/.test(nSortOrder)) {
      return parseInt(nSortOrder, 10);
    }

    const match = nSortOrder.match(/^([A-Z])(\d+)$/);
    if (match) {
      const [, letter, num] = match;
      const letterIndex = letter.charCodeAt(0) - "A".charCodeAt(0); // Convert A -> 0, B -> 1, etc.
      return 100 + letterIndex * 100 + parseInt(num, 10);
    }

    throw new Error("Invalid nSortOrder format");
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
  async pullAllProductFromVary(): Promise<VaryProduct[]> {
    try {
      if (!this.isServiceReady_) {
        throw this.VaryServiceError(
          "requires external dependencies are not set"
        );
      }
      const response = await this.varyAxiosClient_.request({
        url: `/item?nPageSize=100000&nPageNumber=1&bOnTheWeb=-1&sFormatDescrFull=TXT`,
        method: "GET",
      });
      if (response.status == 200) {
        if ((response.data as any).Items.length > 0) {
          const responseBody = response.data.Items as VaryProduct[];
          return responseBody;
        } else {
          throw this.VaryServiceError(
            "pullMultipleProductFromVary",
            "no product found"
          );
        }
      } else {
        throw this.VaryServiceError(
          "pullMultipleProductFromVary",
          `vary item fetch request failed with status ${response.status}`
        );
      }
    } catch (error) {
      throw this.VaryServiceError("pullMultipleProductFromVary", error);
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
      if (!this.isServiceReady_) {
        throw this.VaryServiceError(
          "requires external dependencies are not set"
        );
      }
      const response = await this.varyAxiosClient_.request({
        url: `/item?idItem=${itemId}`,
        method: "GET",
      });
      if (response.status == 200) {
        if ((response.data as any).Items.length > 0) {
          const responseBody = response.data.Items[0] as VaryProduct;
          return responseBody;
        } else {
          throw this.VaryServiceError(
            "pullOneProductFromVary",
            "no product found"
          );
        }
      } else {
        throw this.VaryServiceError(
          "pullOneProductFromVary",
          `vary item fetch request failed with status ${response.status}`
        );
      }
    } catch (error) {
      throw this.VaryServiceError("pullOneProductFromVary", error);
    }
  }

  /**
   * Checks if a product with the given ID exists on Medusa.
   *
   * @param {string} id - The ID of the product to check.
   * @returns {Promise<boolean>} - A promise that resolves to `true` if the product exists, `false` otherwise.
   * @throws {VaryServiceError} - Throws an error if there is an issue with the product service.
   */
  async checkProductExistanceOnMedusa(
    id: number,
    itemCode: string
  ): Promise<boolean> {
    try {
      if (!this.isServiceReady_) {
        throw this.VaryServiceError(
          "requires external dependencies are not set"
        );
      }

      const products = await this.productService_.listProducts(
        { external_id: `itemId-${id}_sItemCode-${itemCode}` },
        { select: ["external_id"] }
      );
      return !!products.find(
        (item) => item.external_id === `itemId-${id}_sItemCode-${itemCode}`
      );
    } catch (error) {
      throw this.VaryServiceError("checkProductExistanceOnMedusa", error);
    }
  }

  /**
   * Fetches a category from the Vary service using the provided ID.
   *
   * @param {number} id - The ID of the category to fetch.
   * @returns {Promise<VaryCategory>} A promise that resolves to the fetched category.
   * @throws Will throw an error if the request fails or if the response status is not 200.
   */
  async fetchAllCategoryFromVary(): Promise<VaryCategory[]> {
    try {
      if (!this.isServiceReady_) {
        throw this.VaryServiceError(
          "requires external dependencies are not set"
        );
      }
      const response = await this.varyAxiosClient_.request({
        url: `/item/cat?tabCategType=Web&sFormatDescrFull=TXT&bWithHTMLDescr=0`,
        method: "GET",
      });
      if (response.status == 200) {
        if ((response.data as any).WebCat.length > 0) {
          const responseBody: VaryCategory[] = (response.data as any)
            .WebCat as VaryCategory[];
          return responseBody;
        }
      }
      throw this.VaryServiceError(
        "fetchCategoryFromVary",
        "error while fetching category from vary"
      );
    } catch (error) {
      throw this.VaryServiceError("fetchCategoryFromVary", error);
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
      if (!this.isServiceReady_) {
        throw this.VaryServiceError(
          "requires external dependencies are not set"
        );
      }

      const foundCategory = this.internalCategoryMapping.find(
        (item) => item.idWebcat === id
      );
      if (foundCategory) {
        return foundCategory;
      } else {
        const categoryCount =
          await this.productService_.listAndCountProductCategories(
            {},
            { select: ["id"], take: 1 }
          );
        const categoryList = await this.productService_.listProductCategories(
          {},
          { select: ["id", "metadata"], skip: 0, take: categoryCount[1] }
        );
        const medusaCategory = categoryList.find(
          (item) => (item.metadata?.idWebCat as number) === id
        );

        if (medusaCategory) {
          const newMapping: InternalCategoryMapping = {
            idWebcat: id,
            medusaId: medusaCategory.id,
          };
          this.internalCategoryMapping.push(newMapping);
          return newMapping;
        } else {
          if (options?.createIfNotFound) {
            let newMedusaCategory: ProductCategoryDTO;
            if (options.data) {
              newMedusaCategory =
                await this.productService_.createProductCategories({
                  name: options?.data.sDescr_1,
                  description: options.data.sDescrFull_1,
                  rank: this.convertNSortOrder(String(options.data.nSortorder)),
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
              var cachedVaryCategory = this.varyCategory.find(
                (item) => item.idWebCat === id
              );
              if (!cachedVaryCategory) {
                this.varyCategory = await this.fetchAllCategoryFromVary();
                cachedVaryCategory = this.varyCategory.find(
                  (item) => item.idWebCat === id
                );
              }
              if (!cachedVaryCategory) {
                throw this.VaryServiceError("category not found on vary", {});
              }

              newMedusaCategory =
                await this.productService_.createProductCategories({
                  name: cachedVaryCategory.sDescr_1,
                  description: cachedVaryCategory.sDescrFull_1,
                  rank: this.convertNSortOrder(
                    String(cachedVaryCategory.nSortorder)
                  ),
                  handle: toHandle(cachedVaryCategory.sDescr_1),
                  metadata: {
                    idWebCat: cachedVaryCategory.idWebCat,
                    idParent: cachedVaryCategory.idParent,
                    title_nl: cachedVaryCategory.sDescr_2,
                    title_en: cachedVaryCategory.sDescr_3,
                    description_nl: cachedVaryCategory.sDescrFull_2,
                    description_en: cachedVaryCategory.sDescrFull_3,
                  },
                  is_active: true,
                });
            }
            const newMapping: InternalCategoryMapping = {
              idWebcat: id,
              medusaId: newMedusaCategory.id,
            };

            this.internalCategoryMapping.push(newMapping);
            return newMapping;
          } else {
            throw this.VaryServiceError(
              "getCategoryMapping",
              "no category found for this id"
            );
          }
        }
      }
    } catch (error) {
      throw this.VaryServiceError("getCategoryMapping", error);
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
  async createNewProductInMedusa(
    product: VaryProduct,
    salesChannel: string
  ): Promise<void> {
    try {
      if (!this.isServiceReady_) {
        throw this.VaryServiceError(
          "createNewProductInMedusa",
          "required external dependencies are not set"
        );
      }
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
          this.VaryServiceLog(error);
        }
      }

      const workflowInput: CreateProductsWorkflowInput = {
        products: [
          {
            // id: String(product.idItem),
            external_id: `itemId-${product.idItem}_sItemCode-${product.sItemCode}`,
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
                allow_backorder: true,
                manage_inventory: false,
                prices: [
                  {
                    // id: `pro${product.idItem}_pri${String(
                    //   product.tabRentalPrice[0].idListPrice
                    // )}`,
                    amount: product.tabRentalPrice[0].nPrice,
                    currency_code: "usd",
                  },
                  {
                    amount: product.tabSalePrice[0].nPrice,
                    currency_code: "usd",
                    // id: `pro${product.idItem}_pri${String(
                    //   product.tabSalePrice[0].idListPrice
                    // )}`,
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
                id: salesChannel,
              },
            ],
          },
        ],
      };

      console.log(workflowInput);

      await createProductsWorkflow(container).run({
        input: workflowInput,
      });
    } catch (error) {
      throw this.VaryServiceError("createNewProductInMedusa", error);
    }
  }

  /**
   * To Be Implemented! Will be done soon
   */
  async createOrderOnVary() {}

  /**
   * To Be Implemented!
   */
  async updateOrderOnVary() {}

  async createNewCustomer() {}
}
