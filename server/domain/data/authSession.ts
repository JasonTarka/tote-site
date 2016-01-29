'use strict';
import {AuthProvider} from "../providers/auth.provider";

import {getInstance} from "../../utils/utils";

export class AuthSession {
	constructor( userId, sessionKey, dateCreated, validUntil, lastUsed ) {
		this.userId = userId;
		this.sessionKey = sessionKey;
		this.dateCreated = new Date( dateCreated );
		this.validUntil = new Date( validUntil );
		this.lastUsed = new Date( lastUsed );
	}

	userId: number;
	sessionKey: string;
	dateCreated: Date;
	validUntil: Date;
	lastUsed: Date;

	get isValid(): boolean {
		let now = new Date();
		return now < this.validUntil;
	}

	markUsed() {
		let provider:AuthProvider = getInstance( AuthProvider );
		provider.markAuthSessionUsed( this.userId, this.sessionKey );
	}
}
