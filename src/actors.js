import { log } from "./utils/logger.js"

const ActorsEventType = "paradox-import:incoming:actor"

const RequestEventType = "paradox-import:request"
const ResponseEventType = "paradox-import:response"

export default function init() {
	log("initiating Actor")

	document.addEventListener(ActorsEventType, OnIncomingActor)
	document.addEventListener(RequestEventType, OnActorRequest)
}

async function OnActorRequest(event) {
	let data = JSON.parse(event.detail)
	if (data.type !== "actor-request") return
	log("got request", data)
	let response = {
		type: "actor-response",
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

async function OnIncomingActor(event) {
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

	character.createEmbeddedEntity("OwnedItem", data)
}