'use strict';
import {clone} from "../../../server/utils/utils";

describe( 'utils', () => {
	let should = require( 'should' );

	describe( 'object cloning', () => {

		it( 'copies basic types', () => {
			[
				54,
				'a string',
				5.34,
				null
			].forEach(
				x => should( clone( x ) ).equal( x )
			);
		} );

		it( 'copies an Array', () => {
			let arr = [54, 'a string', 5.34, null],
				copy = clone( arr );

			copy.should.deepEqual( arr );
		} );

		it( 'copies a Date', () => {
			let date = Date.parse( '2016-01-04 23:07:59' ),
				copy = clone( date );

			copy.should.equal( date );
		} );

		it( 'copies the properties & values of an Object', () => {
			let obj = {
				'a': 3,
				'b': 65,
				'hello': 'goodbye'
			};

			let copy = clone( obj );
			copy.should.deepEqual( obj );
		} );

		it( 'deep copies an Object', () => {
			let obj = {
				'a': { 'c': 45, 'd': null },
				'b': { 'bon jour': 'au revoir' },
				'hello': 'goodbye'
			};

			let copy = clone( obj );
			copy.should.deepEqual( obj );
		} );

		it( 'copies a complicated Object', () => {
			let obj = {
				'a': { 'c': 45, 'd': null, 100: new Date() },
				'b': {
					'bon jour': 'au revoir',
					'another': {
						0: 4,
						1: 43,
						2: 42,
						twenty: {
							number: 20,
							string: 'twenty'
						}
					}
				},
				greetings: {
					'hello': ['bonjour', 'bon jour', 'hello', 'salut', 'aloha'],
					'goodbye': [
						'au revoir', 'goodbye!',
						{ english: ['good bye'] },
						{ spanish: [] }
					]
				}
			};

			let copy = clone( obj );
			copy.should.deepEqual( obj );
		} );

		it( 'copied a class', () => {
			class TestClass {
				private _myVal:any;

				constructor( val ) {
					this.myVal = val;
				}

				get myVal() {
					return this._myVal;
				}

				set myVal( val ) {
					this._myVal = val;
				}
			}

			let obj = new TestClass( 23 );
			let copy = clone( obj );
			copy.should.deepEqual( obj );
			copy.myVal.should.equal( obj.myVal );
		} );
	} );
} );
