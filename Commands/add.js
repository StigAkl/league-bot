module.exports = {
    name: 'add',
    description: '!add <Summoner Name> - Adds your summoner to the live game tracking',
    cooldown: 5,
    execute(message, args) {
        message.channel.send("Not adding yet")
    }
}