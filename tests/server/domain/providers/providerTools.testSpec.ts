'use strict';
import {DataObject} from "../../../../server/domain/data/dataObject";

import {generateUpdateStatement} from "../../../../server/domain/providers/providerTools";

describe( 'Provider Tools', () => {
	let should = require( 'should' );

	var dataObjectMock:DataObjectMock;

	beforeEach( () => {
		dataObjectMock = new DataObjectMock();
	} );

	describe( 'Generate Update Statement', () => {
		it( 'returns null when the DataObject is not dirty', () => {
			dataObjectMock.isDirty = false;

			let result = generateUpdateStatement( dataObjectMock, 'people' );
			should( result ).be.null();
		} );

		it( 'generates good SQL and parameters for a simple case', () => {
			// Test
			const expectedSql = 'UPDATE users SET name=? WHERE id=?',
				expectedParams = ['Darth Vader', 42];

			dataObjectMock.identifierFields = ['id'];
			dataObjectMock.dirtyFields.add( 'name' );

			dataObjectMock.id = 42;
			dataObjectMock.name = 'Darth Vader';

			// Test
			let result = generateUpdateStatement( dataObjectMock, 'users' );

			assertExpectedResults( expectedSql, expectedParams, result );
		} );

		it( 'generates multiple column updates', () => {
			// Test
			const expectedSql = 'UPDATE users ' +
								'SET name=?, parent=?, age=? ' +
								'WHERE id=?',
				expectedParams = [
					'Luke Skywalker', 'Darth Vader', 25, 42
				];

			dataObjectMock.dirtyFields.add( 'name' );
			dataObjectMock.name = expectedParams[0];

			dataObjectMock.dirtyFields.add( 'parent' );
			dataObjectMock.parent = expectedParams[1];

			dataObjectMock.dirtyFields.add( 'age' );
			dataObjectMock.age = expectedParams[2];

			dataObjectMock.identifierFields = ['id'];
			dataObjectMock.id = expectedParams[3];

			// Test
			let result = generateUpdateStatement( dataObjectMock, 'users' );

			assertExpectedResults( expectedSql, expectedParams, result );
		} );

		it( 'generates multiple identifier checks', () => {
			// Test
			const expectedSql = 'UPDATE users ' +
								'SET name=?, parent=? ' +
								'WHERE id=? AND loginCount=?',
				expectedParams = [
					'Luke Skywalker', 'Darth Vader',
					25, 42
				];

			dataObjectMock.dirtyFields.add( 'name' );
			dataObjectMock.name = expectedParams[0];

			dataObjectMock.dirtyFields.add( 'parent' );
			dataObjectMock.parent = expectedParams[1];

			dataObjectMock.identifierFields = ['id', 'loginCount'];
			dataObjectMock.id = expectedParams[2];
			dataObjectMock.loginCount = expectedParams[3];

			// Test
			let result = generateUpdateStatement( dataObjectMock, 'users' );

			assertExpectedResults( expectedSql, expectedParams, result );
		} );

		function assertExpectedResults( expectedSql, expectedParams, result ) {
			should( result ).not.be.undefined()
				.and.not.be.null()
				.and.have.properties( ['sql', 'params'] );

			result.sql.should.equal( expectedSql );
			result.params.should.containDeepOrdered( expectedParams );
		}
	} );
} );

class DataObjectMock extends DataObject {
	constructor() {
		super({});

		this.isDirty = true;
		this.identifierFields = [];
		this.dirtyFields = new Set();
	}

	id:any;
	name:any;
	loginCount:any;
	parent:any;
	age:any;

	private _isDirty:boolean;
	public get isDirty():boolean {
		return this._isDirty;
	}
	public set isDirty( val ) {
		this._isDirty = val;
	}

	private _identifierFields:string[];
	public get identifierFields():string[] {
		return this._identifierFields;
	}
	public set identifierFields( val ) {
		this._identifierFields = val;
	}
}
