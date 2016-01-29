'use strict';
import {Permissions} from "../../utils/enums";
import {Player} from "../../domain/data/player";
import {PlayerProvider} from "../../domain/providers/player.provider";
import {Route} from "../data/route";
import {RoutingInfo} from "../data/routingInfo";

import {getInstance} from "../../utils/utils";

export class PlayerController {

	private get _provider():PlayerProvider {
		return getInstance( PlayerProvider );
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

		return data.user.hasPermission( Permissions.ManagePlayers )
			.then( () => {
				let player = new Player();
				player.updateFieldVals( body );

				return this._provider.createPlayer( player );
			} );
	}

	update( data ) {
		let playerId = data.routeParams.player,
			body = data.body;

		return data.user.hasPermission( Permissions.ManagePlayers )
			.then( () => this._provider.fetchPlayer( playerId ) )
			.then( player => {
				player.updateFieldVals( body );
				return player.save();
			} );
	}

	get routing() {
		return new RoutingInfo(
			'/players',
			[
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
			]
		);
	}
}
