'use strict';
import {Database} from "./database";
import {ID} from "../../types/types";
import {NotFound} from "../../utils/errors";
import {Player} from "../data/player";

export class PlayerProvider {

	private get _db():Database {
		return Database.instance;
	}

	fetchPlayers():Promise<Player[]> {
		let sql = 'SELECT * FROM players';

		return new Promise( ( resolve, reject ) => {
			this._db.executeQuery( sql )
				.then(
					rows => resolve( rows.map( createPlayer ) )
				)
				.catch( reject );
		} );
	}

	fetchPlayer( playerId:ID ):Promise<Player> {
		let sql = 'SELECT * FROM players WHERE id = ?';

		return new Promise( ( resolve, reject ) => {
			this._db.executeQuery( sql, [playerId] )
				.then( players => {
					if( !players || players.length === 0 ) {
						return reject(
							new NotFound( 'Player not found' )
						);
					}
					resolve( createPlayer( players[0] ) );
				} )
				.catch( reject );
		} );
	}

	createPlayer( player:Player ):Promise<Player> {
		let sql = `INSERT INTO players(name, email, bio, imgPath, isActive)
				  VALUES(?, ?, ?, ?, ?)`,
			values = [
				player.name,
				player.email,
				player.bio,
				player.imgPath,
				player.isActive
			];

		return this._db.executeInsert( sql, values )
			.then( newId => this.fetchPlayer( newId ) );
	}

	updatePlayer( player:Player ):Promise<void> {
		return this._db.updateDataObject( player, 'players' );
	}
}

function createPlayer( row ):Player {
	let player = new Player(
		row.id,
		row.name,
		row.email || null,
		row.bio || null,
		row.imgPath || null,
		!!row.isActive
	);
	return player;
}
