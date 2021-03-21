import items from "./items.js"
import monster from "./monster.js"
import settings from "./settings.js"
import character from "./character.js"

Hooks.once("ready", init)

function init() {
    settings()   

    items()
	monster()
	character()
}
