import { log } from "./logger.js";

export async function CreateDirectory(name, type, parent = null) {
    log("searching for existing directory (name)", name)
    log("searching for existing directory (type)", type)
    log("searching for existing directory (parent)", parent)
    let folder = game.folders.entities.find(f => f.data.name === name && f.data.parent === parent)
    log("found", folder)
    if (!folder) {
        log("creating folder")
        folder = await Folder.create(
            {
                name: name,
                type: type,
                parent: parent
            }
        )
    }
    //log("direcoty is set up")

    return folder
}