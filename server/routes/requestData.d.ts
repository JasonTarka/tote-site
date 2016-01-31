import {User} from "../domain/data/user";

export interface RequestData {
	user?:User;
	body?:any;
	routeParams?:any;
	queryParams?:any;
}