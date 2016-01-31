'use strict';
import {AuthSession} from "../data/authSession";
import {Database} from "./database";
import {Forbidden} from "../../utils/errors";

import {generateRandomString} from "../../utils/utils";

export const SESSION_KEY_LENGTH = 20;

export class AuthProvider {
	constructor() {
		this._sessionLength = process.env.TOTE_SESSION_LENGTH_MINUTES
			? process.env.TOTE_SESSION_LENGTH_MINUTES
			: 300;
	}

	private _sessionLength: number;

	private get _db(): Database {
		return Database.instance;
	}

	private get _newValidUntilDate():Date {
		let date = new Date(),
			millis = this._sessionLength * 60 * 1000;
		date.setTime( date.getTime() + millis );

		return date;
	}

	createAuthSession( userId:number ):Promise<AuthSession> {
		let sql = 'INSERT INTO user_auth_sessions' +
				  '(userId, sessionKey, validUntilDate, lastUsedDate)' +
				  ' VALUES(?,?,?,?)',
			sessionKey = generateRandomString( SESSION_KEY_LENGTH ),
			params = [
				userId,
				sessionKey,
				this._newValidUntilDate,
				new Date()
			];

		return this._db.executeInsert( sql, params )
			.then( () => this.fetchAuthSession( userId, sessionKey ) );
	}

	fetchAuthSession( userId:number, sessionKey:string ): Promise<AuthSession> {
		let sql = 'SELECT userId, sessionKey, dateCreated, ' +
				  'validUntilDate, lastUsedDate' +
				  ' FROM user_auth_sessions' +
				  ' WHERE userId = ?' +
				  '   AND sessionKey = ?',
			params = [userId, sessionKey];

		return this._db.executeQuery( sql, params )
			.then( (rows: any[]) => {
				if( !rows || !rows.length ) {
					throw new Forbidden();
				}
				return createAuthSession( rows[0] );
			} );
	}

	markAuthSessionUsed( userId:number, sessionKey:string ) {
		let sql = 'UPDATE user_auth_sessions' +
				  ' SET validUntilDate = ?,' +
				  ' lastUsedDate = NOW()' +
				  ' WHERE userId = ?' +
				  ' AND sessionKey = ?',
			params = [
				this._newValidUntilDate,
				userId,
				sessionKey
			];

		return this._db.executeNonQuery( sql, params );
	}
}

function createAuthSession( row:any ):AuthSession {
	let session = new AuthSession(
		row.userId,
		row.sessionKey,
		row.dateCreated,
		row.validUntilDate,
		row.lastUsedDate
	);
	return session;
}
