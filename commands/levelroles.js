const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const database = require('../utils/database');

module.exports = {
    name: 'levelroles',
    aliases: ['levelrole', 'rolelevel'],
    description: 'Manage level-based role assignments (Admin only)',
    usage: 'levelroles [set <level> <@role>] [list] [remove <level>]',

    async execute(message, args, client) {
        try {
            // Check if user has administrator permissions
            if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) {
                const noPermEmbed = new EmbedBuilder()
                    .setColor('#ff0000')
                    .setTitle('❌ Permission Denied')
                    .setDescription('You need **Administrator** permissions to manage level roles!')
                    .setTimestamp();
                return message.reply({ embeds: [noPermEmbed] });
            }

            if (!database) {
                const noDBEmbed = new EmbedBuilder()
                    .setColor('#ff0000')
                    .setTitle('❌ Database Not Available')
                    .setDescription('Level roles require database storage to function properly.')
                    .setTimestamp();
                return message.reply({ embeds: [noDBEmbed] });
            }

            const guildId = message.guild.id;
            const subcommand = args[0]?.toLowerCase();

            if (subcommand === 'set') {
                // Set a level role: !levelroles set 5 @Rising Panda
                const level = parseInt(args[1]);
                const roleId = message.mentions.roles.first()?.id;

                if (!level || level < 1 || level > 1000) {
                    const invalidLevelEmbed = new EmbedBuilder()
                        .setColor('#ff0000')
                        .setTitle('❌ Invalid Level')
                        .setDescription('Please provide a valid level between **1** and **1000**!')
                        .setTimestamp();
                    return message.reply({ embeds: [invalidLevelEmbed] });
                }

                if (!roleId) {
                    const noRoleEmbed = new EmbedBuilder()
                        .setColor('#ff0000')
                        .setTitle('❌ No Role Mentioned')
                        .setDescription('Please mention a role to assign for this level!\n\nExample: `!levelroles set 10 @Skilled Panda`')
                        .setTimestamp();
                    return message.reply({ embeds: [noRoleEmbed] });
                }

                const role = message.guild.roles.cache.get(roleId);
                if (!role) {
                    const roleNotFoundEmbed = new EmbedBuilder()
                        .setColor('#ff0000')
                        .setTitle('❌ Role Not Found')
                        .setDescription('The mentioned role could not be found!')
                        .setTimestamp();
                    return message.reply({ embeds: [roleNotFoundEmbed] });
                }

                // Set the level role in database
                const success = await database.setLevelRole(guildId, level, roleId, role.name);

                if (success) {
                    const embed = new EmbedBuilder()
                        .setColor(0x00ff00)
                        .setTitle('✅ Level Role Set')
                        .setDescription(`Users who reach **Level ${level}** will now receive the ${role} role!`)
                        .setTimestamp();

                    await message.reply({ embeds: [embed] });
                } else {
                    const failedEmbed = new EmbedBuilder()
                        .setColor('#ff0000')
                        .setTitle('❌ Failed to Set Level Role')
                        .setDescription('Something went wrong! Please try again.')
                        .setTimestamp();
                    await message.reply({ embeds: [failedEmbed] });
                }

            } else if (subcommand === 'list') {
                // List all level roles
                const levelRoles = await database.getLevelRoles(guildId);

                if (levelRoles.length === 0) {
                    const embed = new EmbedBuilder()
                        .setColor(0xffa500)
                        .setTitle('📋 Level Roles')
                        .setDescription('No level roles configured yet!')
                        .addFields({
                            name: '💡 Quick Setup',
                            value: 'Here are some suggested role levels:\n' +
                                   '`!levelroles set 1 @𝔫𝔢𝔴𝔟𝔦𝔢◡̈`\n' +
                                   '`!levelroles set 5 @𝔯𝔦𝔰𝔦𝔫𝔤 𝔰𝔢𝔯𝔳𝔢𝔯 𝔩𝔦𝔞𝔟𝔦𝔩𝔦𝔱𝔶 ོ☼𓂃`\n' +
                                   '`!levelroles set 10 @𝔰k𝔦𝔩𝔩𝔢𝔡 𝔭𝔦𝔫𝔤 𝔡𝔬𝔡𝔤𝔢𝔯🤺`\n' +
                                   '`!levelroles set 20 @𝔢𝔵𝔭𝔢𝔯𝔱 𝔟𝔞𝔪𝔟𝔬𝔬 𝔥𝔬𝔞𝔯𝔡𝔢𝔯•ﻌ•`\n' +
                                   '`!levelroles set 50 @𝔪𝔞𝔰𝔱𝔢𝔯 𝔱𝔶𝔭𝔬 𝔢𝔫𝔱𝔥𝔲𝔰𝔦𝔞𝔰𝔱☠︎︎`'
                        })
                        .setTimestamp();

                    return message.reply({ embeds: [embed] });
                }

                const roleList = levelRoles
                    .sort((a, b) => a.level - b.level)
                    .map(roleData => {
                        const role = message.guild.roles.cache.get(roleData.role_id);
                        const roleName = role ? role.toString() : `@${roleData.role_name} (deleted)`;
                        return `**Level ${roleData.level}:** ${roleName}`;
                    })
                    .join('\n');

                const embed = new EmbedBuilder()
                    .setColor(0x0099ff)
                    .setTitle('📋 Level Roles')
                    .setDescription(roleList)
                    .setFooter({ text: 'Use !levelroles set <level> <@role> to add more roles' })
                    .setTimestamp();

                await message.reply({ embeds: [embed] });

            } else if (subcommand === 'remove') {
                // Remove a level role: !levelroles remove 5
                const level = parseInt(args[1]);

                if (!level || level < 1) {
                    const invalidRemoveEmbed = new EmbedBuilder()
                        .setColor('#ff0000')
                        .setTitle('❌ Invalid Level')
                        .setDescription('Please provide a valid level to remove!')
                        .setTimestamp();
                    return message.reply({ embeds: [invalidRemoveEmbed] });
                }

                // Remove from database (we'll use a simple query since we don't have a remove function)
                try {
                    await database.pool.query(
                        'DELETE FROM level_roles WHERE guild_id = $1 AND level = $2',
                        [guildId, level]
                    );

                    const embed = new EmbedBuilder()
                        .setColor(0xff0000)
                        .setTitle('🗑️ Level Role Removed')
                        .setDescription(`Level ${level} role assignment has been removed.`)
                        .setTimestamp();

                    await message.reply({ embeds: [embed] });
                } catch (error) {
                    console.error('Error removing level role:', error);
                    const removeFailedEmbed = new EmbedBuilder()
                        .setColor('#ff0000')
                        .setTitle('❌ Failed to Remove Level Role')
                        .setDescription('Something went wrong! Please try again.')
                        .setTimestamp();
                    await message.reply({ embeds: [removeFailedEmbed] });
                }

            } else {
                // Show usage
                const embed = new EmbedBuilder()
                    .setColor(0x0099ff)
                    .setTitle('🎭 Level Roles Management')
                    .setDescription('Set up automatic role assignments based on user levels!')
                    .addFields(
                        {
                            name: '📝 Commands',
                            value: '`!levelroles list` - View all level roles\n' +
                                   '`!levelroles set <level> <@role>` - Set a role for a level\n' +
                                   '`!levelroles remove <level>` - Remove a level role',
                            inline: false
                        },
                        {
                            name: '💡 Example',
                            value: '`!levelroles set 10 @Skilled Panda`\n' +
                                   'Users who reach Level 10 will get the Skilled Panda role!',
                            inline: false
                        },
                        {
                            name: '⚠️ Important',
                            value: 'Make sure the bot has permission to assign the roles!\n' +
                                   'Bot roles must be higher than the roles being assigned.',
                            inline: false
                        }
                    )
                    .setTimestamp();

                await message.reply({ embeds: [embed] });
            }

        } catch (error) {
            console.error('Error in levelroles command:', error);
            const errorEmbed = new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle('🚫 Error')
                .setDescription('There was an error managing level roles! Please try again later.')
                .setTimestamp();
            await message.reply({ embeds: [errorEmbed] });
        }
    }
};