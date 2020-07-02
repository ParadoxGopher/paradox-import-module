import { log } from "./utils/logger.js"
import { CreateCompendium, UpsertInto } from "./utils/compendium.js"
import { CreateDirectory } from "./utils/directory.js"

const MonstersTitle = "[dndbeyond] Monsters"
const MonsterCompendiumName = "ddb.pi.monsters"
const MonsterCompendiumPackage = "world"
const MonsterCompendiumId = MonsterCompendiumPackage + "." + MonsterCompendiumName

const MonsterEventType = "paradox-import:incoming:monster"


export default function init() {
    log("initializing monsters")
    CreateCompendium(MonstersTitle, "Actor", MonsterCompendiumName, MonsterCompendiumPackage)
    CreateDirectory(MonstersTitle, "Actor")

    document.addEventListener(MonsterEventType, OnIncomingMonster)
}

async function OnIncomingMonster(event) {
    let newMonster = JSON.parse(event.detail)
    log("got monster from event", newMonster)
    await UpsertMonster(newMonster)
    await UpsertInto(MonsterCompendiumId, newMonster)
}

async function UpsertMonster(newMonster) {
    let monsterDir = await CreateDirectory(MonstersTitle, "Actor")
    let targetDir = await CreateDirectory(newMonster.type, "Actor", monsterDir._id)
    newMonster.folder = targetDir._id
    const oldMonster = targetDir.content.find(m => m.name === newMonster.name)
    if (oldMonster) {
        log("updating old monster")
        newMonster._id = oldMonster._id
        await oldMonster.update(newMonster)
    } else {
        log("creating new monster")
        newMonster = await Actor.create(newMonster)
    }
}
