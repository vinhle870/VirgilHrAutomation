export interface IMemberInvitation {
  id: string;
  recipients: [
    {
      email: string;
      firstName: string;
      lastName: string;
      phoneNumber: string;
      jobTitle: string;
      role: number;
      partnerConsumerType: number;
      consultantRole: number;
    },
  ];
}
