const Discord = require('discord.js');
const fetch = require('node-fetch');
const dotenv = require('dotenv');
const ytdl = require("ytdl-core");
dotenv.config();
const client = new Discord.Client();

const excute = async function(message, serverQueue) {
  // console.log("serverQueue", serverQueue);
  const args = message.content.split(" ");

  const voiceChannel = message.member.voice.channel;
  // console.log(message.member.voice.channel);
  if (!voiceChannel) {
    return message.channel.send(
      "You need to be in the voice chat for playing music!"
    );
  }
  const permissions = voiceChannel.permissionsFor(message, client.user);
  // console.log("permission", permissions);
  if (!permissions.has("CONNECT") || !permissions.has("SPEAK")) {
    return message.channel.send(
      "I need the permissions to join and speak in your voice channel!"
    );
  }

  const songInfo = await ytdl.getInfo(args[1])
  const songs = {
    title: songInfo.videoDetails.title,
    url: songInfo.videoDetails.video_url
  };
  console.log(songs);

  // if (!serverQueue) {

  // } else {
  //   serverQueue.songs.push(songs);
  //   console.log("serverQ.song", serverQueue.songs);
  //   return message.channel.send(`${songs.title} has added to the queue!`);

  // }
};


client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on("message", msg => {
  //this is if the message is from the bot, then ignore.
  if (msg.author.bot) return;

  //if not starting with !, return
  if (!msg.content.startsWith(process.env.prefix)) return;

  const queue = new Map();

  //A guild represents an isolated collection of users and channels and is often referred to as a server
  const serverQueue = queue.get(msg.guild.id);

  if (msg.content.startsWith(`${process.env.prefix}play`)) {
    excute(msg,serverQueue);
  }
  else if (msg.content.startsWith(`${process.env.prefix}skip`)) {
    // skip (msg, serverQueue);
    msg.channel.send("pressed skip");
    return;
  }
  else if (msg.content.startsWith(`${process.env.prefix}stop`)) {
    // stop (msg, serverQueue);
    msg.channel.send("pressed stop");
    return;
  } else {
    msg.channel.send('You need to enter a valid command!');
  }

});

client.login(process.env.Token);