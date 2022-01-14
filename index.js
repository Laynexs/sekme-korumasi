const {WebhookClient, Client, MessageEmbed} = require('discord.js');
const client = global.client = new Client({fetchAllMembers: true});
const ayarlar = require('./ayarlar.json');
const mongoose = require('mongoose');
const userDB = require('./schema/User');

mongoose.connect(ayarlar.mongodbURI)
    .then(() => {
        console.log("Mongoose baglanildi.")
    })
    .catch(err => {
        console.log(err)
    });

client.on("ready", async () => {
    client.user.setPresence({activity: {name: "Forcex"}, status: "dnd"});
    console.log("Bot Is Online")
});

const wc = new WebhookClient(ayarlar.webhook.id, ayarlar.webhook.token);

client.on("presenceUpdate", async (oldPresence, newPresence) => {
    if (newPresence.member.user.bot || ayarlar.developers.includes(newPresence.member.user.id)) return;
    if (ayarlar.developers.some(a => a.includes(newPresence.member.user.id))) return;

    let durum = Object.keys(newPresence.user.presence.clientStatus);

    const roles = newPresence.member.roles.cache.filter((_role) => _role.name !== "@everyone" && _role.editable && [8, 2, 4, 16, 32, 268435456
        , 1073741824, 131072].some((x) => _role.permissions.has(x))).map((x) => x.id)
    const otherRoles = newPresence.member.roles.cache.filter((_role) => ayarlar.otherRoles.find(a => _role.id == a)).map((x) => x.id)
    if (newPresence.member.hasPermission("ADMINISTRATOR") || newPresence.member.hasPermission("BAN_MEMBERS") || newPresence.member.hasPermission("MANAGE_ROLES") || newPresence.member.hasPermission("MANAGE_CHANNELS") || newPresence.member.hasPermission("MANAGE_GUILD") || newPresence.member.hasPermission("MANAGE_EMOJIS") || newPresence.member.hasPermission("KICK_MEMBERS") || newPresence.member.hasPermission("MENTION_EVERYONE")) {
        if (!durum.includes("web")) {
            let db = await userDB.findOne({userID: newPresence.member.id});
            if (!db) {
                new userDB({
                    userID: newPresence.member.user.id,
                    roles: otherRoles.concat(roles)
                })
            } else {
                await userDB.findOneAndUpdate({userID: newPresence.member.user.id}, {set: {role: otherRoles.concat(roles)}}, {upsert: true});
            }
            newPresence.member.roles.remove(roles).catch(err => {
                console.error(err)
            })

            const embed = new MessageEmbed()
                .setDescription(`${newPresence.member} üyesi tarayicidan girerek sunucuyu patlatmaya çalisti.`)
                .addField(`Sorun Yok :)`, `Rollerini Aldim.`)
                .addField(`Üye`, newPresence.member)
            const channel = client.channels.cache.get(ayarlar.log);
            channel.send(embed).catch(err => console.log(err))
            channel.send("@everyone").catch(err => console.log(err))
            wc.send(`@everyone Sunucuyu patlatcak, ${newPresence.member} (${newPresence.member.id}) üyesi tarayicidan girmeye çalisti rollerini aldim.`).catch(err => console.log(err))
        }
    }
})

client.login(ayarlar.token)
