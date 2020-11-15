import { log } from "./utils/logger.js"

const ActorsEventType = "paradox-import:incoming:actor"

const RequestEventType = "paradox-import:request"
const ResponseEventType = "paradox-import:response"

export default function init() {
	log("initiating Actors")

	document.addEventListener(ActorsEventType, OnIncomingActor)
	document.addEventListener(RequestEventType, OnActorRequest)
}

async function OnActorRequest(event) {
	let data = JSON.parse(event.data)
	if (data.type !== "actors-request") return
	log("got request", data)
	let response = {
		type: "actors-response",
		payload: false,
		requestId: data.requestId,
	}

	let a = await game.actors.find(a => a.name === data.payload)
	if (a) {
		response.payload = true
	}
	document.dispatchEvent(new CustomEvent(ResponseEventType, { detail: JSON.stringify(response) }))
}

async function OnIncomingActor(event) {
	let newActor = JSON.parse(event.detail)
	log("new actor:", newActor)
	game.actors.insert(newActor).then(() => {
		log("created new actor")
		ui.notifications.info("created " + newActor.name)
	}).catch(() => {
		ui.notifications.error("error creating actor")
	})
}