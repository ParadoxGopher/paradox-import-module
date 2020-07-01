
Hooks.once("init", init)

function init() {
    CreateCompendium()
}

async function CreateCompendium() {
    let compendiumName = "[dndbeyond] Items"

    let compendium = game.packs.find(pack => pack.collection === compendiumName)

    if (!compendium) {
        await Compendium.create({
            entity: "Item",
            label: compendiumName,
            name: "beyond-items",
            package: "world"
        })

        location.reload()
    } 
}