import { log } from "./utils/logger.js"
import { UpsertInto } from "./utils/compendium.js"

const ItemEventType = "paradox-import:incoming:item"

const RequestEventType = "paradox-import:request"
const ResponseEventType = "paradox-import:response"

export default function init() {
	log("initiating Items")

	document.addEventListener(ItemEventType, OnIncomingItem)
	document.addEventListener(RequestEventType, OnRequest)
}

async function OnRequest(event) {
	let data = JSON.parse(event.detail)
	if (!data.type.match(/^(spell-request|item-request|feat-request)$/)) return
	log("got request", data)
	let response = {
		type: "",
		payload: false,
		requestId: data.requestId,
	}
	switch (data.type) {
		case "feat-request":
			let featComId = await game.settings.get("paradox-importer-module", "feat-compendium")
			if (!featComId || featComId === "") {
				ui.notifications.error("no feat compendium set")
				log("feat-compendium is not set")
				return
			}
			let featIdx = await game.packs.get(featComId).getIndex()
			response.type = "feat-response"
			response.payload = featIdx.some(s => s.name === data.payload)
			break
		case "spell-request":
			let spellComId = await game.settings.get("paradox-importer-module", "spell-compendium")
			if (!spellComId || spellComId === "") {
				ui.notifications.error("no spell compendium set")
				log("spell-compendium is not set")
				return
			}
			let spellIdx = await game.packs.get(spellComId).getIndex()
			response.type = "spell-response"
			response.payload = spellIdx.some(s => s.name === data.payload)
			break
		case "item-request":
			let itemComId = await game.settings.get("paradox-importer-module", "item-compendium")
			if (!itemComId || itemComId === "") {
				ui.notifications.error("no item compendium set")
				log("item-compendium is not set")
				return
			}
			let idx = await game.packs.get(itemComId).getIndex()
			response.type = "item-response"
			response.payload = idx.some(i => i.name === data.payload)
			break
		default:
			log("unknown request on items")
			return
	}

	log(response)

	document.dispatchEvent(new CustomEvent(ResponseEventType, { detail: JSON.stringify(response) }))
}

async function OnIncomingItem(event) {
	log("got event")
	let newItem = await Item.create(JSON.parse(event.detail), { temporary: true })
	switch (newItem.type) {
		case "spell":
			UpsertInto(game.settings.get("paradox-importer-module", "spell-compendium"), newItem)
			break
		case "feat":
			UpsertInto(game.settings.get("paradox-importer-module", "feat-compendium"), newItem)
			break
		default:
			UpsertInto(game.settings.get("paradox-importer-module", "item-compendium"), newItem)
			break
	}
}
