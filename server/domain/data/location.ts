'use strict';
import {DataObject} from "./dataObject";
import {ID} from "../../types/types";
import {InputConverter} from "../../utils/inputConverter";

export class Location extends DataObject {
	constructor( id:ID, name:string, isDefault:boolean ) {
		super( {
			id: id,
			name: name,
			isDefault: isDefault
		} );
	}

	/***** Show ID *****/
	public get showId():ID {
		return this._getFieldVal( 'showId' );
	}

	/***** Position ID *****/
	public get positionId():ID {
		return this._getFieldVal( 'positionId' );
	}

	/***** Player ID *****/
	public get playerId():ID {
		return this._getFieldVal( 'playerId' );
	}

	public set playerId( val:ID ) {
		val = InputConverter.toId( val, 'playerId' );

		this._setFieldVal( 'playerId', val );
	}
}
