import { log } from "./logger.js";

export async function CreateDirectory(name, type, parent = null) {
	log("searching for existing directory (name)", name)
	log("searching for existing directory (type)", type)
	log("searching for existing directory (parent)", parent)

	let folder = null
	let parentId = ""
	if (parent) {
		const parentFolder = game.folders.find(f => f.name == parent && f.type == type)
		parentId = parentFolder.id
		folder = parentFolder.children.find(f => f.name == name)
	} else {
		folder = game.folders.find(f => f.name == name && f.type == type)
	}

	if (!folder) {
		folder = await Folder.create(
			{
				name: name,
				type: type,
				parent: parentId
			}
		)
		log("created folder", folder)
	}

	return folder
}