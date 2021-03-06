'use strict';
import {DataObject} from "./dataObject";
import {ID} from "../../types/types";
import {InputConverter} from "../../utils/inputConverter";
import {InvalidParameter} from "../../utils/errors";
import {NotAuthorized} from "../../utils/errors";
import {UserProvider} from "../providers/user.provider";

import {generateRandomString} from "../../utils/utils";
import {getInstance} from "../../utils/utils";
import {hashPassword} from "../../utils/password";

export const MIN_PASSWORD_LENGTH = 8,
	MAX_SALT_LENGTH = 20;

let _permissions = new WeakMap();

export class User extends DataObject {
	constructor(
		id?:ID,
		username?:string,
		password?:string,
		salt?:string,
		playerId?:ID
	) {
		super( {
			id: id,
			username: username,
			password: password,
			salt: salt,
			playerId: playerId
		} );
	}

	get data() {
		let data:any = this._getFieldVals();
		delete data.password;
		delete data.salt;
		return data;
	}

	public get identifierFields():string[] {
		return ['id'];
	}

	// ----- id -----
	get id():ID {
		return this._getFieldVal( 'id' );
	}

	// ----- username -----
	get username():string {
		return this._getFieldVal( 'username' );
	}

	set username( val:string ) {
		if( !val ) {
			throw new InvalidParameter( '"username" must not be empty' );
		}

		if( typeof val !== 'string'
			|| !val.match( /^[a-zA-Z0-9_.-]+$/ )
		) {
			throw new InvalidParameter( '"username" is not valid' );
		}

		this._setFieldVal( 'username', val.toString() );
	}

	// ----- password -----
	get password():string {
		return this._getFieldVal( 'password' );
	}

	set password( val:string ) {
		if( !val
			|| typeof val !== 'string'
		) {
			throw new InvalidParameter( '"password" must not be empty' );
		} else if( val.length < MIN_PASSWORD_LENGTH ) {
			throw new InvalidParameter(
				'"password" must have at least ' + MIN_PASSWORD_LENGTH + ' characters'
			);
		}

		let salt = generateRandomString( MAX_SALT_LENGTH ),
			password = hashPassword( val, salt );

		this._setFieldVal( 'salt', salt );
		this._setFieldVal( 'password', password );
	}

	// ----- salt -----
	get salt():string {
		return this._getFieldVal( 'salt' );
	}

	// ----- player ID -----
	get playerId():ID {
		return this._getFieldVal( 'playerId' );
	}

	set playerId( val:ID ) {
		val = InputConverter.toId( val, 'playerId' );
		this._setFieldVal( 'playerId', val );
	}

	public save():Promise<User> {
		if( !this.id ) {
			throw new Error( 'Cannot create user' );
		}

		let provider:UserProvider = getInstance( UserProvider );
		return provider.updateUser( this )
			.then( () => this );
	}

	/**
	 * Checks if the user has a given permission or not.
	 * Resolves the promise if the permission is available, and rejects it
	 * otherwise.
	 *
	 * @param permissionId
	 */
	hasPermission( permissionId:ID ):Promise<void> {
		return new Promise<void>( ( resolve, reject ) => {
			if( !_permissions.get( this ) ) {
				let provider:UserProvider = getInstance( UserProvider );

				provider.fetchPermissionsForUser( this.id )
					.then( perms => {
						_permissions.set( this, new Set(
							perms.map( x => x.id )
						) );

						if( _permissions.get( this ).has( permissionId ) ) {
							resolve();
						} else {
							reject( new NotAuthorized() );
						}
					} )
					.catch( reject );
			} else if( _permissions.get( this ).has( permissionId ) ) {
				resolve();
			} else {
				reject( new NotAuthorized() );
			}
		} );
	}
}
