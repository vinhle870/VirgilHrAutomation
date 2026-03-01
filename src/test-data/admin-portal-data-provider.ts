import { ProductInfo } from "src/objects";
import { CollectionUtils } from "src/utilities/collection-utils";

export class AdminPortalDataProvider {
  public static filterProductType(
    values: ProductInfo[],
    retrieveNumber = 2,
  ): ProductInfo[] {
    return CollectionUtils.pickUniqueByKey(
      values,
      "productType",
      retrieveNumber,
    );
  }
}
