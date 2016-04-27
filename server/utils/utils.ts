'use strict';

import crypto = require( 'crypto' );

export function getInstance( type ) {
	var self:any = getInstance;

	if( !self.instances ) {
		self.instances = new WeakMap();
	}

	if( !self.instances.has( type )
		|| !(self.instances.get( type ) instanceof type)
	) {
		let obj = new type();
		self.instances.set( type, obj );
	}

	return self.instances.get( type );
}

export function clone( obj ) {
	var copy;

	if( obj == null || typeof obj !== 'object' ) {
		return obj;
	}
	if( obj instanceof Array ) {
		copy = [];
		obj.forEach( x => copy.push( x ) );
		return copy;
	}
	if( obj instanceof Date ) {
		copy = new Date();
		copy.setTime( obj.getTime() );
		return copy;
	}
	if( obj instanceof Promise ) {
		return obj; // Can't really copy promises
	}
	if( obj instanceof Object ) {
		copy = new obj.constructor();

		Object.keys( obj )
			.filter( x => obj.hasOwnProperty( x ) )
			.forEach( key => {
				copy[key] = clone( obj[key] );
			} );
	}

	return copy;
}

export function generateRandomString( maxLength:number ):string {
	let length = Math.floor( maxLength / 2 );

	return crypto.randomBytes( length )
		.toString( 'hex' );
}

export function pad( input:string, space:number ) {
	let str = input.toString(),
		arrLength = space - str.length + 1;

	if( arrLength <= 0 ) {
		return str;
	}

	str += new Array( arrLength ).join( ' ' );
	return str;
}

export function setToArray<T>( set:Set<T> ):T[] {
	if( !(set instanceof Set) ) {
		throw new Error( 'Not a set' );
	}

	let arr = [];
	set.forEach( x => arr.push( x ) );
	return arr;
}
