const Discord = require('discord.js');
const fetch = require('node-fetch');
const dotenv = require('dotenv');
const ytdl = require("ytdl-core");
dotenv.config();
const client = new Discord.Client();

const queue = new Map();

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
  const song = {
    title: songInfo.videoDetails.title,
    url: songInfo.videoDetails.video_url
  };
  console.log(song);

  if (!serverQueue) {
    //creating the contract for our queue
    const queueContruct = {
      textChannel: message.channel,
      voiceChannel: voiceChannel,
      connection: null,
      songs: [],
      volume: 5,
      playing: true,
    };
    //setting the queue using our contract
    queue.set(message.guild.id, queueContruct);
    // Pushing the song to our songs array
    queueContruct.songs.push(song);

    try {
    // Here we try to join the voicechat and save our connection into our object.
      const connection = await voiceChannel.join();
      queueContruct.connection = connection;
      // Calling the play function to start a song
      play(message.guild, queueContruct.songs[0]);
    } catch (err) {
    // Printing the error message if the bot fails to join the voicechat
      console.log(err);
      queue.delete(message.guild.id);
      return message.channel.send(err);
    }
  } else {
    serverQueue.songs.push(song);
    console.log("serverQ.song", serverQueue.songs);
    return message.channel.send(`${song.title} has added to the queue!`);

  }
};

const play = function (guild, song) {
  const serverQueue = queue.get(guild.id);
  if (!song) {
    serverQueue.voiceChannel.leave();
    queue.delete(guild.id);
    return;
  }
  //dispatcher
  const dispatcher = serverQueue.connection
    .play(ytdl(song.url))
    .on("finish", () => {
      serverQueue.songs.shift();
      play(guild, serverQueue.songs[0]);
    })
    .on("error", error => console.error(error));
  dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);
  serverQueue.textChannel.send(`Start playing: **${song.title}**`);
};


const skip = function(message, serverQueue) {
  if (!message.member.voice.channel)
    return message.channel.send(
      "You have to be in a voice channel to stop the music!"
    );
  if (!serverQueue)
    return message.channel.send("There is no song that I could skip!");
  serverQueue.connection.dispatcher.end();
};

const stop = function(message, serverQueue) {
  if (!message.member.voice.channel)
    return message.channel.send(
      "You have to be in a voice channel to stop the music!"
    );
  serverQueue.songs = [];
  serverQueue.connection.dispatcher.end();
};


client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on("message", msg => {
  //this is if the message is from the bot, then ignore.
  if (msg.author.bot) return;

  //if not starting with !, return
  if (!msg.content.startsWith(process.env.prefix)) return;

  //A guild represents an isolated collection of users and channels and is often referred to as a server
  const serverQueue = queue.get(msg.guild.id);

  if (msg.content.startsWith(`${process.env.prefix}play`)) {
    excute(msg,serverQueue);
  } else if (msg.content.startsWith(`${process.env.prefix}skip`)) {
    skip(msg, serverQueue);
    return;
  } else if (msg.content.startsWith(`${process.env.prefix}stop`)) {
    stop(msg, serverQueue);
    return;
  } else {
    msg.channel.send('You need to enter a valid command!');
  }

});

client.login(process.env.Token);