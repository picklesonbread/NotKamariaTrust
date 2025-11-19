const {
  SlashCommandBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  PermissionFlagsBits
} = require('discord.js');

module.exports = {
  name: 'rolesetup',
  aliases: ['roles', 'setup'],
  description: 'Post the full self-assign role menu',

  await interaction.deferReply();

  data: new SlashCommandBuilder()
    .setName('rolesetup')
    .setDescription('Post the full self-assign role menu'),

  async execute(interaction, args, client) {
    // 1️⃣ WHO ARE U
    const whoMenu = new StringSelectMenuBuilder()
      .setCustomId('role_who')
      .setPlaceholder('who are u?')
      .addOptions([
        { label: 'female', value: '1416467332242345994', emoji: '<:crown:1416496334608797957>' },
        { label: 'male', value: '1416467658177773661', emoji: '<:pancake:1416496385876037803>' },
        { label: 'other', value: '1416468054279323761', emoji: '<:other:1416497549749129277>' },
      ]);

    // 2️⃣ AGE
    const ageMenu = new StringSelectMenuBuilder()
      .setCustomId('role_age')
      .setPlaceholder("what's ur age?")
      .addOptions([
        { label: '16-20', value: '1416468269602439238', emoji: '<:new:1416497721237573642>' },
        { label: '21-25', value: '1416468532966719588', emoji: '<:coin:1416497757543338064>' },
        { label: '25-30', value: '1416468791189307523', emoji: '<:volcano:1416497799821791405>' },
        { label: '30+', value: '1416468928716210258', emoji: '<:old:1416497825432342591>' },
      ]);

    // 3️⃣ FAVORITE COLOR
    const colorMenu = new StringSelectMenuBuilder()
      .setCustomId('role_color')
      .setPlaceholder('favorite color?')
      .addOptions([
        { label: 'pink', value: '1416469082328535221', emoji: '<:pink:1416480420916367701>' },
        { label: 'green', value: '1416469243964293171', emoji: '<:green:1416479568327610429>' },
        { label: 'blue', value: '1416469524399788112', emoji: '<:blue:1416479824314110042>' },
        { label: 'yellow', value: '1416469715471302757', emoji: '<:yellow:1416479386793807994>' },
        { label: 'orange', value: '1416469902381940736', emoji: '<:orange:1416479449339138129>' },
        { label: 'red', value: '1416470013996699810', emoji: '<:red:1416479522378875013>' },
        { label: 'purple', value: '1416470116786241607', emoji: '<:purple:1416479858598613155>' },
        { label: 'black', value: '1416470181865062504', emoji: '<:black:1416480453967482980>' },
      ]);

    // 4️⃣ VIBE
    const vibeMenu = new StringSelectMenuBuilder()
      .setCustomId('role_vibe')
      .setPlaceholder('ur vibe?')
      .addOptions([
        { label: 'potion spiller', description: 'turns every plan into a small chemical incident', value: '1416470316368269413', emoji: '<:potion:1416489612196581427>' },
        { label: 'quest hoarder', description: 'accepts every quest, finishes none, brags anyway', value: '1416470501521625188', emoji: '<:quest:1416489662117056602>' },
        { label: 'banana economist', description: 'speaks only in market crash metaphors', value: '1416470671344668833', emoji: '<:banana:1416489713317187584>' },
        { label: 'moonlight eavesdropper', description: 'knows everyone\'s business, swears it\'s "for the prophecy"', value: '1416470835346018304', emoji: '<:moon:1416489770044887060>' },
        { label: 'teleport button masher', description: 'never walks, only rage-clicks', value: '1416470951549210624', emoji: '<:button:1416489826814922954>' },
        { label: 'swamp philosopher', description: 'shares unsolicited wisdom from Boggy Swamp at 3 a.m.', value: '1416471007782240321', emoji: '<:shrek:1416489876999770122>' },
        { label: 'golden chair sitter', description: 'logs in only to decorate, never leaves the room', value: '1416471126929834214', emoji: '<:gold:1416489920955941004>' },
        { label: 'bridge gremlin', description: 'camps at the Panfu Bridge just to watch chaos unfold', value: '1416471284363296960', emoji: '<:bridge:1416489970981404682>' },
        { label: 'trench coat truth seeker', description: 'insists Kamaria owes them rent money', value: '1416471487807754381', emoji: '<:spy:1416490015831359638>' },
        { label: 'permanent tutorial', description: 'somehow still in the first quest after years', value: '1416471642787283145', emoji: '<:questbook:1416490072332570655>' },
      ]);

    await interaction.reply({
      content: '**🎭 Claim your roles below!**\n\n' +
               '**📋 Instructions:**\n' +
               '• Select from each menu to get your roles\n' +
               '• Click the same option again to remove the role\n' +
               '• You can change your roles anytime\n\n' +
               '**🔄 Categories:**\n' +
               '• **Identity** - who are u?\n' +
               '• **Age Range** - what\'s ur age?\n' +
               '• **Color Vibe** - favorite color?\n' +
               '• **Panfu Personality** - ur vibe?',
      components: [
        new ActionRowBuilder().addComponents(whoMenu),
        new ActionRowBuilder().addComponents(ageMenu),
        new ActionRowBuilder().addComponents(colorMenu),
        new ActionRowBuilder().addComponents(vibeMenu),
      ],
    });
  },
};
