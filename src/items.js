import { log } from "./utils/logger.js"

const ItemsTitle = "[dndbeyond] Items"
const ItemCompendiumName = "ddb.pi.items"
const ItemCompendiumPackage = "world"
const ItemCompendiumId = ItemCompendiumPackage + "." + ItemCompendiumName

const ItemEventType = "paradox-import:incoming:item"

export default function init() {
    log("initializing Items")
    CreateCompendium()
    CreateDirectories()

    document.addEventListener(ItemEventType, OnIncomingItem)
}

async function OnIncomingItem(event) {
    log("got event")
    let newItem = JSON.parse(event.detail)
    let itemDir = game.folders.entities.find(f => f.name === ItemsTitle)
    let targetDir = itemDir.children.find(f => f.name === newItem.type)
    if (!targetDir) {
        log("type directory does not exists... creating")
        targetDir = await Folder.create({
            name: newItem.type,
            type: itemDir.type,
            parent: itemDir._id
        })
    } else {
        log("direcoty exists")
    }
    newItem.folder = targetDir._id
    log("looking for existing item")
    const oldItem = targetDir.content.find(i => i.name === newItem.name)
    if (oldItem) {
        log("updating old item")
        newItem._id = oldItem._id
        await oldItem.update(newItem)
    } else {
        log("creating new item")
        newItem = await Item.create(newItem, {
            temporary: false,
            displaySheet: true,
        })
    }

    await UpdateItemInCompendium(newItem)
}

async function UpdateItemInCompendium(newItem) {
    let comp = game.packs.get(ItemCompendiumId)
    let index = await comp.getIndex()
    let oldItem = index.find(item => item.name === newItem.name)
    if (!oldItem) {
        log("adding new item to compendium")
        await comp.createEntity(newItem).then(e => {
            log('created item', e)
            ui.notifications.info('Imported Item: ' + newItem.name)
        }).catch(e => {
            log('failed creating item', e)
            ui.notifications.error('Could not import Item: ' + newItem.name)
        })
    } else {
        log("found old item: ", oldItem)
        newItem._id = oldItem._id
        await comp.updateEntity(newItem).then(() => {
            log("updated item")
            ui.notifications.info("Updated Item: " + newItem.name)
        }).catch(e => {
            log("failed to update item")
            ui.notifications.error("could not update Item: " + newItem.name)
        })
    }
}

async function CreateCompendium() {
    log("searching for existing item compendium")
    let compendium = game.packs.get(ItemCompendiumId)
    if (!compendium) {
        log("creating compendium")
        await Compendium.create({
            entity: "Item",
            label: ItemsTitle,
            name: ItemCompendiumName,
            package: ItemCompendiumPackage
        })

        location.reload()
    }
    log("compendium is set up")
}

async function CreateDirectories() {
    log("searching for existing item directory")
    let folder = game.folders.entities.find(f => f.name === ItemsTitle)
    if (!folder) {
        log("creating folder")
        Folder.createDialog(
            {
                name: ItemsTitle,
                type: "Item"
            }
        )
    } else {
        log("direcoty exists")
    }
}