'use strict';
import {ID} from "../../../../server/types/types";
import {NotAuthorized} from "../../../../server/utils/errors";
import {NotFound} from "../../../../server/utils/errors";
import {Permissions} from "../../../../server/utils/enums";
import {RequestData} from "../../../../server/routes/requestData";
import {User} from "../../../../server/domain/data/user";
import {UserController} from "../../../../server/routes/controllers/user.controller";
import {UserMock} from "../../../testUtils";
import {UserProvider} from "../../../../server/domain/providers/user.provider";

import {registerMockInstance} from "../../../testUtils";
import {requireUncached} from "../../../testUtils";

describe( 'User Controller', () => {
	let should = require( 'should' ),
		sinon = require( 'sinon' );

	const userId:ID = 78,
		username = 'admiral.ackbar',
		password = '12345',
		salt = 'abcde',
		playerId = 85;

	const requiredPermission = Permissions.ManageUsers;

	var UserController,
		controller:UserController,
		User,
		user:User,
		currUser:UserMock,
		userProviderMock:UserProviderMock,
		data:RequestData;

	beforeEach( () => {
		currUser = new UserMock( <number>userId + 1 );

		userProviderMock = new UserProviderMock();
		registerMockInstance( UserProvider, userProviderMock );

		data = {
			user: currUser,
			routeParams: {
				user: userId
			},
			body: {
				username: username,
				password: password,
				playerId: playerId
			}
		};

		User = requireUncached(
			'server/domain/data/user'
		).User;
		user = new User( userId, username, password, salt, playerId );

		UserController = requireUncached(
			'server/routes/controllers/user.controller'
		).UserController;
		controller = new UserController();
	} );

	describe( 'update', () => {
		it( 'enforces Manage Users permission', done => {
			currUser.hasManagePermission = false;
			sinon.spy( currUser, 'hasPermission' );

			controller.update( data )
				.then(
					() => done( new Error( 'Should have been rejected' ) )
				)
				.catch( err => {
					should( err ).be.instanceOf( NotAuthorized );
					currUser.hasPermission
						.should.be.calledWith( requiredPermission );
					done();
				} )
				.catch( done );
		} );

		it( 'allows updating own password when no permission', done => {
			currUser.id = user.id;
			currUser.hasManagePermission = false;
			data.body.password = 'some new password';

			sinon.spy( user, 'save' );

			controller.update( data )
				.then( () => {
					user.password.should.not.equal( password );
					user.save.should.be.called();
					done();
				} )
				.catch( err =>
					done( err || new Error( 'should not have been rejected' ) )
				);
		} );

		it( 'does not update non-password when no permission', done => {
			currUser.id = user.id;
			currUser.hasManagePermission = false;
			data.body = {
				password: 'some new password',
				username: 'userame.not.updated',
				playerId: 34
			};

			sinon.spy( user, 'save' );

			controller.update( data )
				.then( () => {
					user.password.should.not.equal( password );
					user.username.should.equal( username );
					user.playerId.should.equal( playerId );
					user.save.should.be.called();
					done();
				} )
				.catch( err =>
					done( err || new Error( 'should not have been rejected' ) )
				);
		} );

		it( 'updates all fields of own user when has permission', done => {
			currUser.id = user.id;
			updateCheck( done );
		} );

		it( 'updates fields of other user when has permission', updateCheck );

		function updateCheck( done ) {
			currUser.hasManagePermission = true;
			data.body = {
				password: 'some new password',
				username: 'userame.not.updated',
				playerId: 34
			};

			sinon.spy( user, 'save' );

			controller.update( data )
				.then( () => {
					user.password.should.not.equal( password );
					user.username.should.equal( data.body.username );
					user.playerId.should.equal( data.body.playerId );
					user.save.should.be.called();
					done();
				} )
				.catch( err =>
					done( err || new Error( 'should not have been rejected' ) )
				);
		}
	} );

	class UserProviderMock {
		fetchUser( id:ID ) {
			return new Promise( ( resolve, reject ) =>
				id === userId ? resolve( user ) : reject( new NotFound() )
			);
		}

		updateUser() {
			return new Promise( resolve => resolve() );
		}
	}
} );
