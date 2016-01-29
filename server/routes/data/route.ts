'use strict';

export class Route {
	constructor(
		route,
		handler,
		method?:string,
		authenticated?:boolean
	) {
		if( typeof route !== 'string' ) {
			throw new Error( '"route" is not valid' );
		}
		if( typeof handler !== 'function' ) {
			throw new Error( '"handler" must be a function' );
		}

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
