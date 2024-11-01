const { 
    ActionRowBuilder, 
    StringSelectMenuBuilder, 
    StringSelectMenuOptionBuilder, 
    SlashCommandBuilder, 
    PermissionsBitField,
    ComponentType,
    ChannelType
} = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName("admin")
        .setDescription('Select a member and ban them.')
        .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator),

    async execute(interaction) {
        const select = new StringSelectMenuBuilder()
            .setCustomId('Setup')
            .setPlaceholder('What would you like to set up?')
            .addOptions(
                new StringSelectMenuOptionBuilder()
                    .setLabel('Streamer')
                    .setDescription('Sets up all the streamer channels, roles, and perms')
                    .setValue('streamer'),
                new StringSelectMenuOptionBuilder()
                    .setLabel('Bug')
                    .setDescription('Sets up all the bug reporting channels, roles, and perms')
                    .setValue('bug')
            );

        const row = new ActionRowBuilder().addComponents(select);

        await interaction.reply({
            content: 'Choose what to set up!',
            components: [row],
            ephemeral: true,
        });
        
        const collector = interaction.channel.createMessageComponentCollector({ componentType: ComponentType.StringSelect, time: 3_600_000 });

        collector.on('collect', async i => {
            if (i.user.id !== interaction.user.id) {
                return i.reply({ content: 'You cannot use this selection!', ephemeral: true });
            }

            const selection = i.values[0];

            if (selection === 'streamer'){
                let guild = interaction.guild;
                // look for the role
                let streamerKey = guild.roles.cache.find(role => role.name === "streamer-key");
                let user = interaction.user.id;

                // if role doesnt exist
                if (!streamerKey) {
                    // create it
                    streamerKey = await guild.roles.create({
                        name: "streamer-key",
                        reason: "Allows you to join the stream channel"
                    });
                    // log that it was created
                    console.log(`Created "streamer-key" role in ${guild.name}: ${streamerKey.id}`);
                } else {
                    // log that it was found
                    console.log(`Found "streamer-key" role in ${guild.name}: ${streamerKey.id}`);
                }

                await i.reply({
                    content: `Found/Created the streamer-key role!`,
                    ephemeral: true,
                })

            } else if (selection === 'bug') {

                // look for the role
                let threadManagerRole = interaction.guild.roles.cache.find(role => role.name === "thread-manager");
                // get tango's id
                const tango = await interaction.guild.members.fetch(interaction.client.user.id);

                let guild = interaction.guild;


                // if role doesnt exist
                if (!threadManagerRole) {
                    // create it
                    threadManagerRole = await guild.roles.create({
                        name: "thread-manager",
                        reason: "Created for managing threads."
                    });
                    // log that it was created
                    console.log(`Created "thread-manager" role in ${guild.name}: ${threadManagerRole.id}`);
                } else {
                    // log that it was found
                    console.log(`Found "thread-manager" role in ${guild.name}: ${threadManagerRole.id}`);
                }

                // check if the bot has the "thread-manager" role if not add it
                if (!tango.roles.cache.has(threadManagerRole.id)) {
                    // add the role
                    await tango.roles.add(threadManagerRole);
                    // output to console
                    console.log(`Assigned "thread-manager" role to the bot in ${guild.name}`);
                }

                // find bug-reports forum channel
                let bugReportsChannel = await findChannelByName(guild, "bug-reports", ChannelType.GuildForum);

                // if wasnt found
                if (!bugReportsChannel) {
                    // try to create channel
                    try {
                        // create channel
                        bugReportsChannel = await guild.channels.create({
                            name: "bug-reports",
                            type: ChannelType.GuildForum,
                            reason: "Created by Tang0 bot.",
                            permissionOverwrites: [
                                {
                                    id: guild.id, // @everyone
                                    allow: [PermissionsBitField.Flags.SendMessages], // make sure people can send messages
                                    deny: [
                                        PermissionsBitField.Flags.CreatePublicThreads,
                                        PermissionsBitField.Flags.CreatePrivateThreads // get rid of thread creation perms
                                    ],
                                },
                                {
                                    id: threadManagerRole.id, // "thread-manager" role
                                    allow: [
                                        PermissionsBitField.Flags.SendMessages,
                                        PermissionsBitField.Flags.CreatePublicThreads,
                                        PermissionsBitField.Flags.CreatePrivateThreads // allow sending messages and creating threads
                                    ],
                                },
                            ],
                        });
                        
                        // log the creation
                        console.log(`Created "bug-reports" forum channel in ${guild.name}: ${bugReportsChannel.id}`);
                    } catch (error) {
                        // log error and break
                        console.error(`Failed to create "bug-reports" channel in ${guild.name}:`, error);
                        return;
                    }
                } else {
                    // found it so log it
                    console.log(`Found "bug-reports" forum channel in ${guild.name}: ${bugReportsChannel.id}`);
                }
                await i.reply({
                    content: `The channel ${bugReportsChannel} was found/created!`,
                    ephemeral: true,
                })
            } else {
                await i.reply("ERROR")
            }
        });

        collector.on('end', collected => {
            console.log(`Collected ${collected.size} items.`);
        });
    },
};

async function findChannelByName(guild, channelName, channelType) {
    return guild.channels.cache.find(channel =>
        channel.type === channelType && 
        channel.name.toLowerCase() === channelName.toLowerCase()
    ) || null;
}