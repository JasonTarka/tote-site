'use strict';
import {Route} from "./route";

export class RoutingInfo {
	constructor(
		baseRoute:string,
		routes:Route[]
	) {
		if( !(routes instanceof Array && routes.length) ) {
			throw new Error( '"routes" cannot be empty' );
		}

		this.baseRoute = baseRoute.startsWith( '/' )
			? baseRoute
			: '/' + baseRoute;

		this.routes = routes;
	}

	baseRoute:string;
	routes:Route[];
}
