const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Replies with Pong!'),
	async execute(interaction) {
		let client = interaction.client;
		let sent = await interaction.reply({
			content: `Pong!\nWebsocket heartbeat: ${client.ws.ping}ms.`,
			fetchReply: true,
		});
		interaction.editReply(`Pong!\nWebsocket heartbeat: ${client.ws.ping}ms.\nRoundtrip latency: ${sent.createdTimestamp - interaction.createdTimestamp}ms`);

	},
};