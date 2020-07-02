import { log } from "./logger.js";

export async function CreateCompendium(title, type, name, pkg) {
    //log("searching for existing compendium")
    let compendium = game.packs.get(pkg + "." + name)
    if (!compendium) {
        //log("creating compendium")
        await Compendium.create({
            entity: type,
            label: title,
            name: name,
            package: pkg
        })

        //location.reload()
    }
    //log("compendium is set up")

    return compendium
}

export async function UpsertInto(compendiumId, entity) {
    let comp = game.packs.get(compendiumId)
    if (!comp) {
        log("compendium does not exist")
        return
    }
    let index = await comp.getIndex()
    let old = index.find(e => e.name === entity.name)
    if (!old) {
        log("creating new compendium entry")
        await comp.createEntity(entity).then(() => {
            log("created", entity)
            ui.notifications.info("Imported: " + entity.name)
        }).catch(e => {
            log("failed creating entity", e)
            ui.notifications.error("Failed importing: " + entity.name)
        })
    } else {
        log("updating existing compendium entry")
        let raw = JSON.stringify(entity)
        entity = JSON.parse(raw)
        entity._id = old._id
        await comp.updateEntity(entity).then(() => {
            log("updated", entity)
            ui.notifications.info("[Compendium] Updated: " + entity.name)
        }).catch(e => {
            log("failed updating entity", e)
            ui.notifications.error("[Compendium] Failed updating: " + entity.name)
        })
    }
}
