'use strict';
import {DataObject} from './dataObject';

export class Permission extends DataObject {
	constructor( id:number, name:string ) {
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

	get id():number {
		return this._getFieldVal( 'id' );
	}

	get name():string {
		return this._getFieldVal( 'name' );
	}
}
