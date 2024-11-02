const { 
    ActionRowBuilder, 
    StringSelectMenuBuilder, 
    StringSelectMenuOptionBuilder, 
    SlashCommandBuilder, 
    PermissionsBitField,
    ComponentType,
    ChannelType
} = require('discord.js');
const emojiCharacters = require('../../emoji.js');

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
            let responseMessage;
            const guild = interaction.guild;

            if (selection === 'streamer') {
                // Look for or create the "streamer-key" role
                let streamerKey = guild.roles.cache.find(role => role.name === "streamer-key");
                if (!streamerKey) {
                    streamerKey = await guild.roles.create({
                        name: "streamer-key",
                        reason: "Allows you to join the stream channel"
                    });
                    console.log(`Created "streamer-key" role in ${guild.name}: ${streamerKey.id}`);
                } else {
                    console.log(`Found "streamer-key" role in ${guild.name}: ${streamerKey.id}`);
                }

                // Create the Twitch VC channel if it doesn't exist
                const twitchVCName = emojiCharacters.camera + emojiCharacters.blush + "Twitch Vc";
                let twitchVCChannel = await findChannelByName(guild, twitchVCName, ChannelType.GuildVoice);
                if (!twitchVCChannel) {
                    try {
                        twitchVCChannel = await guild.channels.create({
                            name: twitchVCName,
                            type: ChannelType.GuildVoice,
                            reason: "Created by Tang0 bot.",
                            permissionOverwrites: [
                                {
                                    id: guild.id, // @everyone
                                    deny: [PermissionsBitField.Flags.Connect], // deny everyone from connecting
                                },
                                {
                                    id: streamerKey.id, // "streamer-key" role
                                    allow: [PermissionsBitField.Flags.Connect], // allow only streamer-key role to connect
                                },
                            ],
                        });
                        console.log(`Created ${twitchVCName} channel in ${guild.name}: ${twitchVCChannel.id}`);
                    } catch (error) {
                        console.error(`Failed to create ${twitchVCName} channel in ${guild.name}:`, error);
                        responseMessage = `An error occurred while creating the ${twitchVCName} channel.`;
                    }
                } else {
                    console.log(`Found ${twitchVCName} channel in ${guild.name}: ${twitchVCChannel.id}`);
                }

                responseMessage = responseMessage || `The "streamer-key" role and ${twitchVCName} channel are set up and ready to use!`;

            } else if (selection === 'bug') {
                // Look for or create the "thread-manager" role
                let threadManagerRole = guild.roles.cache.find(role => role.name === "thread-manager");
                const tango = await guild.members.fetch(interaction.client.user.id);
                if (!threadManagerRole) {
                    threadManagerRole = await guild.roles.create({
                        name: "thread-manager",
                        reason: "Created for managing threads."
                    });
                    console.log(`Created "thread-manager" role in ${guild.name}: ${threadManagerRole.id}`);
                } else {
                    console.log(`Found "thread-manager" role in ${guild.name}: ${threadManagerRole.id}`);
                }

                // Assign the "thread-manager" role to the bot if it doesn't already have it
                if (!tango.roles.cache.has(threadManagerRole.id)) {
                    await tango.roles.add(threadManagerRole);
                    console.log(`Assigned "thread-manager" role to the bot in ${guild.name}`);
                }

                // Create the Bug Reports channel if it doesn't exist
                const bugReportsName = "bug-reports" + emojiCharacters.bug;
                let bugReportsChannel = await findChannelByName(guild, bugReportsName, ChannelType.GuildForum);
                if (!bugReportsChannel) {
                    try {
                        bugReportsChannel = await guild.channels.create({
                            name: bugReportsName,
                            type: ChannelType.GuildForum,
                            reason: "Created by Tang0 bot.",
                            permissionOverwrites: [
                                {
                                    id: guild.id, // @everyone
                                    allow: [PermissionsBitField.Flags.SendMessages], // allow messages
                                    deny: [
                                        PermissionsBitField.Flags.CreatePublicThreads,
                                        PermissionsBitField.Flags.CreatePrivateThreads // deny thread creation
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
                        console.log(`Created "${bugReportsName}" forum channel in ${guild.name}: ${bugReportsChannel.id}`);
                    } catch (error) {
                        console.error(`Failed to create "${bugReportsName}" channel in ${guild.name}:`, error);
                        responseMessage = `An error occurred while creating the ${bugReportsName} channel.`;
                    }
                } else {
                    console.log(`Found "${bugReportsName}" forum channel in ${guild.name}: ${bugReportsChannel.id}`);
                }

                responseMessage = responseMessage || `The "thread-manager" role and ${bugReportsName} channel are set up and ready to use!`;

            } else {
                responseMessage = "ERROR: Invalid selection.";
            }

            // Send a single reply based on the setup outcome
            await i.reply({
                content: responseMessage,
                ephemeral: true,
            });
        });

        collector.on('end', collected => {
            console.log(`Collected ${collected.size} items.`);
        });
    },
};

// Helper function to find a channel by name and type
async function findChannelByName(guild, channelName, channelType) {
    return guild.channels.cache.find(channel =>
        channel.type === channelType && 
        channel.name.toLowerCase() === channelName.toLowerCase()
    ) || null;
}
