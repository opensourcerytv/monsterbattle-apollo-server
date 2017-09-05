const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync') 
const adapter = new FileSync('database.json')
const db = low(adapter)
const shortid = require('shortid')

// Setup database. Add default data if table is empty.
db.defaults({ monsters: [], battles: [], turns: [] }).write()
const defaultData = require('../database-default.json')
if (db.get('monsters').value().length === 0) defaultData.monsters.map(monster => db.get('monsters').push({ ...monster, id: shortid.generate() }).write());
if (db.get('battles').value().length === 0) defaultData.battles.map(battle => db.get('battles').push({ ...battle, id: shortid.generate() }).write());
if (db.get('turns').value().length === 0) defaultData.battles.map(turn => db.get('turns').push({ ...turn, id: shortid.generate() }).write());

// Build resolvers obj.
const resolvers = {
	Query: {
		monsters: (root, args, ctx) => {
			return db.get('monsters').value()
		},
		battles: (root, args, ctx) => {
			return db.get('battles').value()
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
		
		startBattle: (root, args, ctx) => {
			const monster1 = db.get('monsters').find({ name: args.monster1Name }).value()
			if (!monster1) return null // return 'monster1 not found!';
			const monster2 = db.get('monsters').find({ name: args.monster2Name }).value()
			if (!monster2) return null // return 'monster2 not found!';
			
			const id = shortid.generate()
			

			
			db.get('battles')
				.push({ 
					...args, 
					id: id,
					monster1Health: monster1.health,
					monster2Health: monster2.health,
					started: Math.floor(Date.now() / 1000),
					finished: null,
					winner: null,
					loser: null,
				})
				.write()
			return db.get('battles')
				.find({ id: id })
				.value()
		},

		doBattleTurn: (root, args, ctx) => {
			// Validate request integrity.
			const battle = db.get('battles').find({ id: args.battleId }).value();
			if (!battle) return null // return 'battle not found!';
			// console.log('battle', battle)
			const monster1 = db.get('monsters').find({ name: battle.monster1Name }).value()
			if (!monster1) return null // return 'monster1 not found!';
			console.log('monster1', monster1)
			const monster2 = db.get('monsters').find({ name: battle.monster2Name }).value()
			if (!monster2) return null // return 'monster2 not found!';
			console.log('monster2', monster2)
			const attackingMonster = db.get('monsters').find({ name: args.attackingMonsterName }).value()
			if (!attackingMonster) return null // return 'attackingMonster not found!';
			// console.log('attackingMonster', attackingMonster)
			const defendingMonster = db.get('monsters').find({ name: args.defendingMonsterName }).value()
			if (!defendingMonster) return null // return 'defendingMonster not found!';
			console.log('defendingMonster', defendingMonster)

			// Roll the dice!
			const attackDiceRoll = Math.floor(Math.random() * 6) + 1
			const damage = (attackDiceRoll + attackingMonster.attack) - defendingMonster.defense

			const turn = {
				...args,
				id: shortid.generate(),
				timestamp: Math.floor(Date.now() / 1000),
				attackDiceRoll: attackDiceRoll,
				attackPower: attackDiceRoll + attackingMonster.attack,
				defensePower: defendingMonster.defense,
				damage: damage,
			}
			console.log('turn', turn);
			// Insert turn into db.
			db.get('turns')
				.push(turn)
				.write()

			// Update battle
			if (monster1.name === defendingMonster.name) {
				battle.monster1Health = battle.monster1Health - damage, 0
				if (!battle.monster1Health) { // If monster health = 0, battle is over.
					battle.winningMonsterName = monster2.name
					battle.losingMonsterName = monster1.name
					battle.finished = Math.floor(Date.now() / 1000)
				}
			}
			if (monster2.name === defendingMonster.name) {
				battle.monster2Health = battle.monster2Health - damage, 0
				if (!battle.monster2Health) { // If monster health = 0, battle is over.
					battle.winningMonsterName = monster1.name
					battle.losingMonsterName = monster2.name
					battle.finished = Math.floor(Date.now() / 1000)
				}
			}
			// Save updated battle.
			db.get('battles')
				.find({ id: battle.id })
				.assign(battle)
				.write()

			// return the full battle.
			return db.get('battles')
				.find({ id: args.battleId })
				.value()
		},
	},

	Battle: {
		monster1: (battle) => {
			return db.get('monsters')
				.find({ name: battle.monster1Name })
				.value()
			
		},
		monster2: (battle) => {
			return db.get('monsters')
				.find({ name: battle.monster2Name })
				.value()
			
		},
		turns: (battle) => {
			return db.get('turns')
				.filter({battleId: battle.id})
				.value()
		},
	},
};

export default resolvers