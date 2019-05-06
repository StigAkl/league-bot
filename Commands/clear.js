module.exports = {
    name: "clear",
    description: "Clear messages",
    cooldown: 1,
    async execute(message, args) {
        
        if (message.author.id !== "237187264424181760")  {
            return ; 
        } else {
        if(args.length === 0) {
            message.channel.send("Bruk: !clear <antall>");
        } else {
            if(isNaN(args[0])) {
                message.channel.send("Ugyldig antall meldinger");
            } else {

                if(args[0] > 100) {
                    args[0] = 100;
                }
                   message.channel.bulkDelete(args[0]).then(() => {
                       message.channel.send("Deleted..lots of messages :)").then((msg) => {
                           msg.delete(3000); 
                       });
                   });
                }
            }
        }
    }
};