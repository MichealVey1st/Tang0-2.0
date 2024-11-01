const { SlashCommandBuilder, PermissionFlagsBits, PermissionsBitField } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('streamervcrm')
		.setDescription('Select a member and remove the streamer-key role')
		.addUserOption(option =>
			option
				.setName('target')
				.setDescription('Remove the role from the user')
				.setRequired(true)),

    async execute(interaction) {
		if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
			return interaction.reply({
				content: 'You do not have permission to use this command.',
				ephemeral: true,
			});
		}
		
        const target = interaction.options.getUser('target');
        const theTarget = await interaction.guild.members.fetch(target.id);


        // look for the role
		let streamerkeyRole = interaction.guild.roles.cache.find(role => role.name === "streamer-key");

        await interaction.reply({
            content: `Removing role from ${target.username}!`,
            ephemeral: true,
        });
        await theTarget.roles.remove(streamerkeyRole);
    },
};
