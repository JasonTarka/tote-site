'use strict';
import {AuthController} from "./controllers/auth.controller";
import {IController} from "./controllers/controller";
import {DataObject} from "../domain/data/dataObject";
import {PlayerController} from "./controllers/player.controller";
import {PositionController} from "./controllers/position.controller";
import {RequestData} from "./requestData";
import {Router} from "express";
import {RoutingInfo} from "./data/routingInfo";
import {ShowController} from "./controllers/show.controller";
import {UserController} from "./controllers/user.controller";

import {createAuthStrategy} from "./auth";
import {getInstance} from "../utils/utils";

let express = require( 'express' ),
	util = require( 'util' ), // Node's util
	authenticator = createAuthStrategy();

export var api:Router = express.Router();

let controllers:IController[] = [
	getInstance( AuthController ),
	getInstance( PlayerController ),
	getInstance( PositionController ),
	getInstance( ShowController ),
	getInstance( UserController )
];

controllers.forEach( controller => {
	let router = express.Router(),
		routingInfo:RoutingInfo = controller.routing,
		configuredParams = new Set();

	routingInfo.routes.forEach( route => {
		setupRouteParams( route.route );

		let routerMethod = router.get,
			method = route.method ? route.method.toLowerCase() : null;

		if( router[method] ) {
			routerMethod = router[method];

			util.log(
				'Adding %s %s /api%s',
				pad( route.authenticated ? 'Authenticated' : '', 13 ),
				pad( route.method, 5 ),
				routingInfo.baseRoute + route.route
			);
		} else {
			util.error(
				'Cannot bind route %s %s',
				route.method,
				('/api' + routingInfo.baseRoute + route.route)
			);
		}

		let handle = ( req, res, next ) => handleRequest(
			req,
			res,
			next,
			controller,
			route.handler
		);

		if( route.authenticated ) {
			routerMethod.call( router, route.route, authenticator, handle );
		} else {
			routerMethod.call( router, route.route, handle );
		}
	} );

	api.use( routingInfo.baseRoute, router );

	function setupRouteParams( route ) {
		let matches = route.match( /[/]:([^:/]*)/g );
		if( !matches ) {
			return;
		}

		matches.map( match => match.replace( '/:', '' ) )
			.filter( name => !configuredParams.has( name ) )
			.forEach( name => {
				/* tslint:disable:no-unused-variable */
				router.param( name, ( req, res, next, value ) => {
					util.log( 'Route param "%s" passed with value "%s"', name, value );
					req.routeParams = req.routeParams || {};
					req.routeParams[name] = value;
					next();
				} );
				/* tslint:enable:no-unused-variable */
				configuredParams.add( name );
			} );
	}
} );

function handleRequest( req, res, next, controller:IController, handler:Function ) {
	let requestData:RequestData = {
			routeParams: req.routeParams,
			body: req.body,
			user: req.user
		},
		result = handler.call( controller, requestData );

	if( result instanceof Promise ) {
		return result.then( convertResult )
			.then( x => res.send( x ) )
			.catch( next );
	}

	if( result instanceof Error ) {
		return next( result );
	}

	convertResult( result )
		.then( x => res.send( x ) );

	function convertResult( data ):Promise<any> {
		return new Promise( resolve => {
			// Assume that if the first element in the array is a DataObject
			// then it is an array of DataObjects.
			if( data instanceof Array
				&& data.length
				&& (data[0] instanceof DataObject )
			) {
				return Promise.all( data.map( convertResult ) )
					.then( resolve );
			}

			if( data instanceof Promise ) {
				return data.then( convertResult )
					.then( resolve );
			}

			if( data instanceof DataObject ) {
				data = data.data;

				let promises = Object.keys( data ).map(
					key => convertResult( data[key] )
						.then( val => val instanceof Promise ? convertResult( val ) : val )
						.then( val => data[key] = val )
				);

				return Promise.all( promises )
					.then( () => resolve( data ) );
			}

			resolve( data );
		} );
	}
}

function pad( input, space ) {
	let str = input.toString();
	str += new Array( space - str.length + 1 ).join( ' ' );
	return str;
}
