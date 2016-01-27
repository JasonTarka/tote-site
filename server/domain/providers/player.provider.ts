'use strict';
import {Database} from "./database";

let singleton = require( '../../utils/utils' ).singleton,
	errors = require( '../../utils/errors' ),
	tools = require( './providerTools' ),
	Player = require( '../data/player' );

export class PlayerProvider {

	private get _db(): Database {
		return Database.instance;
	}

	fetchPlayers() {
		let sql = 'SELECT * FROM players';

		return new Promise( ( resolve, reject ) => {
			this._db.executeQuery( sql )
				.then(
					rows => resolve( rows.map( createPlayer ) )
				)
				.catch( reject );
		} );
	}

	fetchPlayer( playerId ) {
		let sql = 'SELECT * FROM players WHERE id = ?';

		return new Promise( ( resolve, reject ) => {
			this._db.executeQuery( sql, [playerId] )
				.then( players => {
					if( !players || players.length == 0 ) {
						return reject(
							new errors.NotFound( 'Player not found' )
						);
					}
					resolve( createPlayer( players[0] ) );
				} )
				.catch( reject );
		} );
	}

	createPlayer( player ) {
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

	/**
	 * @param player {Player}
	 */
	updatePlayer( player ) {
		return new Promise( ( resolve, reject ) => {
			if( !player.isDirty ) {
				return resolve();
			}

			let statement = tools.generateUpdateStatement( player, 'players' );

			this._db.executeNonQuery( statement.sql, statement.params )
				.then( () => {
					player.markClean();
					resolve();
				} )
				.catch( reject );
		} );
	}
}

function createPlayer( row ) {
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

/**
 * @returns {PlayerProvider}
 */
function construct() {
	return singleton( PlayerProvider );
}
