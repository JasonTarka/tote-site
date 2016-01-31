'use strict';
import {DataObject} from './dataObject';
import {InvalidParameter} from "../../utils/errors";
import {PlayerProvider} from "../providers/player.provider";

import {getInstance} from "../../utils/utils";

export class Player extends DataObject {
	constructor(
		id?:number,
		name?:string,
		email?:string,
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
	get id():number {
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
	get email():string {
		return this._getFieldVal( 'email' );
	}

	set email( val:string ) {
		if( val
			&& typeof val !== 'string'
			&& !val.match( /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i )
		) {
			throw new InvalidParameter( '"email" must be a valid email address' );
		}

		this._setFieldVal( 'email', val.toString() );
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
