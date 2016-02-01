'use strict';
import {AuthProvider} from "../../domain/providers/auth.provider";
import {BadRequest} from "../../utils/errors";
import {IController} from "./controller";
import {Forbidden} from "../../utils/errors";
import {RequestData} from "../requestData";
import {Route} from "../data/route";
import {RoutingInfo} from "../data/routingInfo";
import {UserProvider} from "../../domain/providers/user.provider";

import {verifyPassword} from "../../utils/password";
import {getInstance} from "../../utils/utils";

let jwt = require( 'jsonwebtoken' );

export class AuthController implements IController {
	constructor() {
		this.jwtSecret = process.env.TOTE_JWT_SECRET;
	}

	private jwtSecret:string;

	private get _provider():UserProvider {
		return getInstance( UserProvider );
	}

	private get _authProvider():AuthProvider {
		return getInstance( AuthProvider );
	}

	login( data:RequestData ):Promise<{token:string}> {
		let body = data.body;

		if( !body || !body.username || !body.password ) {
			throw new BadRequest(
				'Must include a username and password'
			);
		}

		let errorMessage = 'Invalid username or password';

		return this._provider.tryFetchUserByUsername( body.username )
			.then( user => {
				if( user == null ) {
					throw new Forbidden( errorMessage );
				}

				return verifyPassword( user.password, body.password, user.salt )
					.then( isValid => {
						if( !isValid ) {
							throw new Forbidden( errorMessage );
						}
					} )
					.then(
						() => this._authProvider.createAuthSession( user.id )
					)
					.then( authSession => {
						let token = jwt.sign(
							{
								id: user.id,
								username: user.username,
								sessionKey: authSession.sessionKey
							},
							this.jwtSecret
						);

						return {
							token: token
						};
					} );
			} );
	}

	get routing():RoutingInfo {
		return new RoutingInfo(
			'/auth',
			[
				new Route(
					'/login',
					this.login,
					'POST'
				)
			]
		);
	}
}
