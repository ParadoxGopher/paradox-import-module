import { log } from "./utils/logger.js"
import { CreateCompendium, UpsertInto, FindIn } from "./utils/compendium.js"
import { CreateDirectory } from "./utils/directory.js"

const ItemsTitle = "[dndbeyond] Items"
const ItemCompendiumName = "ddb.pi.items"
const ItemCompendiumPackage = "world"
const ItemCompendiumId = ItemCompendiumPackage + "." + ItemCompendiumName
const SRDItemCompendiumId = "dnd5e.items"

const SpellTitle = "[dndbeyond] Spells"
const SpellCompendiumName = "ddb.pi.spells"
const SpellCompendiumPackage = "world"
const SpellCompendiumId = SpellCompendiumPackage + "." + SpellCompendiumPackage + "." + SpellCompendiumName
const SRDSpellCompendiumId = "dnd5e.spells"

const ItemEventType = "paradox-import:incoming:item"

const RequestEventType = "paradox-import:request"
const ResponseEventType = "paradox-import:response"

export default function init() {
    log("initializing Items")
    CreateCompendium(ItemsTitle, "Item", ItemCompendiumName, ItemCompendiumPackage)

    document.addEventListener(ItemEventType, OnIncomingItem)
    document.addEventListener(RequestEventType, OnRequest)
}

async function OnRequest(event) {
    let data = JSON.parse(event.detail)
    if (!data.type.match(/(spell-request|item-request)/)) return
    log("got request", data)
    let response = {
        type: "",
        payload: false,
        requestId: data.requestId,
    }
    switch (data.type) {
        case "spell-request":
            let comId = await game.settings.get("paradox-importer-module", "spell-compendium")
            if (!comId || comId === "") {
                ui.notifications.error("no spell compendium set")
                log("spell-compendium is not set")
                return
            }
            let spellIdx = await game.packs.get(comId).getIndex()
            response.type = "spell-response"
            response.payload = spellIdx.some(s => s.name === data.payload)
            break
        case "item-request":
            let idx = await game.packs.get(ItemCompendiumId).getIndex()
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
            UpsertInto(SpellCompendiumId, newItem)
            break
        default:
            UpsertInto(ItemCompendiumId, newItem)
            break
    }
}

async function UpsertItem(newItem) {
    let itemDir = await CreateDirectory(ItemsTitle, "Item")
    let targetDir = await CreateDirectory(newItem.type, itemDir.type, itemDir._id)
    newItem.folder = targetDir._id
    log("looking for existing item")
    const oldItem = targetDir.content.find(i => i.name === newItem.name)
    if (oldItem) {
        log("updating old item")
        newItem._id = oldItem._id
        await oldItem.update(newItem)
        return targetDir.content.find(i => i.name === newItem.name)
    } else {
        log("creating new item")
        newItem = await Item.create(newItem).then(() => {
            ui.notifications.info("[Item] Created: " + newItem.name)
        }).catch(e => {
            log("failed creating item", e)
            ui.notifications.error("[Item] Failed creating: " + newItem.name)
        })
    }

    return newItem
}
