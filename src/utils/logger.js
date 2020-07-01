export function log(message1, message2 = null) {
    const PREFIX = "ParadoxImport |"
    if (message2 == null) {
        console.log(PREFIX, message1)
        return
    }
    console.log(PREFIX, message1, message2)
}
