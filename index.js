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

		// find the general channel
        let generalChannel = await findChannelByName(guild, "general", ChannelType.GuildText);
        
		// if it couldnt find it
        if (!generalChannel) {
			// create new general
            generalChannel = await guild.channels.create({
                name: "general",
                type: ChannelType.GuildText,
                reason: "Created by Tang0 bot."
            });
			// output in console
            console.log(`Created "general" text channel in ${guild.name}: ${generalChannel.id}`);
        } else {
			// found it log it too
            console.log(`Found "general" text channel in ${guild.name}: ${generalChannel.id}`);
        }

		// look for the role
		let threadManagerRole = guild.roles.cache.find(role => role.name === "thread-manager");
		// get tango's id
        const tango = await guild.members.fetch(client.user.id);
        
		// if role doesnt exist
        if (!threadManagerRole) {
            // create it
            threadManagerRole = await guild.roles.create({
                name: "thread-manager",
                reason: "Created for managing threads."
            });
			// log that it was created
            console.log(`Created "thread-manager" role in ${guild.name}: ${threadManagerRole.id}`);
        } else {
			// log that it was found
            console.log(`Found "thread-manager" role in ${guild.name}: ${threadManagerRole.id}`);
        }
		// look for the role
		let adminRole = guild.roles.cache.find(role => role.name === "admin");

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

		// check if the bot has the "thread-manager" role if not add it
        if (!tango.roles.cache.has(threadManagerRole.id)) {
			// add the role
            await tango.roles.add(threadManagerRole);
			// output to console
            console.log(`Assigned "thread-manager" role to the bot in ${guild.name}`);
        }


		// find bug-reports forum channel
        let bugReportsChannel = await findChannelByName(guild, "bug-reports", ChannelType.GuildForum);

		// if wasnt found
		if (!bugReportsChannel) {
			// try to create channel
			try {
				// create channel
                bugReportsChannel = await guild.channels.create({
					name: "bug-reports",
					type: ChannelType.GuildForum,
					reason: "Created by Tang0 bot.",
					permissionOverwrites: [
						{
							id: guild.id, // @everyone
							allow: [PermissionsBitField.Flags.SendMessages], // make sure people can send messages
							deny: [
								PermissionsBitField.Flags.CreatePublicThreads,
								PermissionsBitField.Flags.CreatePrivateThreads // get rid of thread creation perms
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
				
				// log the creation
                console.log(`Created "bug-reports" forum channel in ${guild.name}: ${bugReportsChannel.id}`);
            } catch (error) {
				// log error and break
				console.error(`Failed to create "bug-reports" channel in ${guild.name}:`, error);
				return;
			}
		} else {
			// found it so log it
			console.log(`Found "bug-reports" forum channel in ${guild.name}: ${bugReportsChannel.id}`);
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

async function findChannelByName(guild, channelName, channelType) {
    return guild.channels.cache.find(channel =>
        channel.type === channelType && 
        channel.name.toLowerCase() === channelName.toLowerCase()
    ) || null;
}

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
