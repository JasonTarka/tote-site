'use strict';
import {NotAuthorized} from "../../../../server/utils/errors";
import {NotFound} from "../../../../server/utils/errors";
import {Permissions} from "../../../../server/utils/enums";
import {Player} from "../../../../server/domain/data/player";
import {PlayerController} from "../../../../server/routes/controllers/player.controller";
import {PlayerProvider} from "../../../../server/domain/providers/player.provider";
import {RequestData} from "../../../../server/routes/requestData";
import {UserMock} from "../../../testUtils";

import {registerMockInstance} from "../../../testUtils";
import {requireUncached} from "../../../testUtils";

describe( 'Player Controller', () => {
	let should = require( 'should' ),
		sinon = require( 'sinon' );
	require( 'should-sinon' );

	const playerId = 21,
		playerName = 'Joe Namith',
		playerEmail = 'joe.namith@example.com',
		playerBio = 'oseph William Namath, nicknamed "Broadway Joe", is a former' +
					' American football quarterback and actor.',
		playerImgPath = '/path/to/image.png',
		playerIsActive = true;

	var PlayerController,
		controller:PlayerController,
		player:Player,
		playerProviderMock:PlayerProviderMock,
		user:UserMock,
		data:RequestData;

	beforeEach( () => {
		player = new Player(
			playerId,
			playerName,
			playerEmail,
			playerBio,
			playerImgPath,
			playerIsActive
		);
		user = new UserMock();

		playerProviderMock = new PlayerProviderMock();
		registerMockInstance(
			PlayerProvider,
			playerProviderMock
		);

		data = {
			user: user,
			routeParams: {
				player: playerId
			},
			body: {
				name: player.name,
				email: player.email,
				bio: player.bio,
				imgPath: player.imgPath,
				isActive: player.isActive
			}
		};

		// Ensure we're not using the cached version from other tests
		PlayerController = requireUncached(
			'server/routes/controllers/player.controller'
		).PlayerController;
		controller = new PlayerController();
	} );

	describe( 'update', () => {
		it( 'enforces Manage Players permission', done => {
			const requiredPermission = Permissions.ManagePlayers;

			user.hasManagePermission = false;
			sinon.spy( user, 'hasPermission' );

			controller.update( data )
				.then(
					() => done( new Error( 'Should have been rejected' ) )
				)
				.catch( err => {
					should( err ).be.instanceOf( NotAuthorized );
					user.hasPermission
						.should.be.calledWith( requiredPermission );
					done();
				} )
				.catch( done );
		} );

		it( 'updates user properties', done => {
			data.body = {
				name: 'Joe Naismith',
				email: 'joe.naismith@example.net',
				bio: 'James Naismith (November 6, 1861 – November 28, 1939) was' +
					 ' a Canadian-American physical educator, physician,' +
					 ' chaplain, sports coach and innovator.',
				imgPath: '/path/to/joe.png',
				isActive: false
			};

			sinon.stub( player, 'save', () => {
				player.name.should.equal( data.body.name );
				player.email.should.equal( data.body.email );
				player.bio.should.equal( data.body.bio );
				player.imgPath.should.equal( data.body.imgPath );
				player.isActive.should.be.false();
			} );

			controller.update( data )
				.then( () => {
					player.save.should.be.called();
					done();
				} )
				.catch(
					err => done( err || new Error( 'Rejected' ) )
				);
		} );

		describe( 'single properties changed', () => {
			[
				{ prop: 'name', value: 'Yoda' },
				{ prop: 'email', value: 'yoda@example.org' },
				{ prop: 'bio', value: 'A Jedi on a far away planet' },
				{ prop: 'imgPath', value: '/path/to/another.jpeg' },
				{ prop: 'isActive', value: false }
			].forEach( x =>
				it( 'only updates changed property, ' + x.prop, done => {
					data.body = {};
					data.body[x.prop] = x.value;

					sinon.stub( player, 'save', () => {
						player.name.should.equal(
							data.body.name || player.name
						);
						player.email.should.equal(
							data.body.email || player.email
						);
						player.bio.should.equal(
							data.body.bio || player.bio
						);
						player.imgPath.should.equal(
							data.body.imgPath || player.imgPath
						);
						player.isActive.should.equal(
							data.body.isActive === undefined
						);
					} );

					controller.update( data )
						.then( () => {
							player.save.should.be.called();
							done();
						} )
						.catch(
							err => done( err || new Error( 'Rejected' ) )
						);
				} )
			);


		} );
	} );

	describe( 'create', () => {
		it( 'creates a new player', done => {
			data.body = {
				name: 'David Bowie',
				email: 'david.bowie@example.io',
				bio: 'Trapped in a tin can',
				imgPath: '/path/to/bowie.space',
				isActive: true
			};
			player = null;

			sinon.stub( playerProviderMock, 'createPlayer', newPlayer => {
				player = newPlayer;

				should( newPlayer ).not.be.undefined()
					.and.not.be.null();
				should( newPlayer.id ).be.undefined();
				newPlayer.name.should.equal( data.body.name );
				newPlayer.email.should.equal( data.body.email );
				newPlayer.bio.should.equal( data.body.bio );
				newPlayer.imgPath.should.equal( data.body.imgPath );
				newPlayer.isActive.should.equal( data.body.isActive );

				return newPlayer;
			} );

			controller.create( data )
				.then( retPlayer => {
					playerProviderMock.createPlayer
						.should.be.calledOnce();
					retPlayer.should.be.instanceOf( Player );
					done();
				} )
				.catch(
					err => done( err || new Error( 'Error occurred' ) )
				);
		} );

		it( 'enforces Manage Players permission', done => {
			const requiredPermission = Permissions.ManagePlayers;

			user.hasManagePermission = false;
			sinon.spy( user, 'hasPermission' );

			controller.create( data )
				.then(
					() => done( new Error( 'Should have been rejected' ) )
				)
				.catch( err => {
					should( err ).be.instanceOf( NotAuthorized );

					user.hasPermission
						.should.be.calledWith( requiredPermission );
					done();
				} )
				.catch( done );
		} );
	} );

	class PlayerProviderMock {
		fetchPlayer( id ):Promise<Player> {
			return new Promise( ( resolve, reject ) =>
				id === player.id
					? resolve( player )
					: reject( new NotFound() )
			);
		}

		createPlayer() {}
	}
} );
