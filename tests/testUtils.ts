'use strict';
import {generateRandomString} from "../server/utils/utils";
import {getInstance} from "../server/utils/utils";

let mockery = require( 'mockery' );

let utilsMocked:boolean = false,
	mockInstances:Map<string, Object>;
beforeEach( () => {
	mockery.enable( {
		warnOnUnregistered: false
	} );
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
	path = '../' + path;
	mockery.registerAllowable( path, true );
	return require( path );
}
