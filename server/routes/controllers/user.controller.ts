'use strict';
import {Permissions} from "../../utils/enums";
import {RoutingInfo} from "../data/routingInfo";
import {Route} from "../data/route";
import {User} from "../../domain/data/user";
import {UserProvider} from "../../domain/providers/user.provider";

import {getInstance} from "../../utils/utils";

export class UserController {

	private get _provider():UserProvider {
		return getInstance( UserProvider );
	}

	list() {
		return this._provider.fetchUsers();
	}

	view( data ) {
		let userId = data.routeParams.user;

		return this._provider.fetchUser( userId );
	}

	create( data ) {
		return data.user.hasPermission( Permissions.ManagePlayers )
			.then( () => {
				let body = data.body;
				let user = new User();
				user.username = body.username;
				user.password = body.password;
				user.playerId = body.playerId;

				return this._provider.createUser( user );
			} );
	}

	get routing() {

		return new RoutingInfo(
			'/users',
			[
				new Route(
					'/',
					this.list,
					'GET',
					true
				),
				new Route(
					'/:user',
					this.view,
					'GET',
					true
				),
				new Route(
					'/',
					this.create,
					'POST',
					true
				)
			]
		);
	}
}
