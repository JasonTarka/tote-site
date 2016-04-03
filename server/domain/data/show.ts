'use strict';
import {DataObject} from "./dataObject";
import {ID} from "../../types/types";
import {InvalidParameter} from "../../utils/errors";
import {ShowPosition} from "./showPosition";

export class Show extends DataObject {
	constructor(
		id:ID,
		locationId:number,
		date:Date,
		tagLine:string,
		showPositions:ShowPosition[]
	) {
		super( {
			id: id,
			locationId: locationId,
			date: date,
			tagLine: tagLine,
			showPositions: showPositions
		} );
	}

	/***** Show ID *****/
	public get id():ID {
		return this._getFieldVal( 'id' );
	}

	/***** Location ID *****/
	public get locationId():number {
		return this._getFieldVal( 'locationId' );
	}

	public set locationId( val ) {
		this._setFieldVal( 'locationId', val );
	}

	/***** Date *****/
	public get date():Date {
		return this._getFieldVal( 'date' );
	}

	public set date( val:Date ) {
		if( !val ) {
			throw new InvalidParameter( '"date" cannot be null' );
		}

		let tempVal:any = val;
		if( typeof tempVal !== 'object' ) {
			val = new Date( tempVal );
		}
		if( isNaN( val.getTime() ) ) {
			throw new InvalidParameter( '"date" must be a valid date' );
		}

		this._setFieldVal( 'playerId', val );
	}

	/***** Tag Line *****/

	public get tagLine():string {
		return this._getFieldVal( 'tagLine' );
	}

	public set name( val:string ) {
		this._setFieldVal( 'tagLine', val );
	}

	/****** Show Positions *****/

	public get showPositions():ShowPosition[] {
		return this._getFieldVal( 'showPositions' );
	}

	public set showPositions( val:ShowPosition[] ) {
		if( !(val instanceof Array)
			|| !val.every( x => x instanceof ShowPosition )
		) {
			throw new InvalidParameter( '"showPositions" must be an array of Show Positions' );
		}

		this._setFieldVal( 'showPositions', val );
	}
}
