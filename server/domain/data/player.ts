'use strict';
import {DataObject} from './dataObject';
import {Email} from "../../types/types";
import {ID} from "../../types/types";
import {InputConverter} from "../../utils/inputConverter";
import {InvalidParameter} from "../../utils/errors";
import {PlayerProvider} from "../providers/player.provider";

import {getInstance} from "../../utils/utils";

export class Player extends DataObject {
	constructor(
		id?:ID,
		name?:string,
		email?:Email,
		bio?:string,
		imgPath?:string,
		isActive?:boolean
	) {
		super( {
			id: id,
			name: name,
			email: email,
			bio: bio,
			imgPath: imgPath,
			isActive: isActive
		} );
	}

	get data():any {
		return this._getFieldVals();
	}

	get identifierFields():string[] {
		return ['id'];
	}

	// ----- id -----
	get id():ID {
		return this._getFieldVal( 'id' );
	}

	// ----- name -----
	get name():string {
		return this._getFieldVal( 'name' );
	}

	set name( val:string ) {
		if( !val ) {
			throw new InvalidParameter( '"name" must not be empty' );
		}
		this._setFieldVal( 'name', val.toString() );
	}

	// ----- email -----
	get email():Email {
		return this._getFieldVal( 'email' );
	}

	set email( val:Email ) {
		val = InputConverter.toEmail( val, 'email' );

		this._setFieldVal( 'email', val );
	}

	// ----- bio -----
	get bio():string {
		return this._getFieldVal( 'bio' );
	}

	set bio( val:string ) {
		this._setFieldVal( 'bio', val.toString() );
	}

	// ----- imgPath -----

	get imgPath():string {
		return this._getFieldVal( 'imgPath' );
	}

	set imgPath( val:string ) {
		val = val ? val.toString() : null;
		this._setFieldVal( 'imgPath', val );
	}

	// ----- imgPath -----

	get isActive():boolean {
		return this._getFieldVal( 'isActive' );
	}

	set isActive( value:boolean ) {
		let val:any = value; // TypeScript hack to allow for input validation

		if( val === false || val === 0 || val === '0' || val === 'false' ) {
			val = false;
		} else if( val === true || val === 1 || val === '1' || val === 'true' ) {
			val = true;
		} else {
			throw new InvalidParameter( 'isActive must be a boolean' );
		}

		this._setFieldVal( 'isActive', val );
	}

	save():Promise<Player> {
		if( !this.id ) {
			throw new Error( 'Cannot create player' );
		}

		let provider:PlayerProvider = getInstance( PlayerProvider );
		return provider.updatePlayer( this )
			.then( () => this );
	}
}
