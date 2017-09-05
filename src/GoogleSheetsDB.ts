const log = require('debug')('GoogleSheetsDB');
var GoogleSpreadsheet = require('google-spreadsheet');

const tableIndexes = {
	monsters: 0,
	battles: 1,
	turns: 2,
}

/**
 * VideoProvider via GoogleSheets.
 */
class GoogleSheetsDBProvider {

	sheetId: any;
	doc: any;

	constructor() {
		this.sheetId = '1fxKR4HQlEhOU3nFE3JG0nm3O3vLhTbk-cs4xhNQbBC4';
		this.doc = new GoogleSpreadsheet(this.sheetId);
		const creds = require('../google-generated-creds.json');
		this.doc.useServiceAccountAuth(creds, () => {});
	}

	fetchMonsters = () => {
		return this._getGoogleSheetRows(tableIndexes.monsters)
			.then((rows:any) => {
				const monsters = rows.map(row => this._monsterFromRow(row));
				return monsters;
			});
	}

	// This requires Google App API keys! https://developers.google.com/sheets/api/guides/authorizing
	updateMonster = (monster) => {
		return new Promise((resolve, reject) => {
			this.doc.getInfo((err, info) => {
				if (err) reject(err);
				const sheet = info.worksheets[tableIndexes.monsters];
				sheet.getRows({
					offset: 1,
					limit: 100,
				}, (err, rows) => {
					const row = rows.find(row => row.id === monster.id);
					if (!row) {
						resolve('Monster not found!');	
					}
					for (let prop in monster) {
						row[prop] = monster[prop];
					}
					row.save();
					resolve(this._monsterFromRow(row));
				});
			});
		});
	}

	_getGoogleSheetRows(tableIndex) {
		return new Promise((resolve, reject) => {
			this.doc.getInfo((err, info) => {
				if (err) reject(err);
				const sheet = info.worksheets[tableIndex];
				sheet.getRows({
					offset: 1,
					limit: 100,
					// orderby: 'col2'
				}, (err, rows) => {
					// log('rows', rows);
					resolve(rows);
				});
			});
		});
	}

	private _monsterFromRow(doc) {
		const monster = {
			id: doc.id,
			name: doc.name,
			health: doc.health,
			attack: doc.attack,
			defense: doc.defense,
			avatarUrl: doc.avatarurl,
		}
		return monster;
	}
}

const GoogleSheetsDB = new GoogleSheetsDBProvider();
export default GoogleSheetsDB;