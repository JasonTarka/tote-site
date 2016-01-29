'use strict';
import {api} from "./routes/routes";
import {HttpError} from "./utils/errors";
import {NotFound} from "./utils/errors";
import {Router} from "express";

let express = require( 'express' ),
	logger = require( 'morgan' ),
	bodyParser = require( 'body-parser' ),
	util = require( 'util' );

let app = express(),
	development = app.get( 'env' ) === 'development';

app.use( logger( 'dev' ) );
app.use( bodyParser.json() );
app.use( '/api', api );

// Handle anything that doesn't have a route
app.use( ( req, res, next ) => {
	let err = new NotFound( 'Route does not exist' );
	next( err );
} );

// General error handler
app.use( ( err:HttpError, req, res, next ) => { // eslint-disable-line no-unused-vars
	/* eslint-disable no-console */
	console.error( err.message );
	console.error( err.stack );
	/* eslint-enable no-console */

	var ret: any = {
		error: err.name,
		reason: err.message
	};

	if( development ) {
		ret.stack = err.stack;
	}

	res.status( err.status || 500 )
		.send( ret );
} );

// Start the server
let server = app.listen( 3000, () => {
	let host = server.address().address,
		port = server.address().port;

	util.log( 'App listening at %s:%d', host, port );
} );
