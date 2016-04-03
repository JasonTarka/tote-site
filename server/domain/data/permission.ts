'use strict';
import {DataObject} from './dataObject';
import {ID} from "../../types/types";

export class Permission extends DataObject {
	constructor( id:ID, name:string ) {
		super( {
			id: id,
			name: name
		} );
	}

	get data() {
		return {
			id: this.id,
			name: this.name
		};
	}

	get id():ID {
		return this._getFieldVal( 'id' );
	}

	get name():string {
		return this._getFieldVal( 'name' );
	}
}
