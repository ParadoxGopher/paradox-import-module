import items from "./items.js"
import monster from "./monster.js"
import settings from "./settings.js"

Hooks.once("ready", init)

const RequestEventType = "paradox-import:request"
const ResponseEventType = "paradox-import:response"

function init() {
    settings()   

    items()
    monster()
}
