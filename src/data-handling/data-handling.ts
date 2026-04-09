import { JsonHandling } from '../utilities/json-handling';
import { Constants } from "../utilities/constants";

export class DataHandling {


  /**
   * Parse Dealer Info from file
   * @param filename
   * @returns dealer object
   */
  static async parseDataFromFile(filename: string): Promise<object | undefined> {
    return await JsonHandling.parseJsonTextToObject(Constants.BUSINESS_ENTITY_FOLDER + filename);
  }

  static async filterProductTypeFiltersByName(productTypeFilters: any, filterName: string): Promise<any> {
    const dataArray = Array.isArray(productTypeFilters  ) ? productTypeFilters : [productTypeFilters];
    const product = dataArray.find(item => item.name === filterName);
    return product ? product.productType : undefined;
  }
}