import { plans as qaPlans } from "./department.plan.qa";
import { plans as uatPlans } from "./department.plan.uat";

const plansByEnv: Record<string, Record<string, string[]>> = {
  qa: qaPlans,
  uat: uatPlans,
};

function normalizeEnv(): string {
  return (process.env.ENV ?? process.env.exec_env ?? "qa").toLowerCase().trim();
}

function normalizeDepartmentKey(departmentName: string): string {
  return departmentName.replace(/\s+/g, "").toLowerCase();
}

/**
 * Returns ordered plan display names for a department in the current environment.
 * Department is read from `process.env.DEPARTMENT_NAME` when omitted.
 * Environment is read from `process.env.ENV` (or `exec_env`).
 *
 * To add a new department: add its normalized key (e.g. "newdepthr") to each
 * `department.plan.*.ts` map — no changes required here.
 */
export function getPlansForDepartment(departmentName: string = process.env.DEPARTMENT_NAME ?? ""): string[] {
  const env = normalizeEnv();
  const key = normalizeDepartmentKey(departmentName);
  const envPlans = plansByEnv[env] ?? plansByEnv["qa"];
  const result = envPlans[key];
  if (!result) {
    throw new Error(`No plans found for department "${departmentName}" (key: "${key}") in env "${env}". ` + `Available departments: ${Object.keys(envPlans).join(", ")}`);
  }
  return result;
}
