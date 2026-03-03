import { JsonHandling } from "../utilities/json-handling";
import { Constants } from "../utilities/constants";
import { CollectionUtils } from "../utilities/collection-utils";

export class DataHandling {
  static async parseDataFromFile(
    filename: string,
  ): Promise<object | undefined> {
    return await JsonHandling.parseJsonTextToObject(
      Constants.BUSINESS_ENTITY_FOLDER + filename,
    );
  }

  /** @deprecated Use `CollectionUtils.findByProperty()` instead */
  static async filterProductTypeFiltersByName(
    productTypeFilters: any,
    filterName: string,
  ): Promise<any> {
    const dataArray = Array.isArray(productTypeFilters)
      ? productTypeFilters
      : [productTypeFilters];
    const product = CollectionUtils.findByPropertyOrNull(
      dataArray,
      "name",
      filterName,
    );
    return product ? (product as any).productType : undefined;
  }
}
