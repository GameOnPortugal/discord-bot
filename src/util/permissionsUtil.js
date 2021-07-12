'use strict';

const PermissionsUtil = {
	/**
     * Returns whether or not a member is an admin
     *
     * @param {GuildMember} member
     *
     * @returns bool
     */
	isAdmin: async function(member) {
		return member.roles.cache.some(role => role.name === 'Admin');
	},

	/**
     * Returns whether or not a member is a moderator
     *
     * @param {GuildMember} member
     *
     * @returns bool
     */
	isModerator: async function(member) {
		return member.roles.cache.some(role => role.name === 'Moderator');
	},
};

module.exports = PermissionsUtil;
