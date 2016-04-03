'use strict';
import {ID} from "../server/types/types";
import {NotAuthorized} from "../server/utils/errors";
import {User} from "../server/domain/data/user";

import {generateRandomString} from "../server/utils/utils";
import {getInstance} from "../server/utils/utils";

let mockery = require( 'mockery' );

let utilsMocked:boolean = false,
	keepCachedMocked:boolean = false,
	mockInstances:Map<string, Object>;
beforeEach( () => {
	mockery.enable( {
		warnOnUnregistered: false
	} );
	keepCachedMocked = false;
	utilsMocked = false;
	mockInstances = new Map();
} );

afterEach( () => {
	mockery.deregisterAll();
	mockery.disable();
	mockInstances = null;
} );

export function registerMockInstance(
	mockedType,
	instance,
    utilsPath?:string
) {
	utilsPath = utilsPath || '../../utils/utils';
	if( !utilsMocked ) {
		mockery.registerMock(
			utilsPath,
			{
				getInstance: getMockInstance,
				generateRandomString: generateRandomString
			}
		);
		utilsMocked = true;
	}
	mockInstances.set( mockedType.name, instance );
	mockery.registerAllowable( utilsPath, true );

	function getMockInstance( type ) {
		if( mockInstances.has( type.name ) ) {
			return mockInstances.get( type.name );
		} else {
			return getInstance( type );
		}
	}
}

export function requireUncached( path:string ) {
	const keepCached:string[] = [
		'../server/utils/errors'
	];

	if( !keepCachedMocked ) {
		keepCached.forEach( x => mockery.registerMock( x, require( x ) ) );
		keepCachedMocked = true;
	}

	path = '../' + path;
	mockery.registerAllowable( path, true );
	return require( path );
}

export class UserMock extends User {
	constructor( userId?:ID ) {
		super();

		this._userId = userId;
		this.hasManagePermission = true;
	}

	private _userId:ID;

	get id():ID {
		return this._userId;
	}

	set id( val:ID ) {
		this._userId = val;
	}

	hasManagePermission:boolean;

	hasPermission():Promise<void> {
		return new Promise<void>( ( resolve, reject ) =>
			this.hasManagePermission ? resolve() : reject( new NotAuthorized() )
		);
	}
}
