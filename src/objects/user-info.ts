export default interface UserInfo {
  email: string;
  password?: string;
  firstName: string;
  lastName: string;
  jobTitle: string;
  phoneNumber: string;

  //info to be added on Admin Portal
  userType?: number;
  inviteToken?: string;
}
