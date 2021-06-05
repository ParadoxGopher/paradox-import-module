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

async function OnIncomingChar(event) {
	let data = JSON.parse(event.detail)
	log("new actor data:", data)
	
	let character = game.user.character
	if (!character) {
		if (canvas.tokens.controlled.length < 1) {
			ui.notifications.error("no character assigned or selected!!")
			return
		}
		character = canvas.tokens.controlled[0].actor
	}

	let item = character.items.find(a => a.name === data.name && a.type === data.type)
	if (item) {
		data._id = item._id
		await character.updateOwnedItem(data).then(() => ui.notifications.info("updated "+data.name+" for "+character.name))
		return
	}

	await character.createOwnedItem(data).then(() => ui.notifications.info("added "+data.name+" to "+character.name))
}
