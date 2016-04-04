'use strict';

import {IController} from "./controller";
import {ID} from "../../types/types";
import {Position} from "../../domain/data/position";
import {PositionProvider} from "../../domain/providers/position.provider";
import {RequestData} from "../requestData";
import {Route} from "../data/route";
import {RoutingInfo} from "../data/routingInfo";

import {getInstance} from "../../utils/utils";

export class PositionController implements IController {

	private get _provider():PositionProvider {
		return getInstance( PositionProvider );
	}

	public list():Promise<Position[]> {
		return this._provider.fetchPositions();
	}

	public view( data:RequestData ):Promise<Position> {
		let positionId:ID = data.routeParams.position;

		return this._provider.fetchPosition( positionId );
	}

	public get routing():RoutingInfo {
		return new RoutingInfo(
			'/positions',
			[
				new Route(
					'/',
					this.list,
					'GET',
					true
				),
				new Route(
					'/:position',
					this.view,
					'GET',
					true
				)
			]
		);
	}
}
