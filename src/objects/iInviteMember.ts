export interface IRecipient {
  email: string;
  firstName: string;
  jobTitle: string;
  lastName: string;
  phoneNumber: string;
  role?: number;
}

export interface IInviteMember {
  recipients: IRecipient[];
}
