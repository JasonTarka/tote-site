'use strict';
import {DataObject} from "./dataObject";
import {InvalidParameter} from "../../utils/errors";

export class ShowPosition extends DataObject {
	constructor( showId:number, positionId:number, playerId?:number ) {
		super( {
			showId: showId,
			positionId: positionId,
			playerId: playerId
		} );
	}

	/***** Show ID *****/
	public get showId():number {
		return this._getFieldVal( 'showId' );
	}

	/***** Position ID *****/
	public get positionId():number {
		return this._getFieldVal( 'positionId' );
	}

	/***** Player ID *****/
	public get playerId():number {
		return this._getFieldVal( 'playerId' );
	}

	public set playerId( val:number ) {
		if( !isFinite( val ) ) {
			throw new InvalidParameter( '"playerId" must be a valid ID' );
		}

		this._setFieldVal( 'playerId', parseInt( val ) );
	}
}
