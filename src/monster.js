import { log } from "./utils/logger.js"
import { CreateDirectory } from "./utils/directory.js"

const MonstersTitle = "[dndbeyond] Monsters"

const MonsterEventType = "paradox-import:incoming:monster"

const RequestEventType = "paradox-import:request"
const ResponseEventType = "paradox-import:response"

export default function init() {
	log("initiating monsters")

    CreateDirectory(MonstersTitle, "Actor")

    document.addEventListener(MonsterEventType, OnIncomingMonster)
    document.addEventListener(RequestEventType, OnMonsterRequest)
}

async function OnMonsterRequest(event) {
    log("request inbound")
    let data = JSON.parse(event.detail)
    log(data)
    if (data.type !== "monster-request") return
    let dir = await CreateDirectory(MonstersTitle, "Actor")
    let exists = dir.children.some(d => d.content.some(m => m.name === data.payload))
    log("sending", exists)
    document.dispatchEvent(new CustomEvent(ResponseEventType, { detail: JSON.stringify({ type: "monster-response", payload: exists, requestId: data.requestId }) }))
}

async function OnIncomingMonster(event) {
    let newMonster = JSON.parse(event.detail)
    log("got monster from event", newMonster)
    await UpsertMonster(newMonster)
}

async function UpsertMonster(newMonster) {
    let items = newMonster.items
    newMonster.items = []
    let monsterDir = await CreateDirectory(MonstersTitle, "Actor")
    let targetDir = await CreateDirectory(newMonster.data.details.type, "Actor", monsterDir._id)
    newMonster.folder = targetDir._id
    const oldMonster = targetDir.content.find(m => m.name === newMonster.name)
    if (oldMonster) {
        log("updating old monster", newMonster)
        newMonster._id = oldMonster._id
        newMonster.img = oldMonster.img
        await oldMonster.update(newMonster).then(() => {
            oldMonster.createEmbeddedEntity("OwnedItem", items)
            ui.notifications.info("[Monster] Updated: " + newMonster.name)
        }).catch(e => {
            log("failed updating monster", e)
            ui.notifications.error("[Monster] Failed updating: " + newMonster.name)
        })
        return await targetDir.content.find(m => m.name === newMonster.name)
    } else {
        log("creating new monster", newMonster)
        await Actor.create(newMonster).then((created) => {
			created.createEmbeddedEntity("OwnedItem", items)
            ui.notifications.info("[Monster] Created: " + newMonster.name)
        }).catch(e => {
            log("failed creating monster", e)
            ui.notifications.error("[Monster] Failed creating: " + newMonster.name)
        })
        created.createEmbeddedEntity("OwnedItem", items)

        return created
    }
}
