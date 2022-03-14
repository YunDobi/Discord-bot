const Discord = require('discord.js');
const dotenv = require('dotenv');
const fetch = require('node-fetch');
dotenv.config();
const client = new Discord.Client();

const getQuote = function(link) {
  return fetch(link)
    .then(res => {
      console.log(res);
      return res.json();
    })
    // .then(data => {
    //   console.log(data);
    //   return data[0]["q"] + " -" + data[0]["a"]
    // })
}

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on("message", msg => {
  if (msg.author.bot) return

  if (msg.content.includes('https')) {
    console.log(msg.content)
    getQuote(msg.content).then(quote => msg.channel.send(quote));
  }
});

client.login(process.env.Token);