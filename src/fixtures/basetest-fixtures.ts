import { mergeTests } from "@playwright/test";
import { test as apiTest } from "./api-fixtures";
import { test as pageTest } from "./page-fixtures";
import { test as flowTest } from "./flow-fixtures";

export const test = mergeTests(apiTest, pageTest, flowTest);

export { expect } from "@playwright/test";
