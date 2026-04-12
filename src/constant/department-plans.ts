import {
  virgilHRPlans as virgilHRPlansQa,
  biginHRPlans as biginHRPlansQa,
} from "./department.plan.qa";
import {
  virgilHRPlans as virgilHRPlansUat,
  biginHRPlans as biginHRPlansUat,
} from "./department.plan.uat";

type DepartmentKind = "virgilhr" | "biginhr";

function normalizeEnv(env?: string): string {
  return (env ?? process.env.ENV ?? "qa").toLowerCase().trim();
}

/**
 * Maps API / .env department labels to plan list keys.
 * Supports values like `VirgilHR`, `BiginHR`, `virgil hr`.
 */
export function resolveDepartmentKind(departmentName: string): DepartmentKind {
  const compact = departmentName.replace(/\s+/g, "").toLowerCase();
  if (compact.includes("virgil")) {
    return "virgilhr";
  }
  if (compact.includes("bigin")) {
    return "biginhr";
  }
  throw new Error(
    `Unknown department for plan resolution: "${departmentName}". Expected name to contain "Virgil" or "Bigin".`,
  );
}

function planSetsForEnv(envLower: string): {
  virgilHRPlans: string[];
  biginHRPlans: string[];
} {
  switch (envLower) {
    case "uat":
      return {
        virgilHRPlans: virgilHRPlansUat,
        biginHRPlans: biginHRPlansUat,
      };
    case "qa":
    default:
      return {
        virgilHRPlans: virgilHRPlansQa,
        biginHRPlans: biginHRPlansQa,
      };
  }
}

/**
 * Ordered plan display names for a department, for the given environment
 * (`qa`, `qa1`, `uat`, …). Uses `process.env.ENV` when `env` is omitted.
 */
export function getPlansForDepartment(
  departmentName: string
): string[] {
  const kind = resolveDepartmentKind(departmentName);
  const sets = planSetsForEnv(normalizeEnv(process.env.ENV));
  return kind === "virgilhr" ? sets.virgilHRPlans : sets.biginHRPlans;
}
