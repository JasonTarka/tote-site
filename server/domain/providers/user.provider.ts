'use strict';
import {Database} from "./database";
import {NotFound} from "../../utils/errors";
import {User} from "../data/user";
import {Permission} from "../data/permission";

export class UserProvider {

	private get _db():Database {
		return Database.instance;
	}

	createUser( user:User ):Promise<User> {
		let sql = 'INSERT INTO users(username, password, salt, playerId) ' +
				  'VALUES(?, ?, ?, ?)',
			values = [user.username, user.password, user.salt, user.playerId];

		return this._db.executeInsert( sql, values )
			.then( newId => this.fetchUser( newId ) );
	}

	fetchUsers():Promise<User[]> {
		let sql = 'SELECT * FROM users WHERE deleted = 0';

		return new Promise( ( resolve, reject ) => {
			this._db.executeQuery( sql )
				.then(
					rows => resolve( rows.map( createUser ) )
				)
				.catch( reject );
		} );
	}

	fetchUser( userId:number ):Promise<User> {
		let sql = 'SELECT * FROM users WHERE id = ? AND deleted = 0';

		return new Promise( ( resolve, reject ) => {
			this._db.executeQuery( sql, [userId] )
				.then( users => {
					if( !users || users.length === 0 ) {
						return reject(
							new NotFound( 'User not found' )
						);
					}
					resolve( createUser( users[0] ) );
				} )
				.catch( reject );
		} );
	}

	/**
	 * Try to fetch the user matching the given username.
	 * If no user is found then the promise will be resolved with {null}.
	 */
	tryFetchUserByUsername( username:string ):Promise<User> {
		let sql = 'SELECT * FROM users WHERE username = ? AND deleted = 0';

		return new Promise( ( resolve, reject ) => {
			this._db.executeQuery( sql, [username] )
				.then( users => {
					if( !users || users.length === 0 ) {
						return resolve( null );
					}
					resolve( createUser( users[0] ) );
				} )
				.catch( reject );
		} );
	}

	fetchPermissionsForUser( userId:number ):Promise<Permission[]> {
		let sql = 'SELECT permissionId FROM user_permissions WHERE userId = ?',
			params = [userId];

		return this._db.executeQuery( sql, params )
			.then( rows => rows.map( createPermission ) );
	}

	public updateUser( user:User ):Promise<void> {
		return this._db.updateDataObject( user, 'users' );
	}
}

function createUser( row ):User {
	let user = new User(
		row.id,
		row.username,
		row.password,
		row.salt,
		row.playerId
	);
	return user;
}

function createPermission( row ) {
	let permission = new Permission(
		row.id || row.permissionId,
		row.name
	);
	return permission;
}
