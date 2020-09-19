import { log } from "./utils/logger.js"

export default function init() {
    let itemCompendii = game.packs
        .filter(p => p.entity === "Item")
        .reduce((choices, p) => {
            choices[p.collection] = `[${p.metadata.package}] ${p.metadata.label}`
            return choices
        }, {})

    log(itemCompendii)

    game.settings.register("paradox-importer-module", "spell-compendium", {
        name: "Spell Compendium",
        hint: "compendium to store spells",
        scope: "world",
        config: true,
        type: String,
        isSelect: true,
        choices: itemCompendii,
    })
}