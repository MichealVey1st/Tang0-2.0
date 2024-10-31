const { SlashCommandBuilder, TextInputBuilder, ModalBuilder, EmbedBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ticket')
		.setDescription('Creates a ticket'),
	async execute(interaction) {

		// Show the modal to the user
		await interaction.showModal(modal);
        
        // TODO later.
        //await interaction.reply({ embeds: [ticketEmbed] });
	},
};


// define modal builder
const modal = new ModalBuilder()
    .setCustomId('ticketCreate')
    .setTitle('Create Ticket');


const getTicketName = new TextInputBuilder()
    .setCustomId('getTicketName')
    .setLabel("Enter the title of the ticket")
    .setStyle(TextInputStyle.Short)
    .setMaxLength(50)
    .setRequired(true);

const getTicketDesc = new TextInputBuilder()
    .setCustomId('getTicketDesc')
    .setLabel("Describe your problem.")
    .setStyle(TextInputStyle.Paragraph)
    .setMaxLength(4_000)
    .setRequired(true);

// An action row only holds one text input,
// so you need one action row per text input.
const firstActionRow = new ActionRowBuilder().addComponents(getTicketName);
const secondActionRow = new ActionRowBuilder().addComponents(getTicketDesc);

// Add inputs to the modal
modal.addComponents(firstActionRow, secondActionRow);

// todo later
const ticketEmbed = new EmbedBuilder()
	.setColor(0x0099FF)
	.setTitle('Create a ticket')
	.setAuthor({ name: 'Tang0', iconURL: 'https://cdn.discordapp.com/avatars/958083282317234267/e06e1498b9b8f8d21de2c85a8404d59f.webp?size=100', url: 'https://discord.js.org' })
	.setDescription('Please press the button below to create a ticket')
	.addFields(
		{ name: 'Regular field title', value: 'Some value here' },
		{ name: '\u200B', value: '\u200B' },
		{ name: 'Inline field title', value: 'Some value here', inline: true },
		{ name: 'Inline field title', value: 'Some value here', inline: true },
	)
	.addFields({ name: 'Inline field title', value: 'Some value here', inline: true })
	.setImage('https://www.startpage.com/av/proxy-image?piurl=https%3A%2F%2Ftse4.mm.bing.net%2Fth%3Fid%3DOIP.3lbT6pXTAVQlvp3o0Aj1CwHaF3%26pid%3DApi&sp=1730391826T1979c6cf79ce16c1ccefb4739b990da9e4d55b1e9000d2af9ae58f132c1e65d4')
	.setTimestamp()
	.setFooter({ text: 'Some footer text here'});

// channel.send({ embeds: [exampleEmbed] });