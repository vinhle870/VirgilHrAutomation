/**
 * Generic collection utilities for filtering, searching, and randomly picking
 * items from arrays returned by API responses.
 *
 * Usage:
 * ```ts
 * const plans = await adminService.getPlans();
 *
 * // Find one item by property
 * const plan = CollectionUtils.findByProperty(plans, "name", "Premium");
 *
 * // Filter multiple items
 * const active = CollectionUtils.filterByProperty(plans, "status", "active");
 *
 * // Pick N random unique items
 * const sample = CollectionUtils.pickRandom(plans, 3);
 *
 * // Pick N unique items by a key (no duplicates on that key)
 * const unique = CollectionUtils.pickUniqueByKey(products, "productType", 2);
 *
 * // Find by name (case-insensitive partial match)
 * const match = CollectionUtils.findByName(plans, "premium");
 * ```
 */
export class CollectionUtils {
  /**
   * Find the first item where `item[key]` equals `value`.
   * Throws if not found (fail-fast in tests).
   */
  static findByProperty<T>(
    items: T[],
    key: keyof T,
    value: unknown,
  ): T {
    const result = items.find((item) => item[key] === value);
    if (!result) {
      throw new Error(
        `No item found where "${String(key)}" equals "${value}"`,
      );
    }
    return result;
  }

  /**
   * Find the first item where `item[key]` equals `value`.
   * Returns `undefined` if not found (no throw).
   */
  static findByPropertyOrNull<T>(
    items: T[],
    key: keyof T,
    value: unknown,
  ): T | undefined {
    return items.find((item) => item[key] === value);
  }

  /**
   * Find the first item where `item.name` contains `searchName` (case-insensitive).
   * Throws if not found.
   */
  static findByName<T extends { name: string }>(
    items: T[],
    searchName: string,
  ): T {
    const lowerSearch = searchName.toLowerCase();
    const result = items.find((item) =>
      item.name.toLowerCase().includes(lowerSearch),
    );
    if (!result) {
      throw new Error(`No item found with name containing "${searchName}"`);
    }
    return result;
  }

  /**
   * Return all items where `item[key]` equals `value`.
   */
  static filterByProperty<T>(
    items: T[],
    key: keyof T,
    value: unknown,
  ): T[] {
    return items.filter((item) => item[key] === value);
  }

  /**
   * Return items whose `item[key]` is in the provided `values` set.
   */
  static filterByPropertyIn<T>(
    items: T[],
    key: keyof T,
    values: unknown[],
  ): T[] {
    const valueSet = new Set(values);
    return items.filter((item) => valueSet.has(item[key]));
  }

  /**
   * Return items where `item.name` is in the provided name list (case-insensitive).
   */
  static filterByNames<T extends { name: string }>(
    items: T[],
    names: string[],
  ): T[] {
    const nameSet = new Set(names.map((n) => n.toLowerCase()));
    return items.filter((item) => nameSet.has(item.name.toLowerCase()));
  }

  /**
   * Pick one random item from the array.
   */
  static pickOne<T>(items: T[]): T {
    if (items.length === 0) {
      throw new Error("Cannot pick from an empty array");
    }
    return items[Math.floor(Math.random() * items.length)];
  }

  /**
   * Pick `count` random items from the array (no duplicate references).
   * If `count` >= array length, returns a shuffled copy of the full array.
   */
  static pickRandom<T>(items: T[], count: number): T[] {
    const shuffled = [...items].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  }

  /**
   * Pick `count` random items that are unique by `item[key]`.
   * Useful for selecting N items with distinct values on a specific field.
   */
  static pickUniqueByKey<T>(
    items: T[],
    key: keyof T,
    count: number,
  ): T[] {
    const shuffled = [...items].sort(() => Math.random() - 0.5);
    const seen = new Set<unknown>();
    const result: T[] = [];

    for (const item of shuffled) {
      if (result.length >= count) break;
      const val = item[key];
      if (!seen.has(val)) {
        seen.add(val);
        result.push(item);
      }
    }

    return result;
  }

  /**
   * Return a random integer between `min` and `max` (inclusive).
   */
  static randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
}
