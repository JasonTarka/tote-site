'use strict';

import {IController} from "./controllers/controller";
import {DataObject} from "../domain/data/dataObject";
import {Route} from "./data/route";

import {pad} from "../utils/utils";
let util = require( 'util' ); // Node's util

export class RouteHandler {

	private _authMethod;
	private _express;
	private _parentRouter;
	private _baseRoute:string;

	constructor(
		express,
		parentRouter,
		authMethod,
		baseRoute?:string
	) {
		this._express = express;
		this._parentRouter = parentRouter;
		this._authMethod = authMethod;
		this._baseRoute = baseRoute ? baseRoute : '/api';

		this._configuredParams = new Set<string>();
	}

	private _configuredParams:Set<string>;

	public registerController( controller:IController ) {
		let router = this._express.Router(),
			routingInfo = controller.routing;

		routingInfo.routes.forEach(
			route => {
				util.log(
					'Registering %s %s %s',
					pad( route.authenticated ? 'Authenticated' : '', 13 ),
					pad( route.method, 5 ),
					this._baseRoute + routingInfo.baseRoute + route.route
				);
				this.registerRoute( controller, route, router );
			}
		);

		this._parentRouter.use( routingInfo.baseRoute, router );

		return this;
	}

	protected registerRoute( controller:IController, route:Route, router:any ) {
		let method = route.method ? route.method.toLowerCase() : 'get',
			routerMethod;

		if( router[method] ) {
			routerMethod = router[method];
		} else {
			throw new Error( 'Invalid HTTP verb: ' + method );
		}

		this.setupRouteParams( route.route, router );

		// Setup the actual handler
		let handle = ( req, res, next ) => this.handleRequest(
			req,
			res,
			next,
			controller,
			route.handler
		);

		if( route.authenticated ) {
			routerMethod.call( router, route.route, this._authMethod, handle );
		} else {
			routerMethod.call( router, route.route, handle );
		}
	}

	protected setupRouteParams( route:string, router:any ) {
		let matches = route.match( /[/]:([^:/]+)/g );
		if( !matches ) {
			return;
		}

		matches.map( match => match.replace( '/:', '' ) )
			.filter( name => !this._configuredParams.has( name ) )
			.forEach( name => {
				/* tslint:disable:no-unused-variable */
				router.param( name, ( req, res, next, value ) => {
					util.log( 'Route param "%s" passed with value "%s"', name, value );
					req.routeParams = req.routeParams || {};
					req.routeParams[name] = value;
					next();
				} );
				/* tslint:enable:no-unused-variable */
				this._configuredParams.add( name );
			} );
	}

	protected handleRequest( req, res, next, controller:IController, handler:Function ) {
		let requestData = {
				body: req.body,
				routeParams: req.routeParams,
				user: req.user
			},
			result = handler.call( controller, requestData );

		if( !result ) {
			return res.send();
		}

		this.convertResult( result )
			.then( x => res.send( x ) )
			.catch( x => next( x instanceof Error ? x : new Error( x ) ) );
	}

	protected convertResult( data ):Promise<any> {
		return new Promise( ( resolve, reject ) => {
			if( data instanceof Error ) {
				return reject( data );
			}

			if( data instanceof DataObject ) {
				var objData = <DataObject>data.data;

				var promises = Object.keys( objData ).map(
					key => this.convertResult( objData[key] )
						.then( converted => objData[key] = converted )
				);

				return Promise.all( promises )
					.then( () => resolve( objData ) )
					.catch( reject );
			}

			if( data instanceof Promise ) {
				return data.then( x => this.convertResult( x ) )
					.then( resolve )
					.catch( reject );
			}

			if( data instanceof Array
				&& data.length
				&& (data[0] instanceof DataObject || data[0] instanceof Promise)
			) {
				return Promise.all( data.map( x => this.convertResult( x ) ) )
					.then( resolve, reject );
			}

			resolve( data );
		} );
	}
}
