// TODO create a menu like admin.js or something to choose from mod options warn ban timeout etc.

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
        .setName("punish")
        .setDescription('Moderation tools for those pesky pesky rule breakers...')
        .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator),

    async execute(interaction) {
        const select = new StringSelectMenuBuilder()
            .setCustomId('Setup')
            .setPlaceholder('What would you like to set up?')
            .addOptions(
                new StringSelectMenuOptionBuilder()
                    .setLabel('Ban')
                    .setDescription('Sets up all the streamer channels, roles, and perms')
                    .setValue('streamer'),
                new StringSelectMenuOptionBuilder()
                    .setLabel('Warn')
                    .setDescription('Sets up all the bug reporting channels, roles, and perms')
                    .setValue('warn'),
                new StringSelectMenuOptionBuilder()
                    .setLabel('Timeout')
                    .setDescription('Times a specific person out.')
                    .setValue('tmout'),
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
