'use strict';

import {Email} from "../types/types";
import {ID} from "../types/types";
import {InvalidParameter} from "./errors";

const EMAIL_REGEX = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;

export class InputConverter {

	public static toEmail( input:any, name:string ):Email {
		if( typeof input !== 'string'
			|| !input.match( EMAIL_REGEX )
		) {
			throw new InvalidParameter( '"' + name + '" is not a valid email' );
		}

		return input;
	}

	public static toId( input:any, name:string ):ID {
		let error = '"' + name + '" is not a valid ID';

		if( !isFinite(input)
			|| (typeof input === 'string' && input.indexOf( 'e' ) >= 0)
		) {
			throw new InvalidParameter( error );
		}

		let number = parseFloat( input );
		if( number % 1 !== 0
			|| number < 0
		) {
			throw new InvalidParameter( error );
		}

		return number;
	}
}
