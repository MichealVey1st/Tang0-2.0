const { SlashCommandBuilder, PermissionFlagsBits, PermissionsBitField } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('streamervc')
		.setDescription('Select a member and add the streamer-key role')
		.addUserOption(option =>
			option
				.setName('target')
				.setDescription('The member to add role')
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

        if (!streamerkeyRole){
            await interaction.reply({
                content: `You must first do setup using /admin!`,
                ephemeral: true,
            })
        }

        await interaction.reply({
            content: `Adding role to ${target.username}!`,
            ephemeral: true,
        });
        await theTarget.roles.add(streamerkeyRole);
    },
};
