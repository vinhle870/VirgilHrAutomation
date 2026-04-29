import { expect } from "@playwright/test";

type AssertOptions = { soft?: boolean };

/**
 * Fluent assertion builder for API response objects.
 *
 * Usage:
 *   ApiAssert.on(response)
 *     .isDefined()
 *     .isObject()
 *     .hasKeys("main", "lms")
 *     .at("main")
 *       .containsText("name", planName)
 *       .hasKeys("productType", "price", "startDate");
 *
 * Soft mode collects all failures instead of stopping at the first:
 *   ApiAssert.on(response, { soft: true }).isDefined().hasKeys("main");
 */
export class ApiAssert {
  private readonly ex: typeof expect;

  private constructor(
    private readonly data: unknown,
    private readonly soft: boolean,
  ) {
    this.ex = soft ? expect.configure({ soft: true }) : expect;
  }

  static on(data: unknown, options?: AssertOptions): ApiAssert {
    return new ApiAssert(data, options?.soft ?? false);
  }

  isDefined(): this {
    this.ex(this.data).toBeDefined();
    return this;
  }

  isObject(): this {
    this.ex(typeof this.data).toBe("object");
    return this;
  }

  /** Assert that one or more top-level keys exist on the current object. */
  hasKeys(...keys: string[]): this {
    for (const key of keys) {
      this.ex(this.data).toHaveProperty(key);
    }
    return this;
  }

  /** Assert that `data[key]` contains the given substring. */
  containsText(key: string, value: string): this {
    this.ex((this.data as Record<string, unknown>)[key]).toContain(value);
    return this;
  }

  /** Assert that `data[key]` strictly equals the given value. */
  equals(key: string, value: unknown): this {
    this.ex((this.data as Record<string, unknown>)[key]).toBe(value);
    return this;
  }

  /** Assert that `data[key]` deeply equals the given value. */
  deepEquals(key: string, value: unknown): this {
    this.ex((this.data as Record<string, unknown>)[key]).toEqual(value);
    return this;
  }

  /**
   * Navigate into a nested property and return a new ApiAssert scoped to it.
   * Soft mode is inherited from the parent.
   *
   * const assert = ApiAssert.on(response);
   * assert.hasKeys("main", "lms");
   * assert.at("main").containsText("name", planName).hasKeys("productType");
   * assert.at("lms").isDefined();
   */
  at(path: string): ApiAssert {
    const nested = (this.data as Record<string, unknown>)?.[path];
    return new ApiAssert(nested, this.soft);
  }
}
