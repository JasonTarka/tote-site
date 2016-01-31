'use strict';
import {DataObject} from "../../../../server/domain/data/dataObject";
///<reference "../../../../typings/should/should.d.ts" />

describe( 'Data Object', () => {
	let should = require( 'should' );

	/** @type {DataObject} */
	var dataObject; // Not assigning a type so we can test protected functions

	const initialData = {
		id: 12,
		name: 'Harley Davidson',
		myField: 'my field value',
		hello: undefined,
		goodbye: null,
		yourField: false
	};

	beforeEach( () => {
		dataObject = new TestDataObject( initialData );

		dataObject.identifierFields = ['id'];
	} );

	describe( 'initial object state', () => {
		it( 'is not dirty', () => {
			dataObject.isDirty.should.be.false();
		} );

		it( 'has proper values for fields', () => {
			Object.keys( initialData ).forEach(
				key => should( dataObject._getFieldVal( key ) )
					.equal( initialData[key] )
			);
		} );

		it( 'lists proper field names', () => {
			dataObject.fieldNames.should
				.deepEqual( Object.keys( initialData ) );
		} );
	} );

	describe( 'setting field values', () => {
		it( 'marks the object as dirty', () => {
			dataObject._setFieldVal( 'name', 'Another name' );
			dataObject.isDirty.should.be.true();
		} );

		it( 'removes dirty flag when marked clean', () => {
			dataObject._setFieldVal( 'name', 'Another name' );
			dataObject.markClean();
			dataObject.isDirty.should.be.false();
		} );

		it( 'does not mark as dirty if the value is identical', () => {
			dataObject._setFieldVal( 'name', initialData.name );
			dataObject.isDirty.should.be.false();
		} );
	} );

	describe( 'updating field values to object', () => {
		it( 'updates field values and marks the object as dirty', () => {
			const data = {
				name: 'Another name',
				yourField: true
			};

			dataObject.updateFieldVals( data );

			dataObject._getFieldVal( 'name' ).should.equal( data.name );
			dataObject._getFieldVal( 'yourField' ).should.equal( data.yourField );
			dataObject.isDirty.should.be.true();
		} );

		it( 'does not set values for non-existent fields', () => {
			const data = {
				someBadField: 'should not set',
				anotherBadField: 'also should not set'
			};

			dataObject.updateFieldVals( data );

			dataObject.isDirty.should.be.false();
			Object.keys( data ).forEach( field => {
				should( dataObject._getFieldVal( field ) ).be.undefined();
			});
		});

		it( 'does not set identifier fields', () => {
			let data:any = {
				id: 42
			};
			dataObject.updateFieldVals( data );
			dataObject._getFieldVal( 'id' ).should.equal( initialData.id );
			dataObject.isDirty.should.be.false();

			// Test mix of fields
			let newInitialData = { otherId: 13 };
			Object.assign( newInitialData, initialData );
			dataObject = new TestDataObject( newInitialData );
			dataObject.identifierFields = ['id', 'otherId'];

			data.otherId = 47;
			data.name = 'New Name';
			data.hello = 'Goodbye';
			dataObject.updateFieldVals( data );
			dataObject._getFieldVal( 'id' )
				.should.equal( initialData.id );
			dataObject._getFieldVal( 'otherId' )
				.should.equal( newInitialData.otherId );
			dataObject._getFieldVal( 'name' )
				.should.equal( data.name );
			dataObject.isDirty.should.be.true();
		});
	} );
} );

/**
 * Need to implement "abstract" methods that DataObject uses internally.
 */
class TestDataObject extends DataObject {
	constructor( data ) {
		super( data );

		// Hacky way to dynamically create getters & setters
		Object.keys( data ).forEach(
			field => Object.defineProperty(
				this,
				field,
				{
					get: () => this._getFieldVal( field ),
					set: val => this._setFieldVal( field, val )
				}
			)
		);
	}

	private __identifierFields:string[];

	get identifierFields() {
		return this.__identifierFields;
	}

	set identifierFields( val ) {
		this.__identifierFields = val;
	}
}
