'use strict';
import {InvalidParameter} from "../../../../server/utils/errors";
import {NotAuthorized} from "../../../../server/utils/errors";
import {Permission} from "../../../../server/domain/data/permission";
import {User} from "../../../../server/domain/data/user";
import {UserProvider} from "../../../../server/domain/providers/user.provider";

import {generateRandomString} from "../../../../server/utils/utils";
import {getInstance} from "../../../../server/utils/utils";
import {registerMockInstance} from "../../../testUtils";
import {requireUncached} from "../../../testUtils";
import {setToArray} from "../../../../server/utils/utils";
import {verifyPassword} from "../../../../server/utils/password";

describe( 'User data object', () => {
	let should = require( 'should' ),
		mockery = require( 'mockery' ),
		sinon = require( 'sinon' );

	var User;

	const id = 56,
		username = 'my username',
		password = '123456',
		salt = 'pepper',
		playerId = 45;

	var user:User,
		userProviderMock:UserProviderMock;

	before( () => {
		mockery.enable( {
			warnOnUnregistered: false
		} );
	} );

	after( () => {
		mockery.disable();
	} );

	beforeEach( () => {
		userProviderMock = new UserProviderMock();
		registerMockInstance(
			UserProvider,
			userProviderMock
		);

		// Ensure we're not using the cached version from other tests
		User = requireUncached( 'server/domain/data/user' ).User;
		user = new User( id, username, password, salt, playerId );
	} );

	afterEach( () => {
		mockery.deregisterAll();
	} );

	it( 'should populate fields from constructor', () => {
		user = new User( id, username, password, salt, playerId );

		user.id.should.equal( id );
		user.username.should.equal( username );
		user.password.should.equal( password );
		user.salt.should.equal( salt );
		user.playerId.should.equal( playerId );
	} );

	it( 'should not be dirty from the start', () => {
		user.isDirty.should.be.false();
	} );

	it( 'should return a correct data object', () => {
		user.data.should.have.properties( {
			id: id,
			username: username,
			playerId: playerId
		} );

		user.data.should.not.have.property( 'password' )
			.and.not.have.property( 'salt' );
	} );

	describe( 'changing password', () => {
		it( 'throws error if password is not a string', () => {
			let localUser:any = user;
			(() => localUser.password = 42)
				.should.throw( InvalidParameter );
		} );

		it( 'throws error if password is too short', () => {
			(() => user.password = 'short')
				.should.throw( InvalidParameter );
		} );

		it( 'generates a new password and salt, and marks them dirty', () => {
			const oldPassword = user.password,
				oldSalt = user.salt;

			user.password = 'some new password';

			user.password.should.not.equal( oldPassword );
			user.salt.should.not.equal( oldSalt );

			user.isDirty.should.be.true();
			setToArray( user.dirtyFields )
				.should.containEql( 'password' )
				.and.containEql( 'salt' );
		} );

		it( 'validates with the new password and salt', done => {
			const password = 'my new password';
			user.password = password;

			verifyPassword( user.password, password, user.salt )
				.then( result => {
					result.should.be.true();
					done();
				} )
				.catch( done );
		} );

		it( 'should not validate with the wrong salt', done => {
			const password = 'my new password';
			user.password = password;

			verifyPassword( user.password, password, 123 )
				.then( result => {
					result.should.be.false();
					done();
				} )
				.catch( done );
		} );
	} );

	describe( 'dirtying fields', () => {
		[
			{field: 'username', val: 'another_username'},
			{field: 'password', val: 'another password'},
			{field: 'playerId', val: 34}
		].forEach( change => {
			it( 'should mark ' + change.field + ' as dirty', () => {
				user[change.field] = change.val;
				user.dirtyFields.has( change.field ).should.be.true();

				user.isDirty.should.be.true();
			} );
		} );
	} );

	describe( 'has permission', () => {
		it( 'resolves when user has permission', done => {
			const permissionId = 2;
			let providerMock:any = userProviderMock;

			// Setup
			providerMock.permissionsForUser.push( permissionId );

			sinon.spy( providerMock, 'fetchPermissionsForUser' );

			// Test
			user.hasPermission( permissionId )
				.then( () => {
					providerMock.fetchPermissionsForUser.called
						.should.be.true();
					done();
				} )
				.catch( done );
		} );

		it( 'rejects with NotAuthorized when user does not have permission', done => {
			userProviderMock.permissionsForUser.push( 2 );

			user.hasPermission( 3 )
				.then( () => done(
					new Error( 'Should not have had permission' )
				) )
				.catch( err => {
					should( err ).be.instanceof( NotAuthorized );

					done();
				} )
				.catch( done );
		} );

		it( 'only calls the database on first call', done => {
			const permissionId = 2;
			let providerMock:any = userProviderMock;

			// Setup
			userProviderMock.permissionsForUser.push( permissionId );

			sinon.spy( providerMock, 'fetchPermissionsForUser' );

			// Test
			user.hasPermission( permissionId )
				.then( () => {
					providerMock.fetchPermissionsForUser.calledOnce
						.should.be.true();

					return user.hasPermission( permissionId )
						.then( () => {
							providerMock.fetchPermissionsForUser.callCount
								.should.equal( 1 );

							done();
						} );
				} )
				.catch( done );
		} );
	} );

	class UserProviderMock {
		constructor() {
			let Permission = require( '../../../../server/domain/data/permission' );

			this.permissionsForUser = [];
		}

		permissionsForUser:number[];

		fetchPermissionsForUser( userId ) {
			userId.should.equal( user.id );
			return new Promise( resolve => resolve(
				this.permissionsForUser.map( x => new Permission( x, 'Fake Permission' ) )
			) );
		}
	}
} );
