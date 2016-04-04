'use strict';
import {ID} from "../../types/types";
import {Database} from "./database";
import {NotFound} from "../../utils/errors";
import {Position} from "../data/position";

export class PositionProvider {
	private get _db():Database {
		return Database.instance;
	}

	public fetchPositions():Promise<Position[]> {
		let sql = 'SELECT * FROM positions ORDER BY sortOrder';

		return new Promise( ( resolve, reject ) => {
			this._db.executeQuery( sql )
				.then(
					rows => resolve( rows.map( createPosition ) )
				)
				.catch( reject );
		} );
	}

	public fetchPosition( positionId:ID ):Promise<Position> {
		let sql = 'SELECT * FROM positions WHERE id = ?';

		return new Promise( ( resolve, reject ) => {
			this._db.executeQuery( sql, [positionId] )
				.then( positions => {
					if( !positions || positions.length === 0 ) {
						return reject(
							new NotFound( 'Position not found' )
						);
					}
					resolve( createPosition( positions[0] ) );
				} )
				.catch( reject );
		} );
	}
}

function createPosition( row ) {
	let position = new Position(
		row.id,
		row.name,
		row.sortOrder
	);

	return position;
}
