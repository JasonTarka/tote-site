'use strict';

export class Route {
	constructor(
		route:string,
		handler:Function,
		method?:string,
		authenticated?:boolean
	) {
		this.route = route.startsWith( '/' ) ? route : '/' + route;
		this.handler = handler;
		this.method = method || 'GET';
		this.authenticated = !!authenticated;
	}

	route:string;
	handler:Function;
	method:string;
	authenticated:boolean;
}
