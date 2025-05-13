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
        .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator)
        .addUserOption( option =>
            option.setName('user')
                .setDescription('The user deemed to be punished! Show no mercy!')
                .setRequired(true)
        .addStringOption(option =>
            option.setName('punishment')
                .setDescription('The punishment type')
                .setRequired(true)
                .addChoices(
                    { name: 'Ban', value: 'ban' },
                    { name: 'Warn', value: 'warn' },
                    { name: 'Timeout', value: 'timeout' },
                ))
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('The reason for the punishment'))
        ),

    async execute(interaction) {

        const target = interaction.options.getUser('target');
        const punishment = interaction.option.getString('punishment');
        const reason = interaction.options.getString('reason') ?? 'No reason provided';
        
        if (punishment === 'ban'){
            await interaction.reply({content: `Banning ${target.username} for reason: ${reason}`, ephemeral: true});
            try {
                await interaction.guild.members.ban(target);
                await interaction.followUp({content: `${target.username} was banned`, ephemeral: true });
            } catch (error) {
                await interaction.followUp({content: `Unable to ban ${target.username} because: ${error}`, ephemeral: true});
            }
        } else if (punishment === 'warn') {
            await interaction.reply({content: `Warning ${target.username} for the reason: ${reason}`, ephemeral: true});
            try{
                // await interaction.guild.members.
                // warn the player?
            } catch (error) {
                await interaction.followUp({content: `Unable to warn ${target.username} because: ${error}`, ephemeral: true});
            }
        } else if (punishment === 'timeout') {
            // add time
            await interaction.reply({content: `Timing out ${target.username} for the reason: ${reason}`, ephemeral: true});
            // add try function
        } else {
            await interaction.reply({content: "ERROR: Something went wrong somewhere", ephemeral: true});
        }
    },
};
