const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const config = require('../../data/discord/config.json');
const fs = require('node:fs');
const colors = require('../../data/handles/colors.js');
const path = require('path');
const { createClient } = require('bedrock-protocol');
const { dumprealm,checkaccount,getrealminfo } = require('../../men/realms');
const { NIL, v3: uuidv3, v4: uuidv4 } = require('uuid');
const { Authflow, Titles } = require("prismarine-auth");
const skinData = require('../../data/skins/jenny.json')
const { reply1, reply2}=require('../../data/discord/emojies.js')
const sillymsg = "§k§oA§aB§bC§cD§dE§5F§7G§3H§3I§2J§0K§eL§pM§bN§5O§9P§3Q§5R§eS§2T§4U§6V§8W§dX§aY§dZ§8a§4b§3c§ad§be§df§2g§3h§8i§5j§7k§3l§2m§1n§0o§6p§4q§8r§3s§2t§1u§2v§3w§6x§8y§2z§k§oA§aB§bC§cD§dE§5F§7G§3H§3I§2J§0K§eL§pM§bN§5O§9P§3Q§5R§eS§2T§4U§6V§8W§dX§aY§dZ§8a§4b§3c§ad§be§df§2g§3h§8i§5j§7k§3l§2m§1n§0o§6p§4q§8r§3s§2t§1u§2v§3w§6x§8y§2z§k§oA§aB§bC§cD§dE§5F§7G§3H§3I§2J§0K§eL§pM§bN§5O§9P§3Q§5R§eS§2T§4U§6V§8W§dX§aY§dZ§8a§4b§3c§ad§be§df§2g§3h§8i§5j§7k§3l§2m§1n§0o§6p§4q§8r§3s§2t§1u§2v§3w§6x§8y§2z§k§oA§aB§bC§cD§dE§5F§7G§3H§3I§2J§0K§eL§pM§bN§5O§9P§3Q§5R§eS§2T§4U§6V§8W§dX§aY§dZ§8a§4b§3c§ad§be§df§2g§3h§8i§5j§7k§3l§2m§1n§0o§6p§4q§8r§3s§2t§1u§2v§3w§6x§8y§2z§k§oA§aB§bC§cD§dE§5F§7G§3H§3I§2J§0K§eL§pM§bN§5O§9P§3Q§5R§eS§2T§4U§6V§8W§dX§aY§dZ§8a§4b§3c§ad§be§df§2g§3h§8i§5j§7k§3l§2m§1n§0o§6p§4q§8r§3s§2t§1u§2v§3w§6x§8y§2z§k§oA§aB§bC§cD§dE§5F§7G§3H§3I§2J§0K§eL§pM§bN§5O§9P§3Q§5R§eS§2T§4U§6V§8W§dX§aY§dZ§8a§4b§3c§ad§be§df§2g§3h§8i§5j§7k§3l§2m§1n§0o§6p§4q§8r§3s§2t§1u§2v§3w§6x§8y§2z§k§oA§aB§bC§cD§dE§5F§7G§3H§3I§2J§0K§eL§pM§bN§5O§9P§3Q§5R§eS§2T§4U§6V§8W§dX§aY§dZ§8a§4b§3c§ad§be§df§2g§3h§8i§5j§7k§3l§2m§1n§0o§6p§4q§8r§3s§2t§1u§2v§3w§6x§8y§2z§k§oA§aB§bC§cD§dE§5F§7G§3H§3I§2J§0K§eL§pM§bN§5O§9P§3Q§5R§eS§2T§4U§6V§8W§dX§aY§dZ§8a§4b§3c§ad§be§df§2g§3h§8i§5j§7k§3l§2m§1n§0o§6p§4q§8r§3s§2t§1u§2v§3w§6x§8y§2z§k§oA§aB§bC§cD§dE§5F§7G§3H§3I§2J§0K§eL§pM§bN§5O§9P§3Q§5R§eS§2T§4U§6V§8W§dX§aY§dZ§8a§4b§3c§ad§be§df§2g§3h§8i§5j§7k§3l§2m§1n§0o§6p§4q§8r§3s§2t§1u§2v§3w§6x§8y§2z§k§oA§aB§bC§cD§dE§5F§7G§3H§3I§2J§0K§eL§pM§bN§5O§9P§3Q§5R§eS§2T§4U§6V§8W§dX§aY§dZ§8a§4b§3c§ad§be§df§2g§3h§8i§5j§7k§3l§2m§1n§0o§6p§4q§8r§3s§2t§1u§2v§3w§6x§8y§2z§k§oA§aB§bC§cD§dE§5F§7G§3H§3I§2J§0K§eL§pM§bN§5O§9P§3Q§5R§eS§2T§4U§6V§8W§dX§aY§dZ§8a§4b§3c§ad§be§df§2g§3h§8i§5j§7k§3l§2m§1n§0o§6p§4q§8r§3s§2t§1u§2v§3w§6x§8y§2z§k§oA§aB§bC§cD§dE§5F§7G§3H§3I§2J§0K§eL§pM§bN§5O§9P§3Q§5R§eS§2T§4U§6V§8W§dX§aY§dZ§8a§4b§3c§ad§be§df§2g§3h§8i§5j§7k§3l§2m§1n§0o§6p§4q§8r§3s§2t§1u§2v§3w§6x§8y§2z§k§oA§aB§bC§cD§dE§5F§7G§3H§3I§2J§0K§eL§pM§bN§5O§9P§3Q§5R§eS§2T§4U§6V§8W§dX§aY§dZ§8a§4b§3c§ad§be§df§2g§3h§8i§5j§7k§3l§2m§1n§0o§6p§4q§8r§3s§2t§1u§2v§3w§6x§8y§2z§k§oA§aB§bC§cD§dE§5F§7G§3H§3I§2J§0K§eL§pM§bN§5O§9P§3Q§5R§eS§2T§4U§6V§8W§dX§aY§dZ§8a§4b§3c§ad§be§df§2g§3h§8i§5j§7k§3l§2m§1n§0o§6p§4q§8r§3s§2t§1u§2v§3w§6x§8y§2z§k§oA§aB§bC§cD§dE§5F§7G§3H§3I§2J§0K§eL§pM§bN§5O§9P§3Q§5R§eS§2T§4U§6V§8W§dX§aY§dZ§8a§4b§3c§ad§be§df§2g§3h§8i§5j§7k§3l§2m§1n§0o§6p§4q§8r§3s§2t§1u§2v§3w§6x§8y§2z§k§oA§aB§bC§cD§dE§5F§7G§3H§3I§2J§0K§eL§pM§bN§5O§9P§3Q§5R§eS§2T§4U§6V§8W§dX§aY§dZ§8a§4b§3c§ad§be§df§2g§3h§8i§5j§7k§3l§2m§1n§0o§6p§4q§8r§3s§2t§1u§2v§3w§6x§8y§2z§k§oA§aB§bC§cD§dE§5F§7G§3H§3I§2J§0K§eL§pM§bN§5O§9P§3Q§5R§eS§2T§4U§6V§8W§dX§aY§dZ§8a§4b§3c§ad§be§df§2g§3h§8i§5j§7k§3l§2m§1n§0o§6p§4q§8r§3s§2t§1u§2v§3w§6x§8y§2z§k§oA§aB§bC§cD§dE§5F§7G§3H§3I§2J§0K§eL§pM§bN§5O§9P§3Q§5R§eS§2T§4U§6V§8W§dX§aY§dZ§8a§4b§3c§ad§be§df§2g§3h§8i§5j§7k§3l§2m§1n§0o§6p§4q§8r§3s§2t§1u§2v§3w§6x§8y§2z§k§oA§aB§bC§cD§dE§5F§7G§3H§3I§2J§0K§eL§pM§bN§5O§9P§3Q§5R§eS§2T§4U§6V§8W§dX§aY§dZ§8a§4b§3c§ad§be§df§2g§3h§8i§5j§7k§3l§2m§1n§0o§6p§4q§8r§3s§2t§1u§2v§3w§6x§8y§2z§k§oA§aB§bC§cD§dE§5F§7G§3H§3I§2J§0K§eL§pM§bN§5O§9P§3Q§5R§eS§2T§4U§6V§8W§dX§aY§dZ§8a§4b§3c§ad§be§df§2g§3h§8i§5j§7k§3l§2m§1n§0o§6p§4q§8r§3s§2t§1u§2v§3w§6x§8y§2z§k§oA§aB§bC§cD§dE§5F§7G§3H§3I§2J§0K§eL§pM§bN§5O§9P§3Q§5R§eS§2T§4U§6V§8W§dX§aY§dZ§8a§4b§3c§ad§be§df§2g§3h§8i§5j§7k§3l§2m§1n§0o§6p§4q§8r§3s§2t§1u§2v§3w§6x§8y§2z§k§oA§aB§bC§cD§dE§5F§7G§3H§3I§2J§0K§eL§pM§bN§5O§9P§3Q§5R§eS§2T§4U§6V§8W§dX§aY§dZ§8a§4b§3c§ad§be§df§2g§3h§8i§5j§7k§3l§2m§1n§0o§6p§4q§8r§3s§2t§1u§2v§3w§6x§8y§2z§k§oA§aB§bC§cD§dE§5F§7G§3H§3I§2J§0K§eL§pM§bN§5O§9P§3Q§5R§eS§2T§4U§6V§8W§dX§aY§dZ§8a§4b§3c§ad§be§df§2g§3h§8i§5j§7k§3l§2m§1n§0o§6p§4q§8r§3s§2t§1u§2v§3w§6x§8y§2z§k§oA§aB§k§oA§aB§bC§cD§dE§5F§7G§3H§3I§2J§0K§eL§pM§bN§5O§9P§3Q§5R§eS§2T§4U§6V§8W§dX§aY§dZ§8a§4b§3c§ad§be§df§2g§3h§8i§5j§7k§3l§2m§1n§0o§6p§4q§8r§3s§2t§1u§2v§3w§6x§8y§2z§k§oA§aB§bC§cD§dE§5F§7G§3H§3I§2J§0K§eL§pM§bN§5O§9P§3Q§5R§eS§2T§4U§6V§8W§dX§aY§dZ§8a§4b§3c§ad§be§df§2g§3h§8i§5j§7k§3l§2m§1n§0o§6p§4q§8r§3s§2t§1u§2v§3w§6x§8y§2z§k§oA§aB§bC§cD§dE§5F§7G§3H§3I§2J§0K§eL§pM§bN§5O§9P§3Q§5R§eS§2T§4U§6V§8W§dX§aY§dZ§8a§4b§3c§ad§be§df§2g§3h§8i§5j§7k§3l§2m§1n§0o§6p§4q§8r§3s§2t§1u§2v§3w§6x§8y§2z§k§oA§aB§bC§cD§dE§5F§7G§3H§3I§2J§0K§eL§pM§bN§5O§9P§3Q§5R§eS§2T§4U§6V§8W§dX§aY§dZ§8a§4b§3c§ad§be§df§2g§3h§8i§5j§7k§3l§2m§1n§0o§6p§4q§8r§3s§2t§1u§2v§3w§6x§8y§2z§k§oA§aB§bC§cD§dE§5F§7G§3H§3I§2J§0K§eL§pM§bN§5O§9P§3Q§5R§eS§2T§4U§6V§8W§dX§aY§dZ§8a§4b§3c§ad§be§df§2g§3h§8i§5j§7k§3l§2m§1n§0o§6p§4q§8r§3s§2t§1u§2v§3w§6x§8y§2z§k§oA§aB§bC§cD§dE§5F§7G§3H§3I§2J§0K§eL§pM§bN§5O§9P§3Q§5R§eS§2T§4U§6V§8W§dX§aY§dZ§8a§4b§3c§ad§be§df§2g§3h§8i§5j§7k§3l§2m§1n§0o§6p§4q§8r§3s§2t§1u§2v§3w§6x§8y§2z§k§oA§aB§bC§cD§dE§5F§7G§3H§3I§2J§0K§eL§pM§bN§5O§9P§3Q§5R§eS§2T§4U§6V§8W§dX§aY§dZ§8a§4b§3c§ad§be§df§2g§3h§8i§5j§7k§3l§2m§1n§0o§6p§4q§8r§3s§2t§1u§2v§3w§6x§8y§2z§k§oA§aB§bC§cD§dE§5F§7G§3H§3I§2J§0K§eL§pM§bN§5O§9P§3Q§5R§eS§2T§4U§6V§8W§dX§aY§dZ§8a§4b§3c§ad§be§df§2g§3h§8i§5j§7k§3l§2m§1n§0o§6p§4q§8r§3s§2t§1u§2v§3w§6x§8y§2z§k§oA§aB§bC§cD§dE§5F§7G§3H§3I§2J§0K§eL§pM§bN§5O§9P§3Q§5R§eS§2T§4U§6V§8W§dX§aY§dZ§8a§4b§3c§ad§be§df§2g§3h§8i§5j§7k§3l§2m§1n§0o§6p§4q§8r§3s§2t§1u§2v§3w§6x§8y§2z§k§oA§aB§bC§cD§dE§5F§7G§3H§3I§2J§0K§eL§pM§bN§5O§9P§3Q§5R§eS§2T§4U§6V§8W§dX§aY§dZ§8a§4b§3c§ad§be§df§2g§3h§8i§5j§7k§3l§2m§1n§0o§6p§4q§8r§3s§2t§1u§2v§3w§6x§8y§2z§k§oA§aB§bC§cD§dE§5F§7G§3H§3I§2J§0K§eL§pM§bN§5O§9P§3Q§5R§eS§2T§4U§6V§8W§dX§aY§dZ§8a§4b§3c§ad§be§df§2g§3h§8i§5j§7k§3l§2m§1n§0o§6p§4q§8r§3s§2t§1u§2v§3w§6x§8y§2z§k§oA§aB§bC§cD§dE§5F§7G§3H§3I§2J§0K§eL§pM§bN§5O§9P§3Q§5R§eS§2T§4U§6V§8W§dX§aY§dZ§8a§4b§3c§ad§be§df§2g§3h§8i§5j§7k§3l§2m§1n§0o§6p§4q§8r§3s§2t§1u§2v§3w§6x§8y§2z§k§oA§aB§bC§cD§dE§5F§7G§3H§3I§2J§0K§eL§pM§bN§5O§9P§3Q§5R§eS§2T§4U§6V§8W§dX§aY§dZ§8a§4b§3c§ad§be§df§2g§3h§8i§5j§7k§3l§2m§1n§0o§6p§4q§8r§3s§2t§1u§2v§3w§6x§8y§2z§k§oA§aB§bC§cD§dE§5F§7G§3H§3I§2J§0K§eL§pM§bN§5O§9P§3Q§5R§eS§2T§4U§6V§8W§dX§aY§dZ§8a§4b§3c§ad§be§df§2g§3h§8i§5j§7k§3l§2m§1n§0o§6p§4q§8r§3s§2t§1u§2v§3w§6x§8y§2z§k§oA§aB§bC§cD§dE§5F§7G§3H§3I§2J§0K§eL§pM§bN§5O§9P§3Q§5R§eS§2T§4U§6V§8W§dX§aY§dZ§8a§4b§3c§ad§be§df§2g§3h§8i§5j§7k§3l§2m§1n§0o§6p§4q§8r§3s§2t§1u§2v§3w§6x§8y§2z§k§oA§aB§bC§cD§dE§5F§7G§3H§3I§2J§0K§eL§pM§bN§5O§9P§3Q§5R§eS§2T§4U§6V§8W§dX§aY§dZ§8a§4b§3c§ad§be§df§2g§3h§8i§5j§7k§3l§2m§1n§0o§6p§4q§8r§3s§2t§1u§2v§3w§6x§8y§2z§k§oA§aB§bC§cD§dE§5F§7G§3H§3I§2J§0K§eL§pM§bN§5O§9P§3Q§5R§eS§2T§4U§6V§8W§dX§aY§dZ§8a§4b§3c§ad§be§df§2g§3h§8i§5j§7k§3l§2m§1n§0o§6p§4q§8r§3s§2t§1u§2v§3w§6x§8y§2z§k§oA§aB§bC§cD§dE§5F§7G§3H§3I§2J§0K§eL§pM§bN§5O§9P§3Q§5R§eS§2T§4U§6V§8W§dX§aY§dZ§8a§4b§3c§ad§be§df§2g§3h§8i§5j§7k§3l§2m§1n§0o§6p§4q§8r§3s§2t§1u§2v§3w§6x§8y§2z§k§oA§aB§bC§cD§dE§5F§7G§3H§3I§2J§0K§eL§pM§bN§5O§9P§3Q§5R§eS§2T§4U§6V§8W§dX§aY§dZ§8a§4b§3c§ad§be§df§2g§3h§8i§5j§7k§3l§2m§1n§0o§6p§4q§8r§3s§2t§1u§2v§3w§6x§8y§2z§k§oA§aB§bC§cD§dE§5F§7G§3H§3I§2J§0K§eL§pM§bN§5O§9P§3Q§5R§eS§2T§4U§6V§8W§dX§aY§dZ§8a§4b§3c§ad§be§df§2g§3h§8i§5j§7k§3l§2m§1n§0o§6p§4q§8r§3s§2t§1u§2v§3w§6x§8y§2z§k§oA§aB§bC§cD§dE§5F§7G§3H§3I§2J§0K§eL§pM§bN§5O§9P§3Q§5R§eS§2T§4U§6V§8W§dX§aY§dZ§8a§4b§3c§ad§be§df§2g§3h§8i§5j§7k§3l§2m§1n§0o§6p§4q§8r§3s§2t§1u§2v§3w§6x§8y§2z§k§oA§aB§bC§cD§dE§5F§7G§3H§3I§2J§0K§eL§pM§bN§5O§9P§3Q§5R§eS§2T§4U§6V§8W§dX§aY§dZ§8a§4b§3c§ad§be§df§2g§3h§8i§5j§7k§3l§2m§1n§0o§6p§4q§8r§3s§2t§1u§2v§3w§6x§8y§2z§k§oA§aB§bC§cD§dE§5F§7G§3H§3I§2J§0K§eL§pM§bN§5O§9P§3Q§5R§eS§2T§4U§6V§8W§dX§aY§dZ§8a§4b§3c§ad§be§df§2g§3h§8i§5j§7k§3l§2m§1n§0o§6p§4q§8r§3s§2t§1u§2v§3w§6x§8y§2z§k§oA§aB§k§oA§aB§bC§cD§dE§5F§7G§3H§3I§2J§0K§eL§pM§bN§5O§9P§3Q§5R§eS§2T§4U§6V§8W§dX§aY§dZ§8a§4b§3c§ad§be§df§2g§3h§8i§5j§7k§3l§2m§1n§0o§6p§4q§8r§3s§2t§1u§2v§3w§6x§8y§2z§k§oA§aB§bC§cD§dE§5F§7G§3H§3I§2J§0K§eL§pM§bN§5O§9P§3Q§5R§eS§2T§4U§6V§8W§dX§aY§dZ§8a§4b§3c§ad§be§df§2g§3h§8i§5j§7k§3l§2m§1n§0o§6p§4q§8r§3s§2t§1u§2v§3w§6x§8y§2z§k§oA§aB§bC§cD§dE§5F§7G§3H§3I§2J§0K§eL§pM§bN§5O§9P§3Q§5R§eS§2T§4U§6V§8W§dX§aY§dZ§8a§4b§3c§ad§be§df§2g§3h§8i§5j§7k§3l§2m§1n§0o§6p§4q§8r§3s§2t§1u§2v§3w§6x§8y§2z§k§oA§aB§bC§cD§dE§5F§7G§3H§3I§2J§0K§eL§pM§bN§5O§9P§3Q§5R§eS§2T§4U§6V§8W§dX§aY§dZ§8a§4b§3c§ad§be§df§2g§3h§8i§5j§7k§3l§2m§1n§0o§6p§4q§8r§3s§2t§1u§2v§3w§6x§8y§2z§k§oA§aB§bC§cD§dE§5F§7G§3H§3I§2J§0K§eL§pM§bN§5O§9P§3Q§5R§eS§2T§4U§6V§8W§dX§aY§dZ§8a§4b§3c§ad§be§df§2g§3h§8i§5j§7k§3l§2m§1n§0o§6p§4q§8r§3s§2t§1u§2v§3w§6x§8y§2z§k§oA§aB§bC§cD§dE§5F§7G§3H§3I§2J§0K§eL§pM§bN§5O§9P§3Q§5R§eS§2T§4U§6V§8W§dX§aY§dZ§8a§4b§3c§ad§be§df§2g§3h§8i§5j§7k§3l§2m§1n§0o§6p§4q§8r§3s§2t§1u§2v§3w§6x§8y§2z§k§oA§aB§bC§cD§dE§5F§7G§3H§3I§2J§0K§eL§pM§bN§5O§9P§3Q§5R§eS§2T§4U§6V§8W§dX§aY§dZ§8a§4b§3c§ad§be§df§2g§3h§8i§5j§7k§3l§2m§1n§0o§6p§4q§8r§3s§2t§1u§2v§3w§6x§8y§2z§k§oA§aB§bC§cD§dE§5F§7G§3H§3I§2J§0K§eL§pM§bN§5O§9P§3Q§5R§eS§2T§4U§6V§8W§dX§aY§dZ§8a§4b§3c§ad§be§df§2g§3h§8i§5j§7k§3l§2m§1n§0o§6p§4q§8r§3s§2t§1u§2v§3w§6x§8y§2z§k§oA§aB§bC§cD§dE§5F§7G§3H§3I§2J§0K§eL§pM§bN§5O§9P§3Q§5R§eS§2T§4U§6V§8W§dX§aY§dZ§8a§4b§3c§ad§be§df§2g§3h§8i§5j§7k§3l§2m§1n§0o§6p§4q§8r§3s§2t§1u§2v§3w§6x§8y§2z§k§oA§aB§bC§cD§dE§5F§7G§3H§3I§2J§0K§eL§pM§bN§5O§9P§3Q§5R§eS§2T§4U§6V§8W§dX§aY§dZ§8a§4b§3c§ad§be§df§2g§3h§8i§5j§7k§3l§2m§1n§0o§6p§4q§8r§3s§2t§1u§2v§3w§6x§8y§2z§k§oA§aB§bC§cD§dE§5F§7G§3H§3I§2J§0K§eL§pM§bN§5O§9P§3Q§5R§eS§2T§4U§6V§8W§dX§aY§dZ§8a§4b§3c§ad§be§df§2g§3h§8i§5j§7k§3l§2m§1n§0o§6p§4q§8r§3s§2t§1u§2v§3w§6x§8y§2z§k§oA§aB§bC§cD§dE§5F§7G§3H§3I§2J§0K§eL§pM§bN§5O§9P§3Q§5R§eS§2T§4U§6V§8W§dX§aY§dZ§8a§4b§3c§ad§be§df§2g§3h§8i§5j§7k§3l§2m§1n§0o§6p§4q§8r§3s§2t§1u§2v§3w§6x§8y§2z§k§oA§aB§bC§cD§dE§5F§7G§3H§3I§2J§0K§eL§pM§bN§5O§9P§3Q§5R§eS§2T§4U§6V§8W§dX§aY§dZ§8a§4b§3c§ad§be§df§2g§3h§8i§5j§7k§3l§2m§1n§0o§6p§4q§8r§3s§2t§1u§2v§3w§6x§8y§2z§k§oA§aB§bC§cD§dE§5F§7G§3H§3I§2J§0K§eL§pM§bN§5O§9P§3Q§5R§eS§2T§4U§6V§8W§dX§aY§dZ§8a§4b§3c§ad§be§df§2g§3h§8i§5j§7k§3l§2m§1n§0o§6p§4q§8r§3s§2t§1u§2v§3w§6x§8y§2z§k§oA§aB§bC§cD§dE§5F§7G§3H§3I§2J§0K§eL§pM§bN§5O§9P§3Q§5R§eS§2T§4U§6V§8W§dX§aY§dZ§8a§4b§3c§ad§be§df§2g§3h§8i§5j§7k§3l§2m§1n§0o§6p§4q§8r§3s§2t§1u§2v§3w§6x§8y§2z§k§oA§aB§bC§cD§dE§5F§7G§3H§3I§2J§0K§eL§pM§bN§5O§9P§3Q§5R§eS§2T§4U§6V§8W§dX§aY§dZ§8a§4b§3c§ad§be§df§2g§3h§8i§5j§7k§3l§2m§1n§0o§6p§4q§8r§3s§2t§1u§2v§3w§6x§8y§2z§k§oA§aB§bC§cD§dE§5F§7G§3H§3I§2J§0K§eL§pM§bN§5O§9P§3Q§5R§eS§2T§4U§6V§8W§dX§aY§dZ§8a§4b§3c§ad§be§df§2g§3h§8i§5j§7k§3l§2m§1n§0o§6p§4q§8r§3s§2t§1u§2v§3w§6x§8y§2z§k§oA§aB§bC§cD§dE§5F§7G§3H§3I§2J§0K§eL§pM§bN§5O§9P§3Q§5R§eS§2T§4U§6V§8W§dX§aY§dZ§8a§4b§3c§ad§be§df§2g§3h§8i§5j§7k§3l§2m§1n§0o§6p§4q§8r§3s§2t§1u§2v§3w§6x§8y§2z§k§oA§aB§bC§cD§dE§5F§7G§3H§3I§2J§0K§eL§pM§bN§5O§9P§3Q§5R§eS§2T§4U§6V§8W§dX§aY§dZ§8a§4b§3c§ad§be§df§2g§3h§8i§5j§7k§3l§2m§1n§0o§6p§4q§8r§3s§2t§1u§2v§3w§6x§8y§2z§k§oA§aB§bC§cD§dE§5F§7G§3H§3I§2J§0K§eL§pM§bN§5O§9P§3Q§5R§eS§2T§4U§6V§8W§dX§aY§dZ§8a§4b§3c§ad§be§df§2g§3h§8i§5j§7k§3l§2m§1n§0o§6p§4q§8r§3s§2t§1u§2v§3w§6x§8y§2z§k§oA§aB§bC§cD§dE§5F§7G§3H§3I§2J§0K§eL§pM§bN§5O§9P§3Q§5R§eS§2T§4U§6V§8W§dX§aY§dZ§8a§4b§3c§ad§be§df§2g§3h§8i§5j§7k§3l§2m§1n§0o§6p§4q§8r§3s§2t§1u§2v§3w§6x§8y§2z§k§oA§aB§bC§cD§dE§5F§7G§3H§3I§2J§0K§eL§pM§bN§5O§9P§3Q§5R§eS§2T§4U§6V§8W§dX§aY§dZ§8a§4b§3c§ad§be§df§2g§3h§8i§5j§7k§3l§2m§1n§0o§6p§4q§8r§3s§2t§1u§2v§3w§6x§8y§2z§k§oA§aB§bC§cD§dE§5F§7G§3H§3I§2J§0K§eL§pM§bN§5O§9P§3Q§5R§eS§2T§4U§6V§8W§dX§aY§dZ§8a§4b§3c§ad§be§df§2g§3h§8i§5j§7k§3l§2m§1n§0o§6p§4q§8r§3s§2t§1u§2v§3w§6x§8y§2z§k§oA§aB§k§oA§aB§bC§cD§dE§5F§7G§3H§3I§2J§0K§eL§pM§bN§5O§9P§3Q§5R§eS§2T§4U§6V§8W§dX§aY§dZ§8a§4b§3c§ad§be§df§2g§3h§8i§5j§7k§3l§2m§1n§0o§6p§4q§8r§3s§2t§1u§2v§3w§6x§8y§2z§k§oA§aB§bC§cD§dE§5F§7G§3H§3I§2J§0K§eL§pM§bN§5O§9P§3Q§5R§eS§2T§4U§6V§8W§dX§aY§dZ§8a§4b§3c§ad§be§df§2g§3h§8i§5j§7k§3l§2m§1n§0o§6p§4q§8r§3s§2t§1u§2v§3w§6x§8y§2z§k§oA§aB§bC§cD§dE§5F§7G§3H§3I§2J§0K§eL§pM§bN§5O§9P§3Q§5R§eS§2T§4U§6V§8W§dX§aY§dZ§8a§4b§3c§ad§be§df§2g§3h§8i§5j§7k§3l§2m§1n§0o§6p§4q§8r§3s§2t§1u§2v§3w§6x§8y§2z§k§oA§aB§bC§cD§dE§5F§7G§3H§3I§2J§0K§eL§pM§bN§5O§9P§3Q§5R§eS§2T§4U§6V§8W§dX§aY§dZ§8a§4b§3c§ad§be§df§2g§3h§8i§5j§7k§3l§2m§1n§0o§6p§4q§8r§3s§2t§1u§2v§3w§6x§8y§2z§k§oA§aB§bC§cD§dE§5F§7G§3H§3I§2J§0K§eL§pM§bN§5O§9P§3Q§5R§eS§2T§4U§6V§8W§dX§aY§dZ§8a§4b§3c§ad§be§df§2g§3h§8i§5j§7k§3l§2m§1n§0o§6p§4q§8r§3s§2t§1u§2v§3w§6x§8y§2z§k§oA§aB§bC§cD§dE§5F§7G§3H§3I§2J§0K§eL§pM§bN§5O§9P§3Q§5R§eS§2T§4U§6V§8W§dX§aY§dZ§8a§4b§3c§ad§be§df§2g§3h§8i§5j§7k§3l§2m§1n§0o§6p§4q§8r§3s§2t§1u§2v§3w§6x§8y§2z§k§oA§aB§bC§cD§dE§5F§7G§3H§3I§2J§0K§eL§pM§bN§5O§9P§3Q§5R§eS§2T§4U§6V§8W§dX§aY§dZ§8a§4b§3c§ad§be§df§2g§3h§8i§5j§7k§3l§2m§1n§0o§6p§4q§8r§3s§2t§1u§2v§3w§6x§8y§2z§k§oA§aB§bC§cD§dE§5F§7G§3H§3I§2J§0K§eL§pM§bN§5O§9P§3Q§5R§eS§2T§4U§6V§8W§dX§aY§dZ§8a§4b§3c§ad§be§df§2g§3h§8i§5j§7k§3l§2m§1n§0o§6p§4q§8r§3s§2t§1u§2v§3w§6x§8y§2z§k§oA§aB§bC§cD§dE§5F§7G§3H§3I§2J§0K§eL§pM§bN§5O§9P§3Q§5R§eS§2T§4U§6V§8W§dX§aY§dZ§8a§4b§3c§ad§be§df§2g§3h§8i§5j§7k§3l§2m§1n§0o§6p§4q§8r§3s§2t§1u§2v§3w§6x§8y§2z§k§oA§aB§bC§cD§dE§5F§7G§3H§3I§2J§0K§eL§pM§bN§5O§9P§3Q§5R§eS§2T§4U§6V§8W§dX§aY§dZ§8a§4b§3c§ad§be§df§2g§3h§8i§5j§7k§3l§2m§1n§0o§6p§4q§8r§3s§2t§1u§2v§3w§6x§8y§2z§k§oA§aB§bC§cD§dE§5F§7G§3H§3I§2J§0K§eL§pM§bN§5O§9P§3Q§5R§eS§2T§4U§6V§8W§dX§aY§dZ§8a§4b§3c§ad§be§df§2g§3h§8i§5j§7k§3l§2m§1n§0o§6p§4q§8r§3s§2t§1u§2v§3w§6x§8y§2z§k§oA§aB§bC§cD§dE§5F§7G§3H§3I§2J§0K§eL§pM§bN§5O§9P§3Q§5R§eS§2T§4U§6V§8W§dX§aY§dZ§8a§4b§3c§ad§be§df§2g§3h§8i§5j§7k§3l§2m§1n§0o§6p§4q§8r§3s§2t§1u§2v§3w§6x§8y§2z§k§oA§aB§bC§cD§dE§5F§7G§3H§3I§2J§0K§eL§pM§bN§5O§9P§3Q§5R§eS§2T§4U§6V§8W§dX§aY§dZ§8a§4b§3c§ad§be§df§2g§3h§8i§5j§7k§3l§2m§1n§0o§6p§4q§8r§3s§2t§1u§2v§3w§6x§8y§2z§k§oA§aB§bC§cD§dE§5F§7G§3H§3I§2J§0K§eL§pM§bN§5O§9P§3Q§5R§eS§2T§4U§6V§8W§dX§aY§dZ§8a§4b§3c§ad§be§df§2g§3h§8i§5j§7k§3l§2m§1n§0o§6p§4q§8r§3s§2t§1u§2v§3w§6x§8y§2z§k§oA§aB§bC§cD§dE§5F§7G§3H§3I§2J§0K§eL§pM§bN§5O§9P§3Q§5R§eS§2T§4U§6V§8W§dX§aY§dZ§8a§4b§3c§ad§be§df§2g§3h§8i§5j§7k§3l§2m§1n§0o§6p§4q§8r§3s§2t§1u§2v§3w§6x§8y§2z§k§oA§aB§bC§cD§dE§5F§7G§3H§3I§2J§0K§eL§pM§bN§5O§9P§3Q§5R§eS§2T§4U§6V§8W§dX§aY§dZ§8a§4b§3c§ad§be§df§2g§3h§8i§5j§7k§3l§2m§1n§0o§6p§4q§8r§3s§2t§1u§2v§3w§6x§8y§2z§k§oA§aB§bC§cD§dE§5F§7G§3H§3I§2J§0K§eL§pM§bN§5O§9P§3Q§5R§eS§2T§4U§6V§8W§dX§aY§dZ§8a§4b§3c§ad§be§df§2g§3h§8i§5j§7k§3l§2m§1n§0o§6p§4q§8r§3s§2t§1u§2v§3w§6x§8y§2z§k§oA§aB§bC§cD§dE§5F§7G§3H§3I§2J§0K§eL§pM§bN§5O§9P§3Q§5R§eS§2T§4U§6V§8W§dX§aY§dZ§8a§4b§3c§ad§be§df§2g§3h§8i§5j§7k§3l§2m§1n§0o§6p§4q§8r§3s§2t§1u§2v§3w§6x§8y§2z§k§oA§aB§bC§cD§dE§5F§7G§3H§3I§2J§0K§eL§pM§bN§5O§9P§3Q§5R§eS§2T§4U§6V§8W§dX§aY§dZ§8a§4b§3c§ad§be§df§2g§3h§8i§5j§7k§3l§2m§1n§0o§6p§4q§8r§3s§2t§1u§2v§3w§6x§8y§2z§k§oA§aB§bC§cD§dE§5F§7G§3H§3I§2J§0K§eL§pM§bN§5O§9P§3Q§5R§eS§2T§4U§6V§8W§dX§aY§dZ§8a§4b§3c§ad§be§df§2g§3h§8i§5j§7k§3l§2m§1n§0o§6p§4q§8r§3s§2t§1u§2v§3w§6x§8y§2z§k§oA§aB§bC§cD§dE§5F§7G§3H§3I§2J§0K§eL§pM§bN§5O§9P§3Q§5R§eS§2T§4U§6V§8W§dX§aY§dZ§8a§4b§3c§ad§be§df§2g§3h§8i§5j§7k§3l§2m§1n§0o§6p§4q§8r§3s§2t§1u§2v§3w§6x§8y§2z§k§oA§aB§bC§cD§dE§5F§7G§3H§3I§2J§0K§eL§pM§bN§5O§9P§3Q§5R§eS§2T§4U§6V§8W§dX§aY§dZ§8a§4b§3c§ad§be§df§2g§3h§8i§5j§7k§3l§2m§1n§0o§6p§4q§8r§3s§2t§1u§2v§3w§6x§8y§2z§k§oA§aB§bC§cD§dE§5F§7G§3H§3I§2J§0K§eL§pM§bN§5O§9P§3Q§5R§eS§2T§4U§6V§8W§dX§aY§dZ§8a§4b§3c§ad§be§df§2g§3h§8i§5j§7k§3l§2m§1n§0o§6p§4q§8r§3s§2t§1u§2v§3w§6x§8y§2z§k§oA§aB§k§oA§aB§bC§cD§dE§5F§7G§3H§3I§2J§0K§eL§pM§bN§5O§9P§3Q§5R§eS§2T§4U§6V§8W§dX§aY§dZ§8a§4b§3c§ad§be§df§2g§3h§8i§5j§7k§3l§2m§1n§0o§6p§4q§8r§3s§2t§1u§2v§3w§6x§8y§2z§k§oA§aB§bC§cD§dE§5F§7G§3H§3I§2J§0K§eL§pM§bN§5O§9P§3Q§5R§eS§2T§4U§6V§8W§dX§aY§dZ§8a§4b§3c§ad§be§df§2g§3h§8i§5j§7k§3l§2m§1n§0o§6p§4q§8r§3s§2t§1u§2v§3w§6x§8y§2z§k§oA§aB§bC§cD§dE§5F§7G§3H§3I§2J§0K§eL§pM§bN§5O§9P§3Q§5R§eS§2T§4U§6V§8W§dX§aY§dZ§8a§4b§3c§ad§be§df§2g§3h§8i§5j§7k§3l§2m§1n§0o§6p§4q§8r§3s§2t§1u§2v§3w§6x§8y§2z§k§oA§aB§bC§cD§dE§5F§7G§3H§3I§2J§0K§eL§pM§bN§5O§9P§3Q§5R§eS§2T§4U§6V§8W§dX§aY§dZ§8a§4b§3c§ad§be§df§2g§3h§8i§5j§7k§3l§2m§1n§0o§6p§4q§8r§3s§2t§1u§2v§3w§6x§8y§2z§k§oA§aB§bC§cD§dE§5F§7G§3H§3I§2J§0K§eL§pM§bN§5O§9P§3Q§5R§eS§2T§4U§6V§8W§dX§aY§dZ§8a§4b§3c§ad§be§df§2g§3h§8i§5j§7k§3l§2m§1n§0o§6p§4q§8r§3s§2t§1u§2v§3w§6x§8y§2z§k§oA§aB§bC§cD§dE§5F§7G§3H§3I§2J§0K§eL§pM§bN§5O§9P§3Q§5R§eS§2T§4U§6V§8W§dX§aY§dZ§8a§4b§3c§ad§be§df§2g§3h§8i§5j§7k§3l§2m§1n§0o§6p§4q§8r§3s§2t§1u§2v§3w§6x§8y§2z§k§oA§aB§bC§cD§dE§5F§7G§3H§3I§2J§0K§eL§pM§bN§5O§9P§3Q§5R§eS§2T§4U§6V§8W§dX§aY§dZ§8a§4b§3c§ad§be§df§2g§3h§8i§5j§7k§3l§2m§1n§0o§6p§4q§8r§3s§2t§1u§2v§3w§6x§8y§2z§k§oA§aB§bC§cD§dE§5F§7G§3H§3I§2J§0K§eL§pM§bN§5O§9P§3Q§5R§eS§2T§4U§6V§8W§dX§aY§dZ§8a§4b§3c§ad§be§df§2g§3h§8i§5j§7k§3l§2m§1n§0o§6p§4q§8r§3s§2t§1u§2v§3w§6x§8y§2z§k§oA§aB§bC§cD§dE§5F§7G§3H§3I§2J§0K§eL§pM§bN§5O§9P§3Q§5R§eS§2T§4U§6V§8W§dX§aY§dZ§8a§4b§3c§ad§be§df§2g§3h§8i§5j§7k§3l§2m§1n§0o§6p§4q§8r§3s§2t§1u§2v§3w§6x§8y§2z§k§oA§aB§bC§cD§dE§5F§7G§3H§3I§2J§0K§eL§pM§bN§5O§9P§3Q§5R§eS§2T§4U§6V§8W§dX§aY§dZ§8a§4b§3c§ad§be§df§2g§3h§8i§5j§7k§3l§2m§1n§0o§6p§4q§8r§3s§2t§1u§2v§3w§6x§8y§2z§k§oA§aB§bC§cD§dE§5F§7G§3H§3I§2J§0K§eL§pM§bN§5O§9P§3Q§5R§eS§2T§4U§6V§8W§dX§aY§dZ§8a§4b§3c§ad§be§df§2g§3h§8i§5j§7k§3l§2m§1n§0o§6p§4q§8r§3s§2t§1u§2v§3w§6x§8y§2z§k§oA§aB§bC§cD§dE§5F§7G§3H§3I§2J§0K§eL§pM§bN§5O§9P§3Q§5R§eS§2T§4U§6V§8W§dX§aY§dZ§8a§4b§3c§ad§be§df§2g§3h§8i§5j§7k§3l§2m§1n§0o§6p§4q§8r§3s§2t§1u§2v§3w§6x§8y§2z§k§oA§aB§bC§cD§dE§5F§7G§3H§3I§2J§0K§eL§pM§bN§5O§9P§3Q§5R§eS§2T§4U§6V§8W§dX§aY§dZ§8a§4b§3c§ad§be§df§2g§3h§8i§5j§7k§3l§2m§1n§0o§6p§4q§8r§3s§2t§1u§2v§3w§6x§8y§2z§k§oA§aB§bC§cD§dE§5F§7G§3H§3I§2J§0K§eL§pM§bN§5O§9P§3Q§5R§eS§2T§4U§6V§8W§dX§aY§dZ§8a§4b§3c§ad§be§df§2g§3h§8i§5j§7k§3l§2m§1n§0o§6p§4q§8r§3s§2t§1u§2v§3w§6x§8y§2z§k§oA§aB§bC§cD§dE§5F§7G§3H§3I§2J§0K§eL§pM§bN§5O§9P§3Q§5R§eS§2T§4U§6V§8W§dX§aY§dZ§8a§4b§3c§ad§be§df§2g§3h§8i§5j§7k§3l§2m§1n§0o§6p§4q§8r§3s§2t§1u§2v§3w§6x§8y§2z§k§oA§aB§bC§cD§dE§5F§7G§3H§3I§2J§0K§eL§pM§bN§5O§9P§3Q§5R§eS§2T§4U§6V§8W§dX§aY§dZ§8a§4b§3c§ad§be§df§2g§3h§8i§5j§7k§3l§2m§1n§0o§6p§4q§8r§3s§2t§1u§2v§3w§6x§8y§2z§k§oA§aB§bC§cD§dE§5F§7G§3H§3I§2J§0K§eL§pM§bN§5O§9P§3Q§5R§eS§2T§4U§6V§8W§dX§aY§dZ§8a§4b§3c§ad§be§df§2g§3h§8i§5j§7k§3l§2m§1n§0o§6p§4q§8r§3s§2t§1u§2v§3w§6x§8y§2z§k§oA§aB§bC§cD§dE§5F§7G§3H§3I§2J§0K§eL§pM§bN§5O§9P§3Q§5R§eS§2T§4U§6V§8W§dX§aY§dZ§8a§4b§3c§ad§be§df§2g§3h§8i§5j§7k§3l§2m§1n§0o§6p§4q§8r§3s§2t§1u§2v§3w§6x§8y§2z§k§oA§aB§bC§cD§dE§5F§7G§3H§3I§2J§0K§eL§pM§bN§5O§9P§3Q§5R§eS§2T§4U§6V§8W§dX§aY§dZ§8a§4b§3c§ad§be§df§2g§3h§8i§5j§7k§3l§2m§1n§0o§6p§4q§8r§3s§2t§1u§2v§3w§6x§8y§2z§k§oA§aB§bC§cD§dE§5F§7G§3H§3I§2J§0K§eL§pM§bN§5O§9P§3Q§5R§eS§2T§4U§6V§8W§dX§aY§dZ§8a§4b§3c§ad§be§df§2g§3h§8i§5j§7k§3l§2m§1n§0o§6p§4q§8r§3s§2t§1u§2v§3w§6x§8y§2z§k§oA§aB§bC§cD§dE§5F§7G§3H§3I§2J§0K§eL§pM§bN§5O§9P§3Q§5R§eS§2T§4U§6V§8W§dX§aY§dZ§8a§4b§3c§ad§be§df§2g§3h§8i§5j§7k§3l§2m§1n§0o§6p§4q§8r§3s§2t§1u§2v§3w§6x§8y§2z§k§oA§aB§bC§cD§dE§5F§7G§3H§3I§2J§0K§eL§pM§bN§5O§9P§3Q§5R§eS§2T§4U§6V§8W§dX§aY§dZ§8a§4b§3c§ad§be§df§2g§3h§8i§5j§7k§3l§2m§1n§0o§6p§4q§8r§3s§2t§1u§2v§3w§6x§8y§2z§k§oA§aB§bC§cD§dE§5F§7G§3H§3I§2J§0K§eL§pM§bN§5O§9P§3Q§5R§eS§2T§4U§6V§8W§dX§aY§dZ§8a§4b§3c§ad§be§df§2g§3h§8i§5j§7k§3l§2m§1n§0o§6p§4q§8r§3s§2t§1u§2v§3w§6x§8y§2z§k§oA§aB"
module.exports = {
    data: new SlashCommandBuilder()
        .setName("silly_msg")
        .setIntegrationTypes(0, 1)
        .setContexts(0, 1, 2)
        .setDescription("Spam the Realm with Silly Messages")
        .addStringOption(option =>
            option.setName('invite')
                .setDescription('Realm invite code or Realm ID')
                .setRequired(true)
                .setMinLength(8)
                .setMaxLength(15))
        .addIntegerOption(option => 
                    option.setName('device')
                        .setDescription('What Device Spoof')
                        .setRequired(true)
                        .addChoices(
                            { name: 'Silly Cat +', value: 69696 },
                            { name: 'Silly Cat -', value: -69696 },
                            { name: 'Samsung Fridge', value: 16 },
                            { name: 'Samsung Washmaschine', value: 17 },
                            { name: 'Guh', value: 18 },
                            { name: 'Unknowen', value: 0 },
                            { name: 'Android', value: 1 },
                            { name: 'IOS', value: 2 },
                            { name: 'OSX', value: 3 },
                            { name: 'FireOS', value: 4 },
                            { name: 'GearVR', value: 5 },
                            { name: 'Hololens', value: 6 },
                            { name: 'Windows 10 (x64)', value: 7 },
                            { name: 'Windows 10(x86)', value: 8 },
                            { name: 'Dedicated Server', value: 9 },
                            { name: 'TvOS (Appel TV)', value: 10 },
                            { name: 'Playstation', value: 11 },
                            { name: 'Nitendo Switch', value: 12 },
                            { name: 'XBOX', value: 13 },
                            { name: 'Phone (windows)', value: 14 },
                            { name: 'Linux', value: 15 },
                        ))
        .addStringOption(option =>
                option.setName('namespoof_name')
                        .setDescription('Name Spoof Name')
                        .setRequired(false)),
    async execute(interaction) {
        
        const invite = interaction.options.getString('invite');
        let disconnected = false;
        const external = interaction.options.getBoolean('external');
        const message1 = interaction.options.getString('message');
        const packetCount = interaction.options.getInteger('packets');
        const spamType = interaction.options.getInteger('spamtype');
        const device = interaction.options.getInteger('device');
        const rainbow = interaction.options.getBoolean('rainbow') || false;
        const bypass = interaction.options.getBoolean('bypass') || false;
        const emojie = interaction.options.getBoolean('emojie') || false;
        const namespoof = interaction.options.getString('namespoof_name') || " ";
        const customMessage2 = interaction.options.getString('message2') || "§3 Ranls §4 on TOP";
        const rainbowLink = rainbowText(config.link);
        

        const off = "⚫";
        const waiting = "🟡";
        const done = "🟢";
        const err1 = "🔴";

        try {
            const main = new EmbedBuilder()
                .setTitle("Realm Spam")
                .setDescription("Loading data, this may take a few seconds depending on the workload.")
                .setFields(
                    { name: 'Connected', value: off, inline: false },
                    { name: 'Spammed', value: off, inline: false },
                    { name: 'Disconnected', value: off, inline: false },
                    { name: 'Disconnected Reason', value: waiting, inline: false },
                )
                .setColor(config.embeds.color);

            await interaction.reply({ embeds: [main] });

            const databasePath = './data/user/users.json';
            let database;
            try {
                database = JSON.parse(fs.readFileSync(databasePath, 'utf8'));
            } catch (error) {
                return interaction.editReply({
                    content: 'Failed to load the database.',
                    ephemeral: true,
                });
            }

            if (!fs.existsSync(`./data/user/profilefolders/${interaction.user.id}`)) {
                await interaction.editReply({
                    embeds: [
                        {
                            title: 'Account Not Linked',
                            description: 'It seems like you haven\'t linked an account yet.\nPlease link an account with \'/link\' to use this command.',
                            color: 0xff0000,
                        },
                    ],
                });
                return;
            }

            const whitelist = JSON.parse(fs.readFileSync('./data/util/whitelist.json', 'utf8'));
            if (whitelist.includes(invite)) {
                return interaction.editReply({
                    embeds: [
                        new EmbedBuilder()
                            .setTitle('Realm Error')
                            .setDescription(`The invite ${invite} is in the whitelist and cannot be nuked.`)
                            .setColor(config.embeds.color)
                    ]
                });
            }
            /*          Refreshing caused many Ratelimits/Errors so i removed it
            const crypto = require("node:crypto");
            const curve = "secp384r1";
            const keypair = crypto.generateKeyPairSync("ec", { namedCurve: curve }).toString("base64");
            const bot = new Authflow(
                interaction.user.id, 
                path.resolve(`./data/user/profilefolders/${interaction.user.id}`), 
                {
                    flow: 'live',
                    authTitle: 'MinecraftNintendoSwitch',
                    deviceType: 'Nintendo',
                    doSisuAuth: true
                }
            );

            async function refreshOrRetrieveTokens() {
                try {
                    const xboxToken = await bot.getXboxToken();
                    await bot.getMinecraftBedrockToken(keypair);
                    return xboxToken;
                } catch (error) {
                    await interaction.editReply({
                        embeds: [
                            new EmbedBuilder()
                                .setTitle("Token Refresh Error")
                                .setDescription("We could not refresh your Token. Try to Relink or Link a new Account")
                                .setColor(config.embeds.color)
                        ]
                    });
                }
            }

            (async () => {
                console.log(`${colors.blue}[${new Date().toLocaleTimeString()}] ${colors.yellow}Refreshing ${interaction.user.tag}/${interaction.user.id} XBL Token ...`);

                const token = await refreshOrRetrieveTokens();
                if (token) {
                    console.log(`${colors.blue}[${new Date().toLocaleTimeString()}] ${colors.green} Successfully Refreshed ${interaction.user.tag}/${interaction.user.id} XBL Token`);
                } else {
                    console.log(`${colors.blue}[${new Date().toLocaleTimeString()}] ${colors.red}Error while Refreshing ${interaction.user.tag}/${interaction.user.id} XBL Token`);
                    await interaction.editReply({
                        embeds: [
                            new EmbedBuilder()
                                .setTitle("Token Refresh Error")
                                .setDescription("We could not refresh your Token. Try to Relink or Link a new Account")
                                .setColor(config.embeds.color)
                        ]
                    });
                    return;
                }
            })();
        */
            const realm = await getrealminfo(invite);
            if (!realm) {
                console.error(`[${new Date().toLocaleTimeString()}] Error: Realm not found`);
                return interaction.editReply({
                    embeds: [
                        new EmbedBuilder()
                            .setTitle('Realm Error')
                            .setDescription('Invalid code: realm not found or account banned.')
                            .setColor(config.embeds.color)
                    ]
                });
            }

            const client = createClient({
                profilesFolder: `./data/user/profilefolders/${interaction.user.id}`,
                username: interaction.user.id,
                offline: false,
                realms: {
                    ...(invite.length === 8
                        ? { realmId: invite }
                        : { realmInvite: invite })
                },
                skinData: {
                    DeviceOS: device,
                    DeviceId: getDeviceId(device),
                    PlatformOnlineId: genrandomstring(19, '1234567890'),
                    PrimaryUser: false,
                    SelfSignedId: uuidv4(),
                    ThirdPartyName: namespoof,
                    ThirdPartyNameOnly: true,
                    TrustedSkin: true,
                    ...skinData // costume skin for less detection
                },
                skipPing: true
            });

            client.on('server_stats', async (err) => {
                console.error(`${colors.blue}[${new Date().toLocaleTimeString()}]${colors.yellow} Buggy Packet Received: ${err.message || err}`);
            });

            client.on('error', async (err) => {
                console.error(`${colors.blue}[${new Date().toLocaleTimeString()}] ${colors.yellow} Client error: ${err.message || err}`);
                main.setDescription(`Wops! There was a error while Trying to join the Realm`)
                main.setFields(
                    { name: 'Connected', value: off, inline: false },
                    { name: 'Spammed', value: err1, inline: false },
                    { name: 'Disconnected', value: err1, inline: false },
                    { name: 'Disconnected Reason', value: `${err}`, inline: false }
                );
                interaction.editReply({ embeds: [main] });
                return;
            });

          

            const usera = namespoof || gamertag;

            client.on('spawn', async () => {
                console.log(`${colors.green}[Realm Watcher]>> User ${interaction.user.username}/${interaction.user.id} joined Realm ${realm.name}/${invite}`);
                try {
                    main.setDescription(`${reply1}Realm Name:${realm.name}\n${reply1}Realm ID:${realm.id}\n${reply2}Realm IP:${realm.ip}`)
                    main.setFields(
                        { name: 'Connected', value: done, inline: false },
                        { name: 'Spammed', value: waiting, inline: false },
                        { name: 'Disconnected', value: waiting, inline: false },
                        { name: 'Disconnected Reason', value: waiting, inline: false }
                    );
                    interaction.editReply({ embeds: [main] });

                    setTimeout(() => {
                        if (disconnected) return;
                        main.setFields(
                            { name: 'Connected', value: done, inline: false },
                            { name: 'Spammed', value: done, inline: false },
                            { name: 'Disconnected', value: waiting, inline: false },
                            { name: 'Disconnected Reason', value: waiting, inline: false }
                        );
                        interaction.editReply({ embeds: [main] });

                        setInterval(() => {
                            client.write("text", {
                                filtered_message: "",
                                type: "chat",
                                needs_translation: false,
                                source_name: client.profile.name,
                               message: sillymsg,
                                xuid: "0",
                                platform_chat_id: "0"
                            });

                            client.write("text", {
                                filtered_message: "",
                                type: "chat",
                                needs_translation: false,
                                source_name: client.profile.name,
                               message: sillymsg,
                                xuid: "0",
                                platform_chat_id: "0"
                            });
                        }
                    )}, 1500);

                    setTimeout(() => {
                        if (!disconnected) {
                            client.close();
                            main.setFields(
                                { name: 'Connected', value: done, inline: false },
                                { name: 'Spammed', value: done, inline: false },
                                { name: 'Disconnected', value: done, inline: false },
                                { name: 'Disconnected Reason', value: waiting, inline: false }
                            );
                            interaction.editReply({ embeds: [main] });
                            disconnected = true;
                        }
                    }, 8000);
                } catch (error) {
                    console.error(error);
                    throw error;
                }
            });

            const e = {
                "disconnectionScreen.noReason": "You have been disconnected from the Realm because of sending too many packets",
                "disconnection.kicked.reason": "You have been Kicked From the Realm",
                "disconnection.kicked": "You have been Kicked From the Realm",
                "disconnectionScreen.outdatedClient": "The Realm is outdated!",
                "disconnectionScreen.disconnected": "Disconnected from the Realm",
                "disconnectionScreen.serverFull": "Realm is Currently Full",
                "disconnectionScreen.notAllowed": "Something didn't go right, try to use a less longer NameSpoof Name. (notAllowed)",
                "disconnectionScreen.serverIdConflict": "Client already in this Realm. Leave with the Account or wait until your Interaction is done",
                "disconnectionScreen.loggedinOtherLocation": "Client already in this Realm. Leave with the Account or wait until your Interaction is done",
                "disconnectionScreen.worldCorruption": "The world on this realm is corrupted, Unable to Join",
                "disconnect.scriptWatchdog": "The realm was shut down due to an unhandled scripting watchdog exception.",
                "disconnect.scriptWatchdogOutOfMemory": "The realm was shut down because of scripting memory limit."
            };

            function parseKickMessage(error) {
                for (const key in e) {
                    error = error.replace(key, e[key]);
                }
                return error;
            }

            client.on('kick', async (reason) => {
                console.log(`${colors.blue}[${new Date().toLocaleTimeString()}] ${colors.red} Client Kicked from the Realm. ${realm.id}/${realm.name}. ${parseKickMessage(reason.message)}`);
                main.setFields(
                    { name: 'Connected', value: off, inline: false },
                    { name: 'Spammed', value: err1, inline: false },
                    { name: 'Disconnected', value: err1, inline: false },
                    { name: 'Disconnected Reason', value: parseKickMessage(reason.message), inline: false }
                );
                interaction.editReply({ embeds: [main] });
            });

            client.on('close', async (err) => {
                if (!err) {
                    const a = "N/A";
                    return a;
                }
                if (disconnected) return;
                disconnected = true;
                console.log(`${colors.blue}[${new Date().toLocaleTimeString()}]${colors.red}Client closed Connection from the Realm. ${realm.id}/${realm.name}.`);
                main.setFields(
                    { name: 'Connected', value: off, inline: false },
                    { name: 'Spammed', value: err1, inline: false },
                    { name: 'Disconnected', value: err1, inline: false },
                    { name: 'Disconnected Reason', value: parseKickMessage(err.message || "N/A"), inline: false }
                );
                interaction.editReply({ embeds: [main] });
            });
        } catch (err) {
            console.error(err);
        }
    }
};

function genrandomstring(length, charSet) {
    if (!charSet) charSet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890_-';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += charSet.charAt(Math.floor(Math.random() * charSet.length));
    }
    return result;
}

function colorizeText(text) {
    const words = text.split(' ');
    const coloredWords = words.map(word => {
        const colorCode = randomCode();
        return `${colorCode}${word}`;
    });
    return coloredWords.join(' ');
}

function rainbowText(text) {
    const colors = ['§c', '§6', '§e', '§a', '§b', '§9', '§d', '§f'];
    let rainbowedText = '';
    
    for (let i = 0; i < text.length; i++) {
        rainbowedText += colors[i % colors.length] + text[i];
    }
    return rainbowedText;
}

function randomCode() {
    const optionsString = "1234567890";
    const optionsArray = optionsString.split('');
    const randomIndex = Math.floor(Math.random() * optionsArray.length);
    const randomOption = optionsArray[randomIndex];
    return "§" + randomOption;
}

function emojie1(length) {
    const characters = '';
    let result = '';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

function getDeviceId(deviceOS) { // most of them look like the real device id so guh
	const getUUIDv3 = () => uuidv3(uuidv4(), NIL);
	const getUUIDv5 = () => uuidv5(uuidv4(), NIL);

	switch (deviceOS) {
		// Android
		case 1:
			return uuidv4().replace(/-/g, "");

		// iOS
		case 2:
			return uuidv4().replace(/-/g, "").toUpperCase();

		// Windows (x86)
		case 7:
			return getUUIDv3();

		// Windows (x64)
		case 8:
			return getUUIDv3();

		// Playstation
		case 11:
			return getUUIDv3();

		// Nintendo Switch
		case 12:
			return getUUIDv5();

		// Xbox
		case 13:
			return genrandomstring(44, "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890/=+");

		default:
			return uuidv4();
	}
}
