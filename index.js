const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, Events, GatewayIntentBits, PresenceUpdateStatus, ActivityType, ChannelType, PermissionsBitField } = require('discord.js');
const { token } = require('./config.json'); // get token

const client = new Client({ intents: [GatewayIntentBits.Guilds] }); // set intents

client.commands = new Collection(); // commands collection

// trigger on startup items
client.once(Events.ClientReady, async readyClient => {
    console.log(`Logged in as ${client.user.tag}!`); // say im ready
    client.user.setPresence({ activities: [{ name: '@g3tsquatch3d', type: ActivityType.Listening }], status: PresenceUpdateStatus.Online }); // set my status
    
	// for each server
    client.guilds.cache.forEach(async (guild) => {
		
		// look for the role
		let adminRole = guild.roles.cache.find(role => role.name === "admin");

		const tango = await guild.members.fetch(client.user.id);

		if (!adminRole) {
			adminRole = await guild.roles.create({
				name: "admin",
				reason: "admin: admin",
				permissions: [PermissionsBitField.Flags.Administrator]
			});
			console.log(`Created "admin" role in ${guild.name}: ${adminRole.id}`);
		} else {
			console.log(`Found "admin" role in ${guild.name}: ${adminRole.id}`);
		}

		// check if Tang0 is an admin
		if (!tango.roles.cache.has(adminRole.id)) {
			await tango.roles.add(adminRole);
			console.log(`Assigned "admin" role to Tang0 in ${guild.name}`);
		}

	});
});

// when ticket modal is submitted
client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isModalSubmit()) return;

	// set ticket parts to vars
    const ticketName = interaction.fields.getTextInputValue('getTicketName');
    const ticketDesc = interaction.fields.getTextInputValue('getTicketDesc');

	// get the channel
    const bugReportsChannel = await findChannelByName(interaction.guild, "bug-reports", ChannelType.GuildForum);

    try {
		// if there is no bug reports channel error out and log
        if (!bugReportsChannel) {
            return interaction.reply({
                content: 'Bug reports channel not found. Please make sure it was created correctly.',
                ephemeral: true,
            });
        }

		// check the channel to be init correctly
        const channel = client.channels.cache.get(bugReportsChannel.id);
        if (!channel) {
            return interaction.reply({
                content: 'Channel not found. Please make sure it was initialized correctly.',
                ephemeral: true,
            });
        }

		// create a new thread
        const thread = await channel.threads.create({
			// name is set to user input
            name: ticketName,
            message: { 
				// @ the user and give the user input description
                content: `Ticket created by <@${interaction.user.id}>: ${ticketDesc}`
            },
            appliedTags: [],
        });

		// say ticket was created
        await interaction.reply({
            content: `Ticket created successfully in thread: <#${thread.id}>`,
            ephemeral: true,
        });

		// if it errors out
    } catch (error) {
		// log error
        console.error(error);
		// let user know
        await interaction.reply({
            content: 'There was an error creating the ticket.',
            ephemeral: true,
        });
    }
});

// on command called
client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isChatInputCommand()) return;

	// get the command name
	const command = interaction.client.commands.get(interaction.commandName);

	// if the command doesnt actually exist
	if (!command) {
		// log it and error
		console.error(`No command matching ${interaction.commandName} was found.`);
		return;
	}

	// try executing the cmd
	try {
		// executing it
		await command.execute(interaction);
	
	// on error
	} catch (error) {
		// log it
		console.error(error);
		// then let the user know
		if (interaction.replied || interaction.deferred) {
			await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
		} else {
			await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
		}
	}

	client.on(Events.InteractionCreate, interaction => {
	if (!interaction.isModalSubmit()) return;
	console.log(interaction);
	});
});

const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);
		if ('data' in command && 'execute' in command) {
			client.commands.set(command.data.name, command);
		} else {
			console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
		}
	}
}

client.login(token);
