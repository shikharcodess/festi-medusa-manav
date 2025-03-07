import { VaryServiceOptions } from "./utils/types";
import axios, { AxiosInstance } from "axios";

enum VaryLog {
  WARNING,
  ERROR,
  SUCCESS,
  INFO,
}

export default class VaryService {
  private varyAxiosClient_: AxiosInstance;
  private varyToken: string;
  private optios_: VaryServiceOptions;
  constructor(container, options: VaryServiceOptions) {
    this.optios_ = options;
    this.setupAxiosClient();
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

  private VaryServiceLog(type: VaryLog, ...message: any[]) {
    console.log(
      `[VaryService] [${type}] - ${message
        .map((item) => JSON.stringify(item))
        .join(" | ")}`
    );
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
      baseURL: this.optios_.varyApiUrl,
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
        user: this.optios_.varyUser,
        password: this.optios_.varyPassword,
      };

      const response = await axios.request({
        url: `${this.optios_.varyApiUrl}/auth/token`,
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
      throw this.VaryServiceError(error.toString());
    }
  }

  async pullMultipleProductFromVary() {}

  async pullOneProductFromVary() {}

  async checkProductExistance() {}

  async createOrderOnVary() {}

  async updateOrderOnVary() {}
}
