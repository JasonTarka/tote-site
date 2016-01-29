'use strict';
import {DataObject} from "../data/dataObject";

export function generateUpdateStatement(
	dataObject:DataObject,
	tableName:string
):{
	sql:string,
	params:{}
} {
	if( !dataObject.isDirty ) {
		return null;
	}

	let sql = 'UPDATE ' + tableName + ' SET',
		params = [],
		firstField = true;

	dataObject.dirtyFields.forEach( field => {
		sql += (firstField ? ' ' : ', ') + field + '=?';
		params.push( dataObject[field] );
		firstField = false;
	} );

	sql += ' WHERE ';
	firstField = true;
	dataObject.identifierFields.forEach( field => {
		sql += (firstField ? '' : ' AND ') + field + '=?';
		params.push( dataObject[field] );
		firstField = false;
	} );

	return {
		sql: sql,
		params: params
	};
}
