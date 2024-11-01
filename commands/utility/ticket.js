const { SlashCommandBuilder, TextInputBuilder, ModalBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');
const fs = require('fs');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ticket')
		.setDescription('Creates a ticket'),
	async execute(interaction) {

		// Create the modal for the ticket
		const modal = new ModalBuilder()
			.setCustomId('ticketCreate')
			.setTitle('Create Ticket');

		const getTicketName = new TextInputBuilder()
			.setCustomId('getTicketName')
			.setLabel('Enter the title of the ticket')
			.setStyle(TextInputStyle.Short)
			.setMaxLength(50)
			.setRequired(true);

		const getTicketDesc = new TextInputBuilder()
			.setCustomId('getTicketDesc')
			.setLabel('Describe your problem.')
			.setStyle(TextInputStyle.Paragraph)
			.setMaxLength(4000)
			.setRequired(true);

		// Add inputs to the modal
		const firstActionRow = new ActionRowBuilder().addComponents(getTicketName);
		const secondActionRow = new ActionRowBuilder().addComponents(getTicketDesc);

		modal.addComponents(firstActionRow, secondActionRow);

		// Show the modal
		await interaction.showModal(modal);
	},
};
