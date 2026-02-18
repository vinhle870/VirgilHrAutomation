export default interface UserInfo {
  email: string;
  password?: string;
  firstName: string;
  lastName: string;
  jobTitle: string;
  phoneNumber: string;

  //info to be added on Admin Portal
  userType?: number;

  //info to be added on Member Portal as role
  role?: number;
}
