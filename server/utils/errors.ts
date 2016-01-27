'use strict';

class HttpError extends Error {
	constructor( message ) {
		super( message );
	}

	status: number;
}

/***** 4xx *****/

export class BadRequest extends HttpError {
	constructor( message ) {
		super( message || 'Bad Request Parameters' );
		this.name = 'Bad Request';
		this.status = 400;
	}
}

export class InvalidParameter extends BadRequest {
	constructor( message ) {
		super( message || 'Invalid Parameter' );
	}
}

export class NotAuthorized extends HttpError {
	constructor( message ) {
		super( message || 'Not Authorized' );
		this.name = 'Not Authorized';
		this.status = 401;
	}
}

export class Forbidden extends HttpError {
	constructor( message ) {
		super( message || 'Forbidden' );
		this.name = 'Forbidden';
		this.status = 403;
	}
}

export class NotFound extends HttpError {
	constructor( message ) {
		super( message || 'Not Found' );
		this.name = 'Not Found';
		this.status = 404;
	}
}

/***** 5xx *****/

export class InternalServerError extends HttpError {
	constructor( message ) {
		super( message );
		this.name = 'Internal Server Error';
		this.status = 500;
	}
}

/**
 * For when a function has not been implemented, or correctly overridden.
 * Should never reach the user, but results in a generic 500 error.
 */
export class FunctionNotImplemented extends InternalServerError {
	constructor( message ) {
		super( message || 'Function not implemented' );
	}
}

/**
 * For when a feature has not been implemented in the API.
 * Specifically a 501 error.
 */
export class FeatureNotImplemented extends InternalServerError {
	constructor( message ) {
		super( message || 'Not Implemented' );
		this.status = 501;
	}
}
