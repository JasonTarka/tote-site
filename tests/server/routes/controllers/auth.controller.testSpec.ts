'use strict';
import {AuthController} from "../../../../server/routes/controllers/auth.controller";
import {AuthProvider} from "../../../../server/domain/providers/auth.provider";
import {AuthSession} from "../../../../server/domain/data/authSession";
import {Forbidden} from "../../../../server/utils/errors";
import {User} from "../../../../server/domain/data/user";
import {UserProvider} from "../../../../server/domain/providers/user.provider";

import {registerMockInstance} from "../../../testUtils";
import {requireUncached} from "../../../testUtils";

describe( 'Auth Controller', () => {
	let should = require( 'should' ),
		sinon = require( 'sinon' ),
		jwt = require( 'jsonwebtoken' );
	require( 'should-sinon' );

	const username = 'Darth.Vader',
		password = 'the password of the user',
		jwtSecret = '12345';

	var AuthController,
		controller:AuthController,
		user:User,
		userProviderMock:UserProviderMock,
		authProviderMock:AuthProviderMock,
		data;

	beforeEach( () => {
		userProviderMock = new UserProviderMock();
		registerMockInstance(
			UserProvider,
			userProviderMock
		);

		authProviderMock = new AuthProviderMock();
		registerMockInstance(
			AuthProvider,
			authProviderMock
		);

		user = new User( 42 );
		user.username = username;
		user.password = password;
		user.markClean();

		userProviderMock.user = user;
		data = {
			body: {
				username: username,
				password: password
			}
		};

		AuthController = requireUncached(
			'server/routes/controllers/auth.controller'
		).AuthController;

		process.env.TOTE_JWT_SECRET = jwtSecret;
		controller = new AuthController();
	} );

	describe( 'login', () => {
		it( 'rejects with Forbidden when no user is found', done => {
			userProviderMock.user.username = 'something.else';

			controller.login( data )
				.then(
					() => done( new Error( 'Should have thrown error' ) ),
					err => {
						err.should.be.instanceOf( Forbidden );
						done();
					}
				)
				.catch( done );
		} );

		it( 'rejects with Forbidden when password is wrong', done => {
			data.body.password = 'the wrong password';

			controller.login( data )
				.then(
					() => done( new Error( 'Should have been rejected' ) ),
					err => {
						err.should.be.instanceOf( Forbidden );
						done();
					}
				)
				.catch( done );
		} );

		describe( 'valid credentials', () => {
			it( 'creates a new auth session', done => {
				sinon.spy( authProviderMock, 'createAuthSession' );

				controller.login( data )
					.then( () => {
						authProviderMock.createAuthSession
							.should.be.calledWith( user.id );
						done();
					} )
					.catch( done );
			} );

			it( 'eventually returns a valid JWT', done => {
				controller.login( data )
					.then( result => {
						should( result ).not.be.undefined()
							.and.not.be.null()
							.and.have.property( 'token' );

						let obj = jwt.verify( result.token, jwtSecret );
						obj.should.have.properties( {
							id: user.id,
							username: username,
							sessionKey: authProviderMock.sessionKey
						} );

						done();
					} )
					.catch( done );
			} );
		} );
	} );

	class UserProviderMock {
		user:User;

		tryFetchUserByUsername( usernameToFind ) {
			return new Promise( ( resolve ) => resolve(
				this.user && this.user.username === usernameToFind
					? this.user
					: null
			) );
		}
	}

	class AuthProviderMock {
		constructor() {
			this.sessionKey = 'a1b2c3d4';
		}

		sessionKey:string;

		createAuthSession() {
			return new AuthSession(
				user.id,
				this.sessionKey,
				new Date(),
				new Date( '2030-10-10' ),
				new Date()
			);
		}
	}
} );
