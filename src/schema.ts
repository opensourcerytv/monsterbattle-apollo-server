const typeDefs = `
	type Monster {	
		id: String!
		name: String!
		health: Int!
		attack: Int!
		defense: Int!
		avatarUrl: String!
	}

	type Battle {	
		id: String!
		monster1Name: String!,
		monster1: Monster!
		monster2Name: String!,
		monster2: Monster!
		turns: [Turn]
		started: Int!
		finished: Int
		winner: Monster
		loser: Monster
	}

	type Turn {	
		id: String!
		battleId: String!
		attackingMonsterName: Monster!
		defendingMonsterName: Monster!
		attackDiceRoll: Int!
		attackPower: Int!
		defensePower: Int!
		damage: Int!
	}

	type Query {
		monsters: [Monster]
		battles: [Battle]
		turns(battleId: Int!): [Turn] 
	}

	type Mutation {
		addMonster(
			name: String!
			health: Int!
			attack: Int!
			defense: Int!
			avatarUrl: String!
		): Monster

		updateMonster(
			id: String!
			name: String
			health: Int
			attack: Int
			defense: Int
			avatarUrl: String
		): Monster

		deleteMonster(
			id: String!
		): Boolean
		
		startBattle(
			monster1Name: String!
			monster2Name: String!
		): Battle

		doBattleTurn(
			battleId: Int!
			attackingMonsterName: String!
			defendingMonsterName: String!
		): Battle
	}
`;

export default typeDefs;