export interface Company {

     //Common Info
     companyName?: string;
     companySize?: string;

     //Info to be signup on Member Portal
     partnerId?: string;
     source?: string;
     departmentId?: string;
     ssoProvider?: string;
     ssoToken?: string;

     //Info to be added on Admin Portal

     useCredit?: boolean;
	statesEmployee?: string[];
     country?: Country;
     totalEmployees?: number;
	isSso?: boolean;
     type?: string;
     partnerConsultantId?:string;
     industry?: Industry[] | null;
}