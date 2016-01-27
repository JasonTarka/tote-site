'use strict';
import {PlayerProvider} from "../../domain/providers/player.provider";

let RoutingInfo = require( '../data/routingInfo' ),
	Route = require( '../data/route' ),
	permissions = require( '../../utils/enums' ).permissions,
	playerProvider = require( '../../domain/providers/player.provider' ),
	Player = require( '../../domain/data/player' );


class PlayerController {

	private get _provider():PlayerProvider {
		return playerProvider();
	}

	list() {
		return this._provider.fetchPlayers();
	}

	view( data ) {
		let playerId = data.routeParams.player;

		return this._provider.fetchPlayer( playerId );
	}

	create( data ) {
		let body = data.body;

		return data.user.hasPermission( permissions.ManagePlayers )
			.then( () => {
				let player = new Player();
				player.updateFieldVals( body );

				return this._provider.createPlayer( player );
			} );
	}

	update( data ) {
		let playerId = data.routeParams.player,
			body = data.body;

		return data.user.hasPermission( permissions.ManagePlayers )
			.then( () => this._provider.fetchPlayer( playerId ) )
			.then( player => {
				player.updateFieldVals( body );
				return player.save();
			} );
	}

	get routing() {
		return new RoutingInfo(
			'/players',
			new Route(
				'/',
				this.list
			),
			new Route(
				'/',
				this.create,
				'POST',
				true
			),
			new Route(
				'/:player',
				this.view
			),
			new Route(
				'/:player',
				this.update,
				'PATCH',
				true
			)
		);
	}
}

export function construct() {
	return require( '../../utils/utils' ).singleton( PlayerController );
}
