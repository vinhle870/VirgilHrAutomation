import { ProductInfo } from "src/objects";

export class AdminPortalDataProvider {
  public static filterProductType(
    values: ProductInfo[],
    retrieveNumber = 2,
  ): ProductInfo[] {
    const filteredProductTypes: ProductInfo[] = [];
    const used = new Set<number>();

    while (
      filteredProductTypes.length < retrieveNumber &&
      used.size < values.length
    ) {
      const randomValue = values[Math.floor(Math.random() * values.length)];

      if (!used.has(randomValue.productType)) {
        used.add(randomValue.productType);
        filteredProductTypes.push({
          productType: randomValue.productType,
          productName: randomValue.productName,
          planId: randomValue.planId,
        });
      }
    }

    return filteredProductTypes;
  }
}
