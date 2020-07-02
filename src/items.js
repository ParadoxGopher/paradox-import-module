import { log } from "./utils/logger.js"
import { CreateCompendium, UpsertInto } from "./utils/compendium.js"
import { CreateDirectory } from "./utils/directory.js"

const ItemsTitle = "[dndbeyond] Items"
const ItemCompendiumName = "ddb.pi.items"
const ItemCompendiumPackage = "world"
const ItemCompendiumId = ItemCompendiumPackage + "." + ItemCompendiumName

const ItemEventType = "paradox-import:incoming:item"

export default function init() {
    log("initializing Items")
    CreateCompendium(ItemsTitle, "Item", ItemCompendiumName, ItemCompendiumPackage)
    CreateDirectory(ItemsTitle, "Item")

    document.addEventListener(ItemEventType, OnIncomingItem)
}

async function OnIncomingItem(event) {
    log("got event")
    let newItem = JSON.parse(event.detail)
    newItem = await UpsertItem(newItem)
    await UpsertInto(ItemCompendiumId, newItem)
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
        newItem = await Item.create(newItem, {
            temporary: false,
            displaySheet: true,
        }).then(() => {
            ui.notifications.info("[Item] Created: " + newItem.name)
        }).catch(e => {
            log("failed creating item", e)
            ui.notifications.error("[Item] Failed creating: " + newItem.name)
        })
    }

    return newItem
}
