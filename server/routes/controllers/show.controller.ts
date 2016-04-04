'use strict';

import {IController} from "./controller";
import {ID} from "../../types/types";
import {Show} from "../../domain/data/show";
import {ShowProvider} from "../../domain/providers/show.provider";
import {RequestData} from "../requestData";
import {Route} from "../data/route";
import {RoutingInfo} from "../data/routingInfo";

import {getInstance} from "../../utils/utils";

export class ShowController implements IController {

	private get _provider():ShowProvider {
		return getInstance( ShowProvider );
	}

	public list():Promise<Show[]> {
		return this._provider.fetchFutureShows();
	}

	public view( data:RequestData ):Promise<Show> {
		let showId:ID = data.routeParams.show;

		return this._provider.fetchShow( showId );
	}

	public get routing():RoutingInfo {
		return new RoutingInfo(
			'/shows',
			[
				new Route(
					'/',
					this.list
				),
				new Route(
					'/:show',
					this.view
				)
			]
		);
	}
}
