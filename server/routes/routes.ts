'use strict';

import {AuthController} from "./controllers/auth.controller";
import Application = Express.Application;
import {IController} from "./controllers/controller";
import {PlayerController} from "./controllers/player.controller";
import {PositionController} from "./controllers/position.controller";
import {RouteHandler} from "./routeHandler";
import {ShowController} from "./controllers/show.controller";
import {UserController} from "./controllers/user.controller";

import {createAuthStrategy} from "./auth";
import {getInstance} from "../utils/utils";

export function setupControllers( basePath:string, app:Application ) {
	let express = require( 'express' ),
		authenticator = createAuthStrategy(),
		router = express.Router();

	let controllers:IController[] = [
		getInstance( AuthController ),
		getInstance( PlayerController ),
		getInstance( PositionController ),
		getInstance( ShowController ),
		getInstance( UserController )
	];

	let routeHandler:RouteHandler = new RouteHandler(
		express,
		router,
		authenticator,
		basePath
	);

	controllers.forEach( x => routeHandler.registerController( x ) );

	app.use( basePath, router );
}
