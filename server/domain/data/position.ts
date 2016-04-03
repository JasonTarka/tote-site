'use strict';
import {DataObject} from "./dataObject";
import {ID} from "../../types/types";
import {InvalidParameter} from "../../utils/errors";

export class Position extends DataObject {
	constructor( id?:ID, name?:string, sortOrder?:number ) {
		super( {
			id: id,
			name: name,
			sortOrder: sortOrder
		} );
	}

	get data() {
		let data:any = this._getFieldVals;
		delete data.sortOrder;
		return data;
	}

	/***** id *****/

	public get id():ID {
		return this._getFieldVal( 'id' );
	}

	/***** name *****/

	public get name():string {
		return this._getFieldVal( 'name' );
	}

	public set name( val:string ) {
		if( !val ) {
			throw new InvalidParameter( '"name" cannot be empty' );
		}
	}

	/***** Sort Order *****/
	public get sortOrder():number {
		return this._getFieldVal( 'sortOrder' );
	}

	public set sortOrder( val:number ) {
		this._setFieldVal( 'sortOrder', val );
	}
}
