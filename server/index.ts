'use strict';
import {HttpError} from "./utils/errors";
import {NotFound} from "./utils/errors";

import {setupControllers} from "./routes/routes";

let express = require( 'express' ),
	logger = require( 'morgan' ),
	bodyParser = require( 'body-parser' ),
	util = require( 'util' );

let app = express(),
	development = app.get( 'env' ) === 'development';

app.use( logger( 'dev' ) );
app.use( bodyParser.json() );

setupControllers( '/api', app );

/* tslint:disable:no-unused-variable */
// Handle anything that doesn't have a route
app.use( ( req, res, next ) => {
	let err = new NotFound( 'Route does not exist' );
	next( err );
} );

// General error handler
app.use( ( err:HttpError, req, res, next ) => {
	console.error( err.message );
	console.error( err.stack );

	var ret:any = {
		error: err.name,
		reason: err.message
	};

	if( development ) {
		ret.stack = err.stack;
	}

	res.status( err.status || 500 )
		.send( ret );
} );

/* tslint:enable:no-unused-variable */

// Start the server
let server = app.listen( 3000, () => {
	let host = server.address().address,
		port = server.address().port;

	util.log( 'App listening at %s:%d', host, port );
} );
