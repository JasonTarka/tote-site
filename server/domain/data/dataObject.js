'use strict';

let NotImplemented = require( '../../utils/errors' ).FunctionNotImplemented,
	utils = require( '../../utils/utils' );

let _data = new WeakMap();

class DataObject {
	constructor( data ) {
		/**
		 * @type {Set}
		 */
		this.dirtyFields = new Set();

		_data.set( this, data );
	}

	markClean() {
		this.dirtyFields = new Set();
	}

	/**
	 * @returns {boolean}
	 */
	get isDirty() {
		return !!this.dirtyFields.size;
	}

	/***** Methods/Properties to be overridden *****/

	/**
	 * @returns {Object|object}
	 */
	get data() {
		throw new NotImplemented();
	}

	/**
	 * An array of fields that are used as identifiers for this object.
	 * eg: primary keys in the database
	 * @returns {string[]}
	 */
	get identifierFields() {
		throw new NotImplemented();
	}

	/**
	 * An array containing all fields this object contains.
	 * @returns {string[]}
	 */
	get fieldNames() {
		return Object.keys( _data.get(this) );
	}

	/**
	 * Update field values in this object using the matching fields from a
	 * hash-object.
	 *
	 * @param data {Object}
	 */
	updateFieldVals( data ) {
		let idFields = this.identifierFields;

		this.fieldNames
			.filter(
				x =>  data.hasOwnProperty(x)
					  && idFields.indexOf( x ) < 0
			)
			.forEach(
				field => this[field] = data[field]
			);
	}

	/***** Private/Protected methods *****/

	_markDirty( field ) {
		if( !this.dirtyFields.has( field ) ) {
			this.dirtyFields.add( field );
		}
	}

	_getFieldVal( field ) {
		return _data.get( this )[field];
	}

	_getFieldVals() {
		return utils.clone( _data.get( this ) );
	}

	_setFieldVal( field, value ) {
		let data = _data.get( this );
		if( data[field] === value ) {
			return;
		}

		data[field] = value;
		this._markDirty( field );
	}
}

module.exports = DataObject;
