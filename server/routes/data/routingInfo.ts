'use strict';
import {Route} from "./route";

export class RoutingInfo {
	constructor(
		baseRoute:string,
		routes:Route[]
	) {
		if( typeof baseRoute !== 'string' ) {
			throw new Error( '"basePath" is not valid' );
		}
		if( !(routes instanceof Array && routes.length)
			&& !(routes instanceof Route)
		) {
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
