import UserInfo from './user-info';
import { DataHandling } from '../data-handling/data-handling';
import { Constants } from '../utilities/constants';
import { DataGenerate } from '../utilities/data-generate';
import { plans } from 'src/constant/static-data';
import { format } from 'date-fns';

export interface ICustomer {

	getAccountInfo:() => UserInfo;

	getPlan:() => string ;

	setPlan:(plan:string) => void;

	setAccountInfo:(account:UserInfo) => void;



}
