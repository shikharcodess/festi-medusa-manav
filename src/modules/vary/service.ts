import {
  CreateCustomerDTO,
  CreateProductOptionDTO,
  CreateProductOptionValueDTO,
  ICustomerModuleService,
  IOrderModuleService,
  IProductModuleService,
  ProductCategoryDTO,
  ProductOptionDTO,
} from "@medusajs/framework/types";
import { MedusaProductAssoc, VaryServiceOptions } from "./utils/types";
import axios, { AxiosInstance } from "axios";
import { container } from "@medusajs/framework";
import {
  generateEntityId,
  MedusaService,
  Modules,
  ProductStatus,
  toHandle,
} from "@medusajs/framework/utils";
import {
  createProductsWorkflow,
  createCustomerAccountWorkflow,
  CreateProductsWorkflowInput,
  createProductOptionsWorkflow,
  CreateProductOptionsWorkflowInput,
} from "@medusajs/medusa/core-flows";
import { VaryProductAssoc } from "./models/varyItemAssoc";
import { VarySyncConfiguration } from "./models/varySyncConfiguration";
import { VarySyncLogs } from "./models/varySyncLogs";

enum VaryLog {
  WARNING,
  ERROR,
  SUCCESS,
  INFO,
}

export interface VarySyncConfiguration {
  id: string;
  active: boolean;
  trigger_duration: number;
  trigger_unit: string;
  metadata?: Record<string, any>;
}

export interface VaryProduct {
  idItem: number;
  sItemCode: string;
  sDescr_1: string;
  sDescr_2: string;
  sDescr_3: string;
  sDescrFull_1: string;
  sDescrFull_2: string;
  sDescrFull_3: string;
  idWebCat: number;
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
  tabRentalPrice: {
    idListPrice: number;
    nPrice: number;
  }[];
  tabSalePrice: {
    nPrice: number;
    idListPrice: number;
  }[];
  tabOptions: {
    idOption: number;
    sOptionCode: string;
    bIsActive: boolean;
    sDescr_1: string;
    sDescr_2: string;
    sDescr_3: string;
    sValue: string;
  }[];
  tabAssoc?: VaryProductAssoc[];
}

export interface VaryProductAssoc {
  sItemCode: string;
  sItemAssocCode: string;
  nQuantity: number;
  nAssocType: number;
  IdAssocGroup: number;
  nLineType: number;
  nManagementType: number;
  sPriceAssoc: string;
  bProposeByDefault: boolean;
  nRoundType: number;
  nPrintLevel: number;
  nPriceCalculationMethod: number;
  nDivers_4: number;
  nDivers_5: number;
  nDivers_6: number;
  nDivers_7: number;
  nDivers_8: number;
  nDivers_9: number;
  nDivers_10: number;
  nType: number;
  nLineNumber: number;
  nPriceValue: number;
  nDividedQuantity: number;
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

export interface VaryProductOption {
  idOption: number;
  sOptionCode: string;
  bIsActiv: boolean;
  sDescr_1: string;
  sDescr_2: string;
  sDescr_3: string;
  bWithValue: boolean;
  TabValue: string[];
}

export interface MedusaProductType {
  id: string;
  value: string;
  created_at: Date;
  updated_at?: string | Date;
  deleted_at?: string | Date;
  metadata?: Record<string, any>;
}

interface InternalCategoryMapping {
  medusaId: string;
  idWebcat: number;
}

interface InternalOptionMapping {
  idOption: number;
  medusaId: string;
}

interface InternalProductTypeMapping {
  sItemAssocCode: string;
  medusaId: string;
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
export default class VaryService extends MedusaService({
  VaryProductAssoc,
  VarySyncConfiguration,
  VarySyncLogs,
}) {
  private varyAxiosClient_?: AxiosInstance;
  private varyToken?: string;
  private options_: VaryServiceOptions;
  private productService_?: IProductModuleService;
  private orderService_?: IOrderModuleService;
  private customerService_?: ICustomerModuleService;

  private internalCategoryMapping: InternalCategoryMapping[] = [];
  private internalOptionMapping: InternalOptionMapping[] = [];
  private internalProductTYpeMapping: InternalProductTypeMapping[] = [];
  private varyCategory: VaryCategory[] = [];
  private varyOptions: VaryProductOption[] = [];
  private medusaProductTypes: MedusaProductType[] = [];

  private isServiceReady_: boolean = false;
  publicMetadata: Record<string, any> = {};

  constructor(c: any, options: VaryServiceOptions) {
    super(c);
    this.options_ = options;
    this.setupAxiosClient();
  }

  isServiceReady(): boolean {
    return this.isServiceReady_;
  }

  /**
   * Sets the dependencies required for the service to function properly.
   * This method initializes the service with the provided instances of
   * product, order, and customer services, and marks the service as ready.
   *
   * @param productService - An instance of the product service implementing `IProductModuleService`.
   * @param orderService - An instance of the order service implementing `IOrderModuleService`.
   * @param customerService - An instance of the customer service implementing `ICustomerModuleService`.
   */
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
            return this.varyAxiosClient_?.request(response.config);
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
            return this.varyAxiosClient_?.request(error.config);
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
      const response = await this.varyAxiosClient_?.request({
        url: `/item??WithOptions=1&nPageSize=100000&nPageNumber=1&sFormatDescrFull=TXT&?nPageSize=100&nPageNumber=1&bOnTheWeb=1&bWithSearchkeys=0&bWithOptions=1&bSHOnly=0&bWithSHinfo=0&bHided=false&bBlocked=false&sFormatDescrFull=TXT&bWithHTMLDescr=0&pWithExtandedInformation=0&bWithStkInfo=1&bWithMemo=1&bUncodes=true&tabAssoc=Vary,Web,Related`,
        method: "GET",
      });
      if (response?.status == 200) {
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
          `vary item fetch request failed with status ${response?.status}`
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
      const response = await this.varyAxiosClient_?.request({
        url: `/item?idItem=${itemId}`,
        method: "GET",
      });
      if (response?.status == 200) {
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
          `vary item fetch request failed with status ${response?.status}`
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

      const products = await this.productService_?.listProducts(
        { external_id: `itemId-${id}_sItemCode-${itemCode}` },
        { select: ["external_id"] }
      );
      return !!products?.find(
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
      const response = await this.varyAxiosClient_?.request({
        url: `/item/cat?tabCategType=Web&sFormatDescrFull=TXT&bWithHTMLDescr=0`,
        method: "GET",
      });
      if (response?.status == 200) {
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
          await this.productService_?.listAndCountProductCategories(
            {},
            { select: ["id"], take: 1 }
          );
        if (!categoryCount) {
          throw this.VaryServiceError("getCategoryMapping", {
            message: "error file fetching total category count on medusa",
          });
        }
        const categoryList = await this.productService_?.listProductCategories(
          {},
          { select: ["id", "metadata"], skip: 0, take: categoryCount[1] }
        );
        const medusaCategory = categoryList?.find(
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
            let newMedusaCategory: ProductCategoryDTO | any;
            if (options.data) {
              var medusaParentCategoryId: string | null = null;
              if (options.data.idParent != null && options.data.idParent != 0) {
                const tempMapping = await this.getCategoryMapping(
                  options.data.idParent,
                  { createIfNotFound: true }
                );
                if (tempMapping) {
                  medusaParentCategoryId = tempMapping.medusaId;
                }
              }
              newMedusaCategory =
                await this.productService_?.createProductCategories({
                  name: options?.data.sDescr_1,
                  description: options.data.sDescrFull_1,
                  rank: this.convertNSortOrder(String(options.data.nSortorder)),
                  handle: toHandle(options.data.sDescr_1.trim()),
                  parent_category_id: medusaParentCategoryId,
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

              var medusaParentCategoryId: string | null = null;
              if (
                cachedVaryCategory.idParent != null &&
                cachedVaryCategory.idParent != 0
              ) {
                const tempMapping = await this.getCategoryMapping(
                  cachedVaryCategory.idParent,
                  { createIfNotFound: true }
                );
                if (tempMapping) {
                  medusaParentCategoryId = tempMapping.medusaId;
                }
              }

              newMedusaCategory =
                await this.productService_?.createProductCategories({
                  name: cachedVaryCategory.sDescr_1,
                  description: cachedVaryCategory.sDescrFull_1,
                  rank: this.convertNSortOrder(
                    String(cachedVaryCategory.nSortorder)
                  ),
                  handle: toHandle(cachedVaryCategory.sDescr_1.trim()),
                  parent_category_id: medusaParentCategoryId,
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
   * Fetches all product options from the Vary service.
   *
   * @returns {Promise<VaryProductOption[]>} A promise that resolves to an array of VaryProductOption objects.
   * @throws {VaryServiceError} If the service is not ready or if there is an error during the request.
   *
   * @example
   * const options = await fetchAllProductOptionsFromVary();
   * console.log(options);
   */
  async fetchAllProductOptionsFromVary(): Promise<VaryProductOption[]> {
    try {
      if (!this.isServiceReady_) {
        throw this.VaryServiceError(
          "requires external dependencies are not set"
        );
      }
      const response = await this.varyAxiosClient_?.request({
        url: `/item/option`,
        method: "GET",
      });
      if (response?.status == 200) {
        const varyOptions: VaryProductOption[] = (response.data as any)
          .Options as VaryProductOption[];
        return varyOptions;
      } else {
        throw this.VaryServiceError(
          "fetchAllProductOptionsFromVary",
          response?.data
        );
      }
    } catch (error) {
      throw this.VaryServiceError("fetchAllProductOptionsFromVary", error);
    }
  }

  /**
   * Retrieves the option mapping for a given option ID. If the option mapping is not found,
   * it can optionally create a new mapping based on the provided options.
   *
   * @param idOption - The ID of the option to retrieve the mapping for.
   * @param options - Optional parameters for creating a new mapping if not found.
   * @param options.createIfNotFound - Whether to create a new mapping if not found. Defaults to false.
   * @param options.data - Data for creating a new product option if not found.
   *
   * @returns A promise that resolves to the internal option mapping.
   *
   * @throws Will throw an error if the service is not ready or if the option is not found and createIfNotFound is false.
   */
  async getOptionMapping(
    idOption: number,
    options?: {
      createIfNotFound: boolean | false;
      data?: VaryProductOption;
    }
  ): Promise<InternalOptionMapping> {
    try {
      if (!this.isServiceReady_) {
        throw this.VaryServiceError(
          "requires external dependencies are not set"
        );
      }

      const foundCategory = this.internalOptionMapping.find(
        (item) => item.idOption === idOption
      );
      if (foundCategory) {
        return foundCategory;
      } else {
        const categoryCount =
          await this.productService_?.listAndCountProductOptions(
            {},
            { select: ["id"], take: 1 }
          );
        if (!categoryCount) {
          throw this.VaryServiceError("getOptionMapping", {
            message: "error file fetchinig total option count from medusa",
          });
        }
        const productOptionList =
          await this.productService_?.listProductOptions(
            {},
            { select: ["id", "metadata"], skip: 0, take: categoryCount[1] }
          );
        const medusaProductOption = productOptionList?.find(
          (item) => (item.metadata?.idOption as number) === idOption
        );

        if (medusaProductOption) {
          const newMapping: InternalOptionMapping = {
            idOption: idOption,
            medusaId: medusaProductOption.id,
          };
          this.internalOptionMapping.push(newMapping);
          return newMapping;
        } else {
          if (options?.createIfNotFound) {
            let newMedusaProductOption: ProductOptionDTO | any;
            if (options.data) {
              newMedusaProductOption =
                await this.productService_?.createProductOptions({
                  title: options?.data.sDescr_1,
                  values: options.data.TabValue,
                  product_id: "",
                });
            } else {
              var cachedVaryOptions = this.varyOptions.find(
                (item) => item.idOption === idOption
              );
              if (!cachedVaryOptions) {
                this.varyOptions = await this.fetchAllProductOptionsFromVary();
                cachedVaryOptions = this.varyOptions.find(
                  (item) => item.idOption === idOption
                );
              }
              if (!cachedVaryOptions) {
                throw this.VaryServiceError("option not found on vary", {});
              }

              if (!options.data) {
                throw this.VaryServiceError("getOptionMapping", {});
              }

              newMedusaProductOption =
                await this.productService_?.createProductOptions({
                  title: (options.data as any).sDescr_1,
                  values: (options.data as any).TabValue,
                  product_id: "",
                });
            }
            const newMapping: InternalOptionMapping = {
              idOption: idOption,
              medusaId: newMedusaProductOption.id,
            };

            this.internalOptionMapping.push(newMapping);
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
      throw this.VaryServiceError("getOptionMapping", error);
    }
  }

  /**
   * Retrieves a product option from the Vary service based on the provided option code.
   *
   * @param {string} optionCode - The code of the product option to retrieve.
   * @returns {Promise<VaryProductOption>} - A promise that resolves to the product option.
   * @throws {Error} - Throws an error if the product option is not found or if there is an issue with the Vary service.
   */
  async getProductOptionFromVary(
    optionCode: string
  ): Promise<VaryProductOption> {
    try {
      const cachedOptionData = this.varyOptions.find(
        (item) => item.sOptionCode === optionCode
      );
      if (cachedOptionData) {
        return cachedOptionData;
      } else {
        this.varyOptions = await this.fetchAllProductOptionsFromVary();
        const newVaryOption = this.varyOptions.find(
          (item) => item.sOptionCode === optionCode
        );
        if (newVaryOption) {
          return newVaryOption;
        } else {
          throw this.VaryServiceError(
            "getProductOptionFromVary",
            "option not found"
          );
        }
      }
    } catch (error) {
      throw this.VaryServiceError("getProductOptionFromVary", error);
    }
  }

  /**
   * Creates a new Medusa product type with the specified name.
   *
   * @param name - The name of the product type to be created. Must be a non-empty string.
   * @returns A promise that resolves to the created `MedusaProductType` object.
   * @throws Will throw an error if the name is empty or if the product type creation fails.
   */
  async createMedusaProductType(
    value: string,
    sItemAssocCode: string
  ): Promise<MedusaProductType> {
    try {
      if (value != "") {
        const newMedusaProductTypes =
          await this.productService_?.createProductTypes([
            { value: value, metadata: { sItemAssocCode: sItemAssocCode } },
          ]);
        if (!newMedusaProductTypes) {
          throw this.VaryServiceError("createMedusaProductType", {
            message: "",
          });
        }
        if (newMedusaProductTypes.length > 0) {
          return newMedusaProductTypes[0] as MedusaProductType;
        } else {
          throw this.VaryServiceError("createMedusaProductType", {
            message: "something went wrong while creating medusa product type",
          });
        }
      } else {
        throw this.VaryServiceError("createMedusaProductType", {
          message: "empty product type value is not allowed",
        });
      }
    } catch (error: any) {
      throw this.VaryServiceError(error.toString(), error);
    }
  }

  /**
   * Checks if a product type with the specified value exists in Medusa.
   *
   * @param value - The value of the product type to check for existence.
   * @returns A promise that resolves to `true` if the product type exists, otherwise `false`.
   * @throws Will throw an error if the operation fails.
   */
  async checkProductTypeExistanceOnMedusa(value: string): Promise<boolean> {
    try {
      const medusaTypeValues = await this.productService_?.listProductTypes({
        value: value,
      });
      if (!medusaTypeValues) {
        throw this.VaryServiceError("checkProductTypeExistanceOnMedusa", {});
      }
      const foundMedusaTypesValue = medusaTypeValues.find(
        (item) => item.value === value
      );
      if (foundMedusaTypesValue) {
        return true;
      } else {
        return false;
      }
    } catch (error: any) {
      throw this.VaryServiceError("checkProductTypeExistanceOnMedusa", error);
    }
  }

  /**
   * Fetches all product types from Medusa.
   *
   * This function retrieves the total count of product types and then fetches all product types
   * using the `listAndCountProductTypes` and `listProductTypes` methods of the product service.
   *
   * @returns {Promise<MedusaProductType[]>} A promise that resolves to an array of Medusa product types.
   * @throws Will throw an error if the operation fails, wrapping the error in a `VaryServiceError`.
   */
  async fetchAllProductTypeFromMedusa(): Promise<MedusaProductType[]> {
    try {
      const medusaProductTypeCount =
        await this.productService_?.listAndCountProductTypes(
          {},
          { select: ["id"] }
        );
      if (!medusaProductTypeCount) {
        throw this.VaryServiceError("fetchAllProductTypeFromMedusa", {});
      }
      const medusaProductTypes = await this.productService_?.listProductTypes(
        {},
        { skip: 0, take: medusaProductTypeCount[1] }
      );

      return medusaProductTypes as MedusaProductType[];
    } catch (error: any) {
      throw this.VaryServiceError("checkProductTypeExistanceOnMedusa", error);
    }
  }

  /**
   * Retrieves or creates a mapping between a product type and its associated Medusa product type.
   *
   * @param value - The unique identifier (`sItemAssocCode`) for the product type mapping.
   * @param option - Optional parameters for the operation.
   *   - `createIsNotFound`: If `true`, a new Medusa product type will be created if no mapping is found.
   *   - `data`: Optional data to use when creating a new Medusa product type.
   *
   * @returns A promise that resolves to an `InternalProductTypeMapping` object containing the mapping details.
   *
   * @throws Will throw an error if the mapping cannot be resolved and `createIsNotFound` is not set to `true`.
   *
   * @example
   * ```typescript
   * const mapping = await service.getProductTypeMapping("exampleCode", {
   *   createIsNotFound: true,
   *   data: { sItemAssocCode: "exampleCode" },
   * });
   * console.log(mapping);
   * ```
   */
  async getProductTypeMapping(
    value: string,
    option?: { createIsNotFound: boolean; data?: VaryProductAssoc }
  ): Promise<InternalProductTypeMapping> {
    try {
      const foundProductTypeMapping = this.internalProductTYpeMapping.find(
        (item) => item.sItemAssocCode === value
      );
      if (foundProductTypeMapping) {
        return foundProductTypeMapping;
      } else {
        const foundMedusaProductType = this.medusaProductTypes.find(
          (item) => item.metadata?.sItemAssocCode === value
        );
        if (foundMedusaProductType) {
          const mapping: InternalProductTypeMapping = {
            sItemAssocCode: value,
            medusaId: foundMedusaProductType.id,
          };
          this.internalProductTYpeMapping.push(mapping);
          return mapping;
        } else {
          this.medusaProductTypes = await this.fetchAllProductTypeFromMedusa();
          const foundMedusaProductTypeS2 = this.medusaProductTypes.find(
            (item) => item.metadata?.sItemAssocCode === value
          );
          if (foundMedusaProductTypeS2) {
            const mapping: InternalProductTypeMapping = {
              sItemAssocCode: value,
              medusaId: foundMedusaProductTypeS2.id,
            };
            this.internalProductTYpeMapping.push(mapping);
            return mapping;
          } else {
            if (option?.createIsNotFound) {
              let newMedusaProductType: MedusaProductType;
              if (option.data) {
                newMedusaProductType = await this.createMedusaProductType(
                  option.data.sItemAssocCode,
                  option.data.sItemAssocCode
                );
              } else {
                newMedusaProductType = await this.createMedusaProductType(
                  value,
                  value
                );
              }
              this.medusaProductTypes.push(newMedusaProductType);

              const mapping: InternalProductTypeMapping = {
                sItemAssocCode: newMedusaProductType.metadata?.sItemAssocCode,
                medusaId: newMedusaProductType.id,
              };
              this.internalProductTYpeMapping.push(mapping);
              return mapping;
            } else {
              throw this.VaryServiceError("getProductTypeMapping", {
                message: "resolution of vary product assoc failed",
              });
            }
          }
        }
      }
    } catch (error: any) {
      throw this.VaryServiceError("getProductTypeMapping", error);
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

      var medusaCategoryId: string | null = null;
      if (product.idWebCat != null && product.idWebCat != 0) {
        try {
          const category = await this.getCategoryMapping(product.idWebCat, {
            createIfNotFound: true,
          });
          medusaCategoryId = category.medusaId;
        } catch (error: any) {
          this.VaryServiceLog(
            VaryLog.WARNING,
            `no record found for id: [${product.idWebCat}] in medusa and vary`
          );
          this.VaryServiceLog(error);
        }
      }

      const variantOptionValue: Record<string, string> = {};
      const productHandle: string = toHandle(product.sDescr_1.trim());

      const productOptions: { title: string; values: string[] }[] = [];
      for (const varyOption of product.tabOptions) {
        if (varyOption.sValue) {
          const record = await this.getProductOptionFromVary(
            varyOption.sOptionCode
          );
          productOptions.push({
            title: varyOption.sOptionCode,
            values: record.TabValue,
          });
          variantOptionValue[varyOption.sOptionCode] = varyOption.sValue;
        }
      }

      if (productOptions.length == 0) {
        productOptions.push({
          title: "base",
          values: [productHandle],
        });
        variantOptionValue["base"] = productHandle;
      }

      const medusaPrices: { amount: number; currency_code: string }[] = [];
      if (
        product.tabRentalPrice[0].nPrice != null &&
        product.tabRentalPrice[0].nPrice != 0
      ) {
        medusaPrices.push({
          amount: product.tabRentalPrice[0].nPrice,
          currency_code: "eur",
        });
      }
      if (
        product.tabSalePrice[0].nPrice != null &&
        product.tabSalePrice[0].nPrice != 0
      ) {
        medusaPrices.push({
          amount: product.tabSalePrice[0].nPrice,
          currency_code: "eur",
        });
      }

      const medusaProductAssocIds: string[] = [];
      if (product.tabAssoc) {
        for (const assoc of product.tabAssoc) {
          const medusaProductAssoc =
            await this.getOneVaryProductAssocFromMedusaByValue(
              assoc.sItemAssocCode
            );
          if (medusaProductAssoc) {
            medusaProductAssocIds.push(medusaProductAssoc.id);
          } else {
            const newMedusaProductAssoc =
              await this.createVaryItemAssocInMedusa(assoc.sItemAssocCode);
            medusaProductAssocIds.push(newMedusaProductAssoc.id);
          }
        }
      }

      const workflowInput: CreateProductsWorkflowInput = {
        additional_data: { product_assoc_ids: medusaProductAssocIds },
        products: [
          {
            external_id: `itemId-${product.idItem}_sItemCode-${product.sItemCode}`,
            title: product.sDescr_1,
            category_ids: medusaCategoryId ? [medusaCategoryId] : [],
            description: product.sDescrFull_1,
            handle: productHandle,
            status: ProductStatus.PUBLISHED,
            options: productOptions,
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
                options: variantOptionValue,
                allow_backorder: true,
                manage_inventory: false,
                prices: medusaPrices,
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

      await createProductsWorkflow(container).run({
        input: workflowInput,
      });
    } catch (error) {
      throw this.VaryServiceError("createNewProductInMedusa", error);
    }
  }

  /**
   * Creates a new Medusa product association for a given value.
   *
   * This method generates a unique entity ID for the provided value,
   * constructs a Medusa product association object, and saves it using
   * the `createVaryProductAssocs` method. If an error occurs during the
   * process, it throws a custom `VaryServiceError`.
   *
   * @param value - The value to associate with the Medusa product.
   * @returns A promise that resolves to the newly created Medusa product association.
   * @throws VaryServiceError if the creation process fails.
   */
  async createVaryItemAssocInMedusa(
    value: string
  ): Promise<MedusaProductAssoc> {
    try {
      const newMedusaProductAssoc = await this.createVaryProductAssocs({
        id: generateEntityId(value, "vit"),
        name: value,
      });
      return newMedusaProductAssoc as any as MedusaProductAssoc;
    } catch (error) {
      throw this.VaryServiceError("createVaryItemAssocInMedusa", error);
    }
  }

  /**
   * Checks if a Vary item association exists on Medusa by its name.
   *
   * This method queries the list of Medusa product associations using the provided
   * name and determines if an association with the same name exists.
   *
   * @param value - The name of the Vary item association to check.
   * @returns A promise that resolves to `true` if the association exists, or `false` otherwise.
   * @throws Will throw an error if the operation fails, wrapping the error in a `VaryServiceError`.
   */
  async checkVaryItemAssocExistaneOnMedusa(value: string): Promise<boolean> {
    try {
      const medusaProductAssocs = await this.listVaryProductAssocs({
        name: value,
      });
      const foundMedusaProductAssoc = medusaProductAssocs.find(
        (item) => item.name === value
      );
      if (foundMedusaProductAssoc) {
        return true;
      } else {
        return false;
      }
    } catch (error) {
      throw this.VaryServiceError("checkVaryItemAssocExistaneOnMedusa", error);
    }
  }

  /**
   * Retrieves a single Medusa product association by its value.
   *
   * This method fetches a list of Medusa product associations filtered by the provided value
   * and attempts to find a matching association. If a match is found, it is returned.
   * Otherwise, an error is thrown indicating that no record was found for the given value.
   *
   * @param value - The value to search for in the Medusa product associations.
   * @returns A promise that resolves to the matching `MedusaProductAssoc` object.
   * @throws Will throw an error if no matching record is found or if an unexpected error occurs.
   */
  async getOneVaryProductAssocFromMedusaByValue(
    value?: string
  ): Promise<MedusaProductAssoc | null> {
    try {
      const medusaProductAssocs = await this.listVaryProductAssocs({
        name: value,
      });
      const foundMedusaProductAssoc = medusaProductAssocs.find(
        (item) => item.name === value
      );
      if (foundMedusaProductAssoc) {
        return foundMedusaProductAssoc as any as MedusaProductAssoc;
      } else {
        return null;
      }
    } catch (error: any) {
      throw this.VaryServiceError(
        "getOneVaryProductAssocFromMedusaByValue",
        error
      );
    }
  }

  /**
   * Retrieves a single Medusa product association by its ID from the Medusa system.
   *
   * @param id - The unique identifier of the Medusa product association to retrieve.
   * @returns A promise that resolves to the found `MedusaProductAssoc` object.
   * @throws Will throw an error if no record is found for the provided ID or if an unexpected error occurs.
   */
  async getOneVaryProductAssocFromMedusaById(
    id?: string
  ): Promise<MedusaProductAssoc> {
    try {
      const medusaProductAssocs = await this.listVaryProductAssocs({
        name: id,
      });
      const foundMedusaProductAssoc = medusaProductAssocs.find(
        (item) => item.id === id
      );
      if (foundMedusaProductAssoc) {
        return foundMedusaProductAssoc as MedusaProductAssoc;
      } else {
        throw this.VaryServiceError("getOneVaryProductAssocFromMedusa", {
          message: "no record found for provided id",
        });
      }
    } catch (error: any) {
      throw this.VaryServiceError(
        "getOneVaryProductAssocFromMedusaById",
        error
      );
    }
  }

  /**
   * Retrieves all Medusa product associations from the database.
   *
   * This method fetches all `MedusaProductAssoc` records by first determining the total count
   * of associations and then retrieving them in a single query. It ensures that all records
   * are returned as an array of `MedusaProductAssoc` objects.
   *
   * @returns {Promise<MedusaProductAssoc[]>} A promise that resolves to an array of `MedusaProductAssoc` objects.
   * @throws Will throw an error if the retrieval process fails, wrapping the error in a `VaryServiceError`.
   */
  async getAllVaryProductAssocFromMedusa(): Promise<MedusaProductAssoc[]> {
    try {
      const medusaProductAssocCounts = await this.listAndCountVaryProductAssocs(
        {},
        { select: ["id"] }
      );
      const medusaProductAssocs = await this.listVaryProductAssocs(
        {},
        { skip: 0, take: medusaProductAssocCounts[1] }
      );
      return medusaProductAssocs as MedusaProductAssoc[];
    } catch (error) {
      throw this.VaryServiceError("getAllVaryProductAssocFromMedusa", error);
    }
  }

  /**
   * Retrieves the VarySyncConfiguration. If a configuration with the specified ID
   * does not exist, a new one is created with default values.
   *
   * @returns {Promise<VarySyncConfiguration>} A promise that resolves to the VarySyncConfiguration.
   * @throws Will throw an error if the operation fails.
   */
  async getVarySyncConfiguration(): Promise<VarySyncConfiguration> {
    try {
      const configurations = await this.listVarySyncConfigurations(
        { id: "1" },
        { skip: 0, take: 1 }
      );
      const foundConfiguration = configurations.find((item) => item.id === "1");
      if (foundConfiguration) {
        return foundConfiguration as VarySyncConfiguration;
      } else {
        const createdConfiguration = await this.createVarySyncConfigurations({
          id: generateEntityId("1"),
          active: true,
          trigger_duration: 10,
          trigger_unit: "minute",
        });
        return createdConfiguration as any as VarySyncConfiguration;
      }
    } catch (error) {
      throw this.VaryServiceError("getVarySyncConfiguration", error);
    }
  }

  /**
   * Toggles the running status of the Vary synchronization process.
   *
   * @param status - A boolean indicating the desired running status of the sync process.
   *                 Pass `true` to set the sync process as running, or `false` to stop it.
   * @returns A promise that resolves when the status has been successfully updated.
   * @throws Will throw an error if the update operation fails.
   */
  async toggleSyncRunningStatus(status: boolean): Promise<void> {
    try {
      await this.updateVarySyncConfigurations({ id: "1", running: status });
      return;
    } catch (error) {
      throw this.VaryServiceError("toggleSyncRunningStatus", error);
    }
  }

  /**
   * Updates the synchronization trigger configuration for the Vary service.
   *
   * @param trigger_duration - The duration for the synchronization trigger (optional).
   * @param trigger_unit - The unit of time for the synchronization trigger (optional).
   * @returns A promise that resolves to the updated `VarySyncConfiguration`.
   *
   * @throws Will throw an error if both `trigger_duration` and `trigger_unit` are null or undefined.
   * @throws Will throw a `VaryServiceError` if an error occurs during the update process.
   */
  async updateSyncTrigger(
    trigger_duration?: number,
    trigger_unit?: string
  ): Promise<VarySyncConfiguration> {
    try {
      if (trigger_duration != null || trigger_unit != null) {
        const updateBody: Record<string, any> = {};
        if (trigger_duration) {
          updateBody.trigger_duration = trigger_duration;
        }
        if (trigger_unit) {
          updateBody.trigger_unit = trigger_unit;
        }
        const updated = await this.updateVarySyncConfigurations({
          id: "1",
          ...updateBody,
        });
        return updated as VarySyncConfiguration;
      } else {
        throw this.VaryServiceError("updateSyncError", {
          message: "empty values are not allowed",
        });
      }
    } catch (error) {
      throw this.VaryServiceError("updateSyncTrigger", error);
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
