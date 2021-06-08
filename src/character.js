import { log } from "./utils/logger.js"
import { CreateCompendium, UpsertInto } from "./utils/compendium.js"

const ActorItemEventType = "paradox-import:incoming:actor_item"

const RequestEventType = "paradox-import:request"
const ResponseEventType = "paradox-import:response"

export default function init() {
	log("initiating Items")

	document.addEventListener(ActorItemEventType, OnIncomingActorItem)
	document.addEventListener(RequestEventType, OnRequest)
}

async function OnRequest(event) {
	let data = JSON.parse(event.detail)
	if (data.type !== "actor_item-request") return
	log("got actor_item-request request", data)
	let response = {
		type: "actor_item-response",
		payload: false,
		requestId: data.requestId,
	}

	let character = game.user.character
	if (!character) {
		if (canvas.tokens.controlled.length < 1) {
			ui.notifications.error("no character assigned or selected!!")
			return
		}
		character = canvas.tokens.controlled[0].actor
	}

	if (character.items.find(a => a.name === data.payload)) {
		response.payload = true
	}
	document.dispatchEvent(new CustomEvent(ResponseEventType, { detail: JSON.stringify(response) }))
}

async function OnIncomingActorItem(event) {
	const data = JSON.parse(event.detail)
	const itemData = data.payload
	log("new actor item data:", itemData)
	const character = game.user.character
	if (!character) {
		if (canvas.tokens.controlled.length < 1) {
			ui.notifications.error("no character assigned or selected!!")
			return
		}
		character = canvas.tokens.controlled[0].actor
	}

	const item = character.items.find(a => a.name === itemData.name)
	if (item && data.replace) {
		item.update(itemData)
		
		return
	}

	await character.createEmbeddedDocuments("Item", [itemData]).then(() => ui.notifications.info("added "+itemData.name+" to "+character.name))
}
