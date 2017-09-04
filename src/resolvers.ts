const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync') 
const adapter = new FileSync('database.json')
const db = low(adapter)
const shortid = require('shortid')

db.defaults({ monsters: [
	{name: 'George', attack: 6, defense: 4, health: 30, avatarUrl: ''},
	{name: 'Mort', attack: 6, defense: 4, health: 30, avatarUrl: ''},
	{name: 'Steve', attack: 6, defense: 4, health: 30, avatarUrl: ''},
	{name: 'Donk', attack: 6, defense: 4, health: 30, avatarUrl: ''},
	{name: 'Flip', attack: 6, defense: 4, health: 30, avatarUrl: ''},
	{name: 'Reginald', attack: 6, defense: 4, health: 30, avatarUrl: ''},
	{name: 'Simon', attack: 6, defense: 4, health: 30, avatarUrl: ''},
	{name: 'Snot', attack: 6, defense: 4, health: 30, avatarUrl: ''},
], battles: [], turns: [] }).write()

const resolvers = {
	Query: {
		monsters: (root, args, ctx) => {
			const monsters = db.get('monsters').value();
			console.log('monsters', monsters);
			return monsters;
		},
		battles: (root, args, ctx) => {
			// return DB.fetchBattles()
		},
	},
	
	Mutation: {	
		addMonster: (root, args, ctx) => {
			const id = shortid.generate() 
			db.get('monsters')
				.push({ ...args, id: id })
				.write()
			return db.get('monsters')
				.find({ id: id })
				.value()
		},

		updateMonster: (root, args, ctx) => {
			db.get('monsters')
				.find({ id: args.id })
				.assign(args)
				.write()
			return db.get('monsters')
				.find({ id: args.id })
				.value()
		},

		deleteMonster: (root, args, ctx) => {
			return db.get('monsters')
				.remove({ id: args.id })
				.write()
		},
		
		newBattle: (root, args, ctx) => {
			const id = shortid.generate()
			db.get('battles')
				.push({ 
					...args, 
					id: id,
					started: Math.floor(Date.now() / 1000),
				})
				.write()
			return db.get('battles')
				.find({ id: id })
				.value()
		},

		doBattleTurn: (root, args, ctx) => {
			const battle = db.get('battles').find({ id: args.battleId })
			if (!battle) return 'battle not found!';
			const monster1 = db.get('monster').find({ name: battle.monster1Name }).value();
			if (!monster1) return 'monster1 not found!';
			const monster2 = db.get('monster').find({ name: battle.monster2Name }).value();
			if (!monster2) return 'monster2 not found!';

			const attackingMonster = db.get('monster').find({ name: args.attackingMonsterName }).value();
			if (!attackingMonster) return 'attackingMonster not found!';

			const defendingMonster = db.get('monster').find({ name: args.defendingMonsterName }).value();
			if (!defendingMonster) return 'defendingMonster not found!';

			const attackDiceRoll = Math.floor(Math.random() * 6) + 1;

			const id = shortid.generate() 
			db.get('turn')
				.push({
					...args,
					attackDiceRoll: attackDiceRoll,
					attackPower: attackDiceRoll + attackingMonster.attack,
					defensePower: defendingMonster.defense,
					damage: Math.max(defendingMonster.defense - (attackDiceRoll + attackingMonster.attack), 0),
				})
				.write()
		
			return db.get('battles')
				.find({ id: args.battleId })
				.value()
		},
	},

	Battle: {
	  turns: (battle) => {
			// return DB.fetchTurns(battle.id);
		},
	},
};

export default resolvers;