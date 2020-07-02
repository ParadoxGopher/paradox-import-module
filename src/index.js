import items from "./items.js"
import monster from "./monster.js";

Hooks.once("ready", init)

function init() {
    items()
    monster()
}
