import { log } from "./logger.js";

export function CreateDirectory(name, type, parent = null) {
	log("searching for existing directory (name)", name)
	log("searching for existing directory (type)", type)
	log("searching for existing directory (parent)", parent)

	let folder = null
	if (parent) {
		folder = parent.children.find(f => f.name == name && f.type == type)
	} else {
		folder = game.folders.find(f => f.name == name && f.type == type)
	}

	log("found", folder)
	if (!folder) {
		folder = Folder.create(
			{
				name: name,
				type: type,
				parent: parent
			}
		)
		log("created folder", folder)
	}

	return folder
}