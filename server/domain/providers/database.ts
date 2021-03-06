'use strict';
import {DataObject} from "../data/dataObject";
import {IMySql} from "mysql";
import {IPool} from "mysql";

import {generateUpdateStatement} from "./providerTools";

let mysql:IMySql = require( 'mysql' );

export class Database {
	constructor( host:string, database:string, user:string, password:string ) {
		this._pool = mysql.createPool( {
			host: host,
			database: database,
			user: user,
			password: password,

			// Pool settings
			connectionLimit: 100,
			debug: false
		} );
	}

	private _pool:IPool;

	private static _instance:Database;
	public static get instance():Database {
		if( this._instance == null ) {
			this._instance = new Database(
				process.env.TOTE_DB_HOST,
				process.env.TOTE_DB_DATABASE,
				process.env.TOTE_DB_USER,
				process.env.TOTE_DB_PASSWORD
			);
		}

		return this._instance;
	}

	executeQuery( sql:string, params?:any[] ):Promise<any[]> {
		params = params || [];
		return new Promise( ( resolve, reject ) => {
			this._conn
				.then( ( connection:any ) => {
					connection.query( sql, params, ( err, rows ) => {
						connection.release();
						if( err ) {
							return reject( err );
						}
						resolve( rows );
					} );
				} )
				.catch( reject );
		} );
	}

	/**
	 * Execute an INSERT query, getting the newly inserted ID as a result
	 * @param sql The SQL to execute
	 * @param params The ordered parameters of the SQL
	 */
	executeInsert( sql:string, params:any[] ):Promise<number> {
		return this.executeQuery( sql, params )
			.then( ( result:any ) => result.insertId );
	}

	/**
	 * Execute a non-query command (UPDATE, DELETE, etc.) without getting any
	 * return value from the promise.
	 * @param sql
	 * @param params
	 * @returns {Promise}
	 */
	executeNonQuery( sql:string, params?:any[] ) {
		return new Promise( ( resolve, reject ) => {
			this.executeQuery( sql, params )
				.then( () => resolve() )
				.catch( reject );
		} );
	}


	public updateDataObject( obj:DataObject, table:string ):Promise<void> {
		return new Promise<void>( ( resolve, reject ) => {
			if( !obj.isDirty ) {
				return resolve();
			}

			let statement = generateUpdateStatement( obj, table );

			this.executeNonQuery( statement.sql, statement.params )
				.then( () => {
					obj.markClean();
					resolve();
				} )
				.catch( reject );
		} );
	}

	get _conn() {
		return new Promise( ( resolve, reject ) => {
			this._pool.getConnection( ( err, connection ) => {
				if( err ) {
					connection.release();
					return reject( new Error( 'Error getting database connection' ) );
				}

				resolve( connection );
			} );
		} );
	}
}
