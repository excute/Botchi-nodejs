require("dotenv").config();

const http = require("node:http");
const { Client, GatewayIntentBits } = require("discord.js");
const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMembers,
		GatewayIntentBits.GuildPresences,
	],
});

const theColors = {
	green: 0x4caf50,
	info: 0x2196f3,
	warning: 0xffc107,
	error: 0xf44336,
	debug: 0x9c27b0,
};

const statusServer = http.createServer((req, res) => {
	console.log(`[statusServer] [${new Date().toISOString()}] : ${req.url}`);
	// sendLog("Got statusServer request", theColors.debug, {
	// 	fields: [{ name: "req.url", value: req.url }],
	// });
	getTheUsersStatuses().then((statuses) => {
		res.writeHead(200, {
			"Content-Type": "application/json",
			"Access-Control-Allow-Origin": "*",
		});
		res.end(JSON.stringify(statuses), "utf-8");
	});
});

let thePreFetchedObjs = {
	/** @type {Discord.Guild} guild */
	guild: undefined,
	/** @type {Discord.TextChannel} logChannel */
	logChannel: undefined,
};

let TheLogChannel;
let TheGuild;

async function preFetchThe() {
	return client.guilds
		.fetch(process.env.THE_GUILD_ID)
		.then((theGuild) => {
			thePreFetchedObjs.guild = theGuild;
			return theGuild.channels.fetch(process.env.THE_LOG_CHANNEL_ID);
		})
		.then((theChan) => {
			return (thePreFetchedObjs.logChannel = theChan);
		});
}

async function getTheUsersStatuses() {
	// return client.guilds.fetch(process.env.THE_GUILD_ID).then((guild) => {
	// 	return guild.members.fetch({
	// 		user: theUsers.map((anUser) => anUser.id),
	// 		withPresences: true,
	// 	});
	// }).then((member)=>{
	// 	member
	// })
	// return thePreFetchedObjs.guild.members
	// 	.fetch({
	// 		user: theUsers.map((anUser) => anUser.id),
	// 		withPresences: true,
	// 	})
	// 	.then((foundUsers) => {
	// 		return foundUsers.map((anUser) => {
	// 			return {
	// 				id: anUser.id,
	// 				status: anUser.presence?.status,
	// 			};
	// 		});
	// 	});
}

async function initBot() {
	return preFetchThe().then(() => {
		return getTheUsersStatuses();
	});
}

/**
 *
 * @param {String} logTitle
 * @param {Number} logColor
 * @param {Discord.MessageEmbed} logEmbed
 * @returns {Promise<Discord.Message>}
 */
async function sendLog(
	logTitle,
	logColor = theColors.info,
	logEmbed = undefined
) {
	let logOptions = {
		embeds: [{ title: logTitle, color: logColor, timestamp: new Date() }],
	};
	for (const aProperty in logEmbed) {
		// console.log(`logEmbed[aProperty]=${logEmbed[aProperty]}`);
		logOptions.embeds[0][aProperty] = logEmbed[aProperty];
	}
	// return thePreFetchedObjs.logChannel.send(logOptions);
	// return TheLogChannel.send(logOptions);
	return client.channels
		.fetch(process.env.THE_LOG_CHANNEL_ID)
		.then((channel) => {
			channel.send(logOptions);
		});
}

function stopBot(stopSignal) {
	console.log(`Got stop signal - ${stopSignal}`);
	sendLog("Got stop signal", theColors.warning, {
		fields: [{ name: "Signal", value: stopSignal }],
	}).then(() => {
		statusServer.close();
		client.destroy();
	});
}

client.on("ready", () => {
	console.log(`Console - Bot is now ready`);
	// client.guilds.fetch(process.env.THE_GUILD_ID).then((guild) => {
	// 	TheGuild = guild;
	// });
	// client.channels.fetch(process.env.THE_LOG_CHANNEL_ID).then((channel) => {
	// 	TheLogChannel = channel;
	// });

	// initBot().then(() => {
	sendLog("Bot is now ready", theColors.green, {
		fields: [{ name: "Bot", value: "Ready" }],
	});
	// });
});

process.on("SIGINT", stopBot);
process.on("SIGTERM", stopBot);

statusServer.listen(process.env.PORT, () => {
	console.log(`Server listening: ${process.env.PORT}`);
});

client.login(process.env.BOT_TOKEN);
