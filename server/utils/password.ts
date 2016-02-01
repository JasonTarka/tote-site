'use strict';

let scrypt = require( 'scrypt' );

// Maximum time to spend hashing (in seconds)
const MAX_TIME:number = process.env.TOTE_PASSWORD_TIME
	? parseFloat( process.env.TOTE_PASSWORD_TIME )
	: 0.9;

export function hashPassword( password:string, salt:string ):string {

	password = saltPassword( password, salt );

	let params = scrypt.paramsSync( MAX_TIME );
	let hashBuffer = scrypt.kdfSync( password, params );
	let hash = hashBuffer.toString( 'base64' );

	return hash;
}

export function verifyPassword( hash, password:string, salt:string ):Promise<boolean> {
	if( typeof hash === 'string' ) {
		hash = new Buffer( hash, 'base64' );
	} else if( !(hash instanceof Buffer) ) {
		throw new Error( 'hash must be a Buffer of base64-encoded string' );
	}

	password = saltPassword( password, salt );
	return scrypt.verifyKdf( hash, password );
}

function saltPassword( password:string, salt:string ):string {
	return salt + ' ' + password + salt;
}
