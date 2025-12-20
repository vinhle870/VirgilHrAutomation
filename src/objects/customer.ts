import UserInfo from './user-info';
import { DataHandling } from '../data-handling/data-handling';
import { Constants } from '../utilities/constants';
import { DataGenerate } from '../utilities/data-generate';
import { plans } from 'src/constant/plans';
import { format } from 'date-fns';

export class Customer {
	public accountInfo: UserInfo;
	public userType: number;
	public plan: string;
	public useCredit: boolean;
	public statesEmployee: string[];
	public industry: string|null;
	public type: string;
	public country: Country;
	public totalEmployees: number;
	public isSso: boolean;


	constructor() {
		this.accountInfo = {} as UserInfo;
		this.userType = 0;
		this.plan = plans[0]; // Default plan
		this.useCredit=false;
		this.statesEmployee=[];
		this.industry = null;
		this.type = '1';
		this.country = {
			key: "US",
			value: "United States"
		};
		this.totalEmployees = 0;
		this.isSso = false;

	}

	public getAccountInfo(): UserInfo {
		return this.accountInfo;
	}

	public getPlan(): string {
		return this.plan;
	}

	public setPlan(plan:string): void {
		this.plan = plan;
	}

		public setAccountInfo(account:UserInfo): void {
		this.accountInfo = account;
	}


}
