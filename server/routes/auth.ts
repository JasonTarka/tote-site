'use strict';
import {AuthProvider} from "../domain/providers/auth.provider";
import {UserProvider} from "../domain/providers/user.provider";

import {getInstance} from "../utils/utils";

let passport = require( 'passport' ),
	JwtStrategy = require( 'passport-jwt' ).Strategy;

export function createAuthStrategy() {
	let options = {
		secretOrKey: process.env.TOTE_JWT_SECRET
	};

	passport.use(
		new JwtStrategy(
			options,
			( jwt, done ) =>
				validateSession( jwt.id, jwt.sessionKey )
					.then(
						userId => getInstance( UserProvider ).fetchUser( userId )
					)
					.then( user => done( null, user ) )
					.catch( () => done( null, false ) )
		)
	);

	return passport.authenticate( 'jwt', {session: false} );
}

function validateSession( userId, sessionKey ) {
	return new Promise( (resolve, reject) => {
		let provider:AuthProvider = getInstance( AuthProvider );

		provider.fetchAuthSession( userId, sessionKey )
			.then( authSession => {
				if( !authSession.isValid ) {
					return reject();
				}

				authSession.markUsed();
				resolve( userId );
			} )
			.catch( reject );
	} );
}
