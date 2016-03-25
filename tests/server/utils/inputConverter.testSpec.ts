'use strict';

import {Email} from "../../../server/types/types";
import {InputConverter} from "../../../server/utils/inputConverter";
import {InvalidParameter} from "../../../server/utils/errors";

describe( 'Input Converter', () => {
	let should = require( 'should' );

	describe( 'ID conversion', () => {
		let name = 'ID field';

		it( 'converts a valid string', () => {
			let expectedOutut = 123,
				input = '123';

			let output = InputConverter.toId( input, name );

			should( output ).equal( expectedOutut );
		} );

		it( 'converts a valid number', () => {
			let expectedOutut = 123,
				input = 123;

			let output = InputConverter.toId( input, name );

			should( output ).equal( expectedOutut );
		} );

		it( 'throws expected error message', () => {
			let expectedMessage = '"' + name + '" is not a valid ID';
			should(
				() => InputConverter.toId( 'abc', name )
			).throw( expectedMessage );
		} );

		describe( 'rejections', () => {
			[
				{ name: 'decimal string', value: '123.456' },
				{ name: 'decimal number', value: 123.456 },
				{ name: 'non-numeric string', value: 'abc' },
				{ name: 'partial-numeric string', value: '1a2b3c' },
				{ name: 'reverse partial-numeric string', value: 'a1b2c3' },
				{ name: 'negative number string', value: '-456' },
				{ name: 'negative number', value: -456 },
				{ name: 'exponent string', value: '1e10' },
				{ name: 'boolean', value: true },
			].forEach( data => {
				it( 'rejects ' + data.name, () => {
					should(
						() => InputConverter.toId( data.value, name )
					).throw( InvalidParameter );
				} );
			} );
		} );
	} );

	describe( 'email conversion', () => {
		let name = 'Email';

		it( 'converts valid email', () => {
			let expectedOutput:Email = 'hello@example.com',
				input = expectedOutput;

			let output = InputConverter.toEmail( input, name );
			output.should.equal( expectedOutput );
		});

		it( 'converts complex email', () => {
			let expectedOutput:Email = 'hello.name+addition_of_types%20still-valid@domain.ca.l0ng.extension',
				input = expectedOutput;

			let output = InputConverter.toEmail( input, name );
			output.should.equal( expectedOutput );
		});

		describe( 'rejections', () => {
			[
				{ name: 'non-email string', value: 'abc123.ca' },
				{ name: 'partial email', value: 'abc@' },
				{ name: 'partial ending email', value: '@abc.ca' },
				{ name: 'number', value: 123 },
				{ name: 'boolean', value: true },
			].forEach( data => {
				it( 'rejects ' + data.name, () => {
					should(
						() => InputConverter.toEmail( data.value, name )
					).throw( InvalidParameter );
				} );
			} );
		} );
	});
} );
