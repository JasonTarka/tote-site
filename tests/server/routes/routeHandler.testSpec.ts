'use strict';

import {IController} from "../../../server/routes/controllers/controller";
import {DataObject} from "../../../server/domain/data/dataObject";
import {Route} from "../../../server/routes/data/route";
import {RoutingInfo} from "../../../server/routes/data/routingInfo";
import {RouteHandler} from "../../../server/routes/routeHandler";
import SinonSpy = Sinon.SinonSpy;

import {clone} from "../../../server/utils/utils";

let should = require( 'should' ),
	sinon = require( 'sinon' );

describe( 'Route Handler tests', () => {
	require( 'should-sinon' );

	var routeHandler:RouteHandler,
		testController:TestController,
		parentRouter:RouterMock,
		authenticator:Function;

	beforeEach( () => {
		testController = new TestController();
		parentRouter = new RouterMock();
		authenticator = () => {};

		let expressMock = {
			Router: () => new RouterMock()
		};

		routeHandler = new RouteHandler( expressMock, parentRouter, authenticator );
	} );

	describe( 'registering a route', () => {

		it( 'adds a router for the base route', () => {
			routeHandler.registerController( testController );

			let childRouter = getChildRouter();
			should( childRouter ).not.be.null()
				.and.not.be.undefined();
			childRouter.should.be.instanceOf( RouterMock );
		} );

		it( 'registers a handler for the route', () => {
			routeHandler.registerController( testController );

			let childRouter = getChildRouter(),
				registered = childRouter.registered.get( '/' );
			should( registered ).not.be.null()
				.and.not.be.undefined();

			registered.handler.should.be.Function();
			registered.method.should.equal( 'GET' );
			should( registered.authenticator ).be.null();
		} );

		it( 'throws an error on invalid HTTP verbs', () => {
			testController.addRoute( new Route(
				'/something',
				function() {
				},
				'BAD_VERB'
			) );

			should(
				() => routeHandler.registerController( testController )
			).throw();
		} );

		it( 'registers non-GET verbs', () => {
			testController.addRoute( new Route(
				'/something',
				function() {
				},
				'POST'
			) );

			routeHandler.registerController( testController );

			let childRouter = getChildRouter(),
				registered = childRouter.registered.get( '/something' );
			should( registered ).not.be.null()
				.and.not.be.undefined();

			registered.handler.should.be.Function();
			registered.method.should.equal( 'POST' );
			should( registered.authenticator ).be.null();
		} );
	} );

	describe( 'handling incoming requests', () => {
		var childRouter:RouterMock,
			route = '/spy/:param/:spy',
			spy:SinonSpy;

		beforeEach( () => {
			spy = sinon.spy( function() {
				// `testController` should be used as the `this` in `.call()`
				this.should.equal( testController );
			} );
			testController.addRoute( new Route( route, spy ) );

			routeHandler.registerController( testController );
			childRouter = getChildRouter();
		} );

		it( 'calls the controller\'s handler', () => {
			handleRequest();

			spy.should.be.calledOnce();
		} );

		it( 'passes along route parameters', () => {
			let expectedParams = {
				'param': 'some value',
				'spy': 54
			};

			childRouter.processParam( 'param', expectedParams['param'] );
			childRouter.processParam( 'spy', expectedParams['spy'] );

			handleRequest();
			spy.should.be.calledWith( sinon.match(
				{ routeParams: expectedParams }
			) );
		} );

		it( 'passes along body and user', () => {
			let user = { id: 4, name: 'This is a user' },
				body = { data: 'something', hello: 'hi!' };

			childRouter.request.user = user;
			childRouter.request.body = body;

			handleRequest();
			spy.should.be.calledWith( sinon.match(
				{ user: user, body: body }
			) );
		} );

		function handleRequest() {
			let handler = childRouter.registered.get( route ).handler;
			handler( childRouter.request, { send: () => {} }, () => {} );
		}
	} );

	describe( 'authenticated routes', () => {
		it( 'registers an authenticator for authenticated routes', () => {
			var route = new Route(
				'/authenticated',
				() => {},
				'GET',
				true
			);

			testController.addRoute(route);
			routeHandler.registerController(testController);

			let childRouter = getChildRouter(),
				registered = childRouter.registered.get( route.route );

			should( registered.authenticator ).not.be.undefined()
				.and.not.be.null();
			registered.authenticator.should.equal( authenticator );

			// Test that it also passes the regular handler
			should( registered.handler ).not.be.undefined()
				.and.not.be.null()
				.and.be.Function();
		} );
	} );

	describe( 'processing returned data', () => {
		var childRouter:RouterMock,
			retVal,
			route = '/process';

		beforeEach( () => {
			testController.addRoute( new Route(
				route,
				() => retVal
			) );

			routeHandler.registerController( testController );
			childRouter = getChildRouter();
		} );

		it( 'calls `res.send()`', done => {
			retVal = 5;
			handleRequest( retVal, done );
		} );

		it( 'calls `next()` on error', done => {
			retVal = new Error( 'May the force be with you' );
			handleRequest( retVal, done );
		} );

		it( 'returns basic types', () => {
			var expected = [
				43,
				'hello',
				undefined, // TODO: Why can't this be `null`?
				34.7,
				{ foo: 'bar' },
				['a', 'b', 'c']
			];

			expected.forEach( val => {
				retVal = val;
				// Assumes that `next()` will eventually get called
				handleRequest( val, () => {} );
			} );
		} );

		it( 'returns data from a `DataObject`', done => {
			let data = { foo: 'bar', hi: 'bye' };
			retVal = new DataObject( data );

			handleRequest( data, done );
		} );

		it( 'returns data from array of `DataObject`s', done => {
			let expected = [
				{ a: '1' },
				{ b: '2' },
				{ c: '3' }
			];
			retVal = expected.map( data => new DataObject( data ) );

			handleRequest( expected, done );
		} );

		it( 'recursively returns `DataObject`s', done => {
			let expected = {
					a: 1,
					b: 2,
					child: {
						c: 3,
						d: 4
					}
				},
				child = new DataObject( expected.child ),
				parent = new TestDataObject( clone( expected ) );
			parent.setFieldVal( 'child', child );

			retVal = parent;
			handleRequest( expected, done );
		} );

		it( 'returns data from a `Promise`', done => {
			let expected = 'this is some data';

			retVal = new Promise( resolve => resolve( expected ) );
			handleRequest( expected, done );
		} );

		it( 'processes a `DataObject` from a `Promise`', done => {
			let expected = {
				one: 1,
				two: 2,
				ten: 'ten'
			};

			retVal = new Promise(
				resolve => resolve( new DataObject( expected ) )
			);
			handleRequest( expected, done );
		} );

		it( 'processes an array of `DataObject`s from a `Promise`', done => {
			let expected = [
				{ a: '1' },
				{ b: '2' },
				{ c: '3' }
			];
			retVal = new Promise(
				resolve => resolve( expected.map( data => new DataObject( data ) ) )
			);

			handleRequest( expected, done );
		} );

		it( 'catches error from a `Promise`', done => {
			let expected = new Error( 'error for testing error behaviour' );

			retVal = new Promise(
				/* tslint:disable:no-unused-variable */
				(resolve, reject) => reject( expected )
				/* tslint:enable:no-unused-variable */
			);
			handleRequest( expected, done );
		} );

		it( 'turns rejected non-`Error`s into `Error`s', done => {
			let message = 'Whatever shall be, shall be.',
				expected = new Error( message );

			retVal = new Promise(
				/* tslint:disable:no-unused-variable */
				(resolve, reject) => reject( message )
				/* tslint:enable:no-unused-variable */
			);
			handleRequest( expected, done );
		} );

		it( 'processes `Promise`s in a `DataObject`\'s data', done => {
			let expected = {
					a: 'eh',
					one: 1,
					child: {
						b: 'bee',
						two: 2
					}
				},
				parent = new TestDataObject( clone( expected ) ),
				child = new DataObject( expected.child );
			parent.setFieldVal(
				'child',
				new Promise( resolve => resolve( child ) )
			);

			retVal = parent;
			handleRequest( expected, done );
		} );

		it( 'processes an array of `Promise`s', done => {
			let expected = [
				{ a: 'eh', b: 'bee' },
				{ c: 'sea', d: 'Dee' },
				{ e: 'Eeeeh!', f: 'Fa-la-la' }
			];

			retVal = expected.map( x => new Promise( resolve => resolve( x ) ) );
			handleRequest( expected, done );
		} );

		function handleRequest( expected, done ) {
			let handler = childRouter.registered.get( route ).handler,
				next = actual => {
					if( !(expected instanceof Error) ) {
						var message = 'Should not have called next;\n'
									  + <Error>actual.stack;

						return done(
							new Error( message )
						);
					}
					should( actual ).deepEqual( expected );
					done();
				},
				send = actual => {
					if( expected instanceof Error ) {
						var message = 'Should not have called res.send;\n'
									  + <Error>actual.stack;

						return done(
							new Error( message )
						);
					}
					should( actual ).deepEqual( expected );
					done();
				};
			handler( childRouter.request, { send: send }, next );
		}
	} );

	function getChildRouter():RouterMock {
		return parentRouter.usedRouters.get(
			testController.routing.baseRoute
		);
	}
} );

class TestController implements IController {

	constructor() {
		this._routes = [
			new Route(
				'/',
				this.list,
				'GET',
				false
			)
		];
	}

	private _routes:Array<Route>;

	public list() {
	}

	public addRoute( route:Route ) {
		this._routes.push( route );
	}

	public get routing():RoutingInfo {
		return new RoutingInfo(
			'/test',
			this._routes
		);
	}

}

class RouterMock {

	constructor() {
		this.params = new Map<string, any>();
		this.registered = new Map<string, any>();
		this.request = {};
		this.usedRouters = new Map<string, any>();
	}

	public params:Map<string, Function>;
	public registered:Map<string, {authenticator:Function, handler: Function, method:string}>;
	public request:{routeParams?:Array<any>, body?:any, user?:any};
	public usedRouters:Map<string, RouterMock>;

	public get( route:string, authenticator, handler ) {
		this.register( route, authenticator, handler, 'GET' );
	}

	public post( route:string, authenticator, handler ) {
		this.register( route, authenticator, handler, 'POST' );
	}

	public use( path, router ) {
		this.usedRouters.set( path, router );
	}

	public param( name, handler:Function ) {
		this.params.set( name, handler );
	}

	public processParam( name:string, value:any ) {
		let handler = this.params.get( name );
		if( !handler ) {
			throw new Error( 'No handler for param: ' + name );
		}

		var next = sinon.spy();
		handler.call( this, this.request, {}, next, value );

		next.should.be.calledOnce();
	}

	private register( route:string, authenticator, handler, verb ) {
		this.registered.set( route, {
			authenticator: handler ? authenticator : null,
			handler: handler ? handler : authenticator,
			method: verb
		} );
	}
}

class TestDataObject extends DataObject {
	public setFieldVal( name:string, value ):TestDataObject {
		this._setFieldVal( name, value );
		return this;
	}

	public getFieldVal( name:string ) {
		return this._getFieldVal( name );
	}
}
