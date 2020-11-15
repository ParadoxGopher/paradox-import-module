import items from "./items.js"
import monster from "./monster.js"
import actors from "./actors.js"
import settings from "./settings.js"

Hooks.once("ready", init)

function init() {
    settings()   

    items()
	monster()
	actors()
}
