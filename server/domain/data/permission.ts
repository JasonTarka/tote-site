'use strict';
import {DataObject} from './dataObject';

let _data = new WeakMap();

export class Permission extends DataObject {
	constructor( id, name ) {
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

	get id() {
		return this._getFieldVal( 'id' );
	}

	get name() {
		return this._getFieldVal( 'name' );
	}
}
