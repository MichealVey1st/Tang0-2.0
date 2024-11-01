const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('help')
		.setDescription('Gives a list of commands that can be used.'),
	async execute(interaction) {
        // TODO create this later
		await interaction.reply('TODO');
	},
};