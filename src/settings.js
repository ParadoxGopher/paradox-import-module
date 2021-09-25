import { log } from "./utils/logger.js"

export default function init() {
	let itemCompendii = game.packs
		.filter(p => p.entity === "Item")
		.reduce((choices, p) => {
			choices[p.collection] = `[${p.metadata.package}] ${p.metadata.label}`
			return choices
		}, {})

	let actorCompendii = game.packs
		.filter(p => p.entity === "Actor")
		.reduce((choices, p) => {
			choices[p.collection] = `[${p.metadata.package}] ${p.metadata.label}`
			return choices
		}, {})

	game.settings.register("paradox-importer-module", "spell-compendium", {
		name: "Spell Compendium",
		hint: "compendium to store spells",
		scope: "world",
		config: true,
		type: String,
		isSelect: true,
		choices: itemCompendii,
	})

	game.settings.register("paradox-importer-module", "monster-compendium", {
		name: "Monster Compendium",
		hint: "compendium to check for monster duplicates",
		scope: "world",
		config: true,
		type: String,
		isSelect: true,
		choices: actorCompendii,
	})

	game.settings.register("paradox-importer-module", "item-compendium", {
		name: "Items Compendium",
		hint: "compendium to store items",
		scope: "world",
		config: true,
		type: String,
		isSelect: true,
		choices: itemCompendii,
	})

	game.settings.register("paradox-importer-module", "feat-compendium", {
		name: "Features Compendium",
		hint: "compendium to store feats",
		scope: "world",
		config: true,
		type: String,
		isSelect: true,
		choices: itemCompendii,
	})

	game.settings.register("paradox-importer-module", "char-compendium-prefix", {
		name: "Prefix for class/race features",
		hint: "prefixes all compendiums for class and race features eg. [dndbeyond]",
		scope: "world",
		config: true,
		type: String,
		default: "[dndbeyond]"
	})

	game.settings.register("paradox-importer-module", "s3-host", {
		name: "s3 Host",
		hint: "eg 'https://s3.host.com' without trailing /",
		scope: "world",
		config: true,
		type: String
	})

	game.settings.register("paradox-importer-module", "image-proxy", {
		name: "image proxy",
		hint:"host to call to receive images for tokens",
		scope: "world",
		config: true,
		type: String
	})
}