'use strict';
import {DataObject} from "./dataObject";
import {InvalidParameter} from "../../utils/errors";

export class Location extends DataObject {
	constructor( id:number, name:string, isDefault:boolean ) {
		super( {
			id: id,
			name: name,
			isDefault: isDefault
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
