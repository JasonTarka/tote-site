'use strict';

import {ColumnPositionIdMap} from "../staticData/showPositionMap";
import {Database} from "./database";
import {ID} from "../../types/types";
import {NotFound} from "../../utils/errors";
import {Show} from "../data/show";
import {ShowPosition} from "../data/showPosition";

export class ShowProvider {
	private get _db():Database {
		return Database.instance;
	}

	fetchFutureShows():Promise<Show[]> {
		let sql = "SELECT * FROM shows WHERE timestamp > '2016-04-25'";

		return new Promise( ( resolve, reject ) => {
			this._db.executeQuery( sql )
				.then(
					rows => resolve( rows.map( createShow ) )
				)
				.catch( reject );
		} );
	}

	fetchShow( showId:ID ):Promise<Show> {
		let sql = 'SELECT * FROM shows WHERE id = ?';

		return new Promise( ( resolve, reject ) => {
			this._db.executeQuery( sql, [showId] )
				.then( shows => {
					if( !shows || shows.length === 0 ) {
						return reject(
							new NotFound( 'Show not found' )
						);
					}
					resolve( createShow( shows[0] ) );
				} )
				.catch( reject );
		} );
	}

	updateShow( show:Show ):Promise<void> {
		return this._db.updateDataObject( show, 'shows' );
	}
}

function createShow( row ):Show {
	let showPositions:ShowPosition[] = [];
	Object.keys( ColumnPositionIdMap ).forEach( column => {
		if( !row[column] ) {
			return;
		}

		let sp = new ShowPosition(
			row.id,
			ColumnPositionIdMap[column],
			row[column]
		);
		showPositions.push( sp );
	} );

	let show = new Show(
		row.id,
		row.locationId,
		row.date,
		row.tagLine,
		showPositions
	);

	return show;
}


