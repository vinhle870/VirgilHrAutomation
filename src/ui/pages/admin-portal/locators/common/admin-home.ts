export class AdminHomeLocators {
  static readonly heading = "//h6";
  static readonly profilePicture = "//img[@alt='profile picture']";
  static readonly userName = "//p[@class='oxd-userdropdown-name']";
  static readonly widgets =
    "//div[@class='oxd-grid-3 orangehrm-dashboard-grid']/div";
  static readonly home = "//h2[text()='Home']";

  static readonly widgetLabels = {
    timeAtWork: "Time at Work",
    myActions: "My Actions",
    quickLaunch: "Quick Launch",
    buzzLatestPosts: "Buzz Latest Posts",
    employeesOnLeaveToday: "Employees on Leave Today",
    employeeDistributionBySubUnit: "Employee Distribution by Sub Unit",
    employeeDistributionByLocation: "Employee Distribution by Location",
  };
}
