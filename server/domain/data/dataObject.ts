'use strict';
import {FunctionNotImplemented} from "../../utils/errors";

import {clone} from "../../utils/utils";

let _data:WeakMap<DataObject, {}> = new WeakMap();

export class DataObject {
	constructor( data ) {
		this.dirtyFields = new Set();

		_data.set( this, data );
	}

	dirtyFields:Set<string>;

	markClean() {
		this.dirtyFields = new Set();
	}

	get isDirty():boolean {
		return !!this.dirtyFields.size;
	}

	/***** Methods/Properties to be overridden *****/

	get data():Object {
		let data = _data.get( this ),
			cloned = clone( data );
		Object.keys( data ).forEach(
			key => {
				if( data[key] instanceof DataObject ) {
					cloned[key] = data[key];
				}
			}
		);

		return cloned;
	}

	/**
	 * An array of fields that are used as identifiers for this object.
	 * eg: primary keys in the database
	 */
	get identifierFields():string[] {
		throw new FunctionNotImplemented();
	}

	/**
	 * An array containing all fields this object contains.
	 */
	get fieldNames():string[] {
		return Object.keys( _data.get( this ) );
	}

	/**
	 * Update field values in this object using the matching fields from a
	 * hash-object.
	 */
	updateFieldVals( data:Object ) {
		let idFields:string[] = this.identifierFields;

		this.fieldNames
			.filter(
				x => data.hasOwnProperty( x )
					 && idFields.indexOf( x ) < 0
			)
			.forEach(
				field => this[field] = data[field]
			);
	}

	/***** Private/Protected methods *****/

	protected _markDirty( field:string ) {
		if( !this.dirtyFields.has( field ) ) {
			this.dirtyFields.add( field );
		}
	}

	protected _getFieldVal( field:string ) {
		return _data.get( this )[field];
	}

	protected _getFieldVals():{} {
		return clone( _data.get( this ) );
	}

	protected _setFieldVal( field:string, value ) {
		let data = _data.get( this );
		if( data[field] === value ) {
			return;
		}

		data[field] = value;
		this._markDirty( field );
	}
}
