import { log } from "./utils/logger.js"
import { CreateCompendium, UpsertInto } from "./utils/compendium.js"

const CharEventType = "paradox-import:incoming:char"

const RequestEventType = "paradox-import:request"
const ResponseEventType = "paradox-import:response"

export default function init() {
	log("initiating Items")

	document.addEventListener(CharEventType, OnIncomingChar)
	document.addEventListener(RequestEventType, OnRequest)
}

async function OnRequest(event) {
	let data = JSON.parse(event.detail)
	if (data.type !== "char-request") return
	log("got request", data)
	let response = {
		type: "char-response",
		payload: false,
		requestId: data.requestId,
	}

	if (!data.origin) return

	let compName = game.settings.get("paradox-importer-module", "char-compendium-prefix") + " " + data.origin
	let comp = game.packs.find(p => p.metadata.label === compName)

	if (comp) {
		let compIdx = await comp.getIndex()
		response.payload = compIdx.some(s => s.name === data.payload)
	}
	
	log(response)
	document.dispatchEvent(new CustomEvent(ResponseEventType, { detail: JSON.stringify(response) }))
}

async function OnIncomingChar(event) {
	log("got event")
	// TODO: implement storage
	let data = JSON.parse(event.detail)

	let itemOrigin = data.origin
	let itemData = data.item

	let newItem = await Item.create(itemData, { temporary: true })

	let compName = game.settings.get("paradox-importer-module", "char-compendium-prefix") + " " + itemOrigin
	let compId = game.packs.find(p => p.metadata.label === compName)

	if (!compId) {
		await CreateCompendium(compName, "Item", "dndbeyond-"+itemOrigin, "pxg-magicks")
		compId = game.packs.find(p => p.metadata.label === compName)
	}

	await UpsertInto(compId.collection, newItem)
	
	log(newItem)
	// TODO: implement add to actor
}
