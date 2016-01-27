'use strict';
import {DataObject} from './dataObject';

let InvalidParameter = require( '../../utils/errors' ).InvalidParameter,
	playerProvider = require( '../providers/player.provider' );

export class Player extends DataObject {
	constructor( id, name, email, bio, imgPath, isActive ) {
		super( {
			id: id,
			name: name,
			email: email,
			bio: bio,
			imgPath: imgPath,
			isActive: isActive
		} );
	}

	get data() {
		return this._getFieldVals();
	}

	get identifierFields() {
		return ['id'];
	}

	// ----- id -----
	get id() {
		return this._getFieldVal( 'id' );
	}

	// ----- name -----
	get name() {
		return this._getFieldVal( 'name' );
	}

	set name( val ) {
		if( !val ) {
			throw new InvalidParameter( '"name" must not be empty' );
		}
		this._setFieldVal( 'name', val.toString() );
	}

	// ----- email -----
	get email() {
		return this._getFieldVal( 'email' );
	}

	set email( val ) {
		if( val
			&& !(val instanceof String)
			&& !val.match( /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i )
		) {
			throw new InvalidParameter( '"email" must be a valid email address' );
		}

		this._setFieldVal( 'email', val.toString() );
	}

	// ----- bio -----
	get bio() {
		return this._getFieldVal( 'bio' );
	}

	set bio( val ) {
		this._setFieldVal( 'bio', val.toString() );
	}

	// ----- imgPath -----

	get imgPath() {
		return this._getFieldVal( 'imgPath' );
	}

	set imgPath( val ) {
		val = val ? val.toString() : null;
		this._setFieldVal( 'imgPath', val );
	}

	// ----- imgPath -----

	get isActive() {
		return this._getFieldVal( 'isActive' );
	}

	set isActive( val ) {
		if( val === false || val === 0 || val === '0' || val === 'false' ) {
			val = false;
		} else if( val === true || val === 1 || val === '1' || val === 'true' ) {
			val = true;
		} else {
			throw new InvalidParameter( 'isActive must be a boolean' );
		}

		this._setFieldVal( 'isActive', val );
	}

	save() {
		if( !this.id ) {
			throw new Error( 'Cannot create player' );
		}

		return playerProvider().updatePlayer( this )
			.then( () => this );
	}
}
