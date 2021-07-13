const TrophyProfileManager = require('./../../../../src/service/trophy/trophyProfileManager');

test('Extracts username from url', () => {
	expect(TrophyProfileManager.getPsnProfileByUrl('https://psnprofiles.com/trophies/11805-marvels-spider-man-miles-morales/NunoGamerHDYTs')).toBe('NunoGamerHDYTs');
});

test('Throw error on invalid urls', () => {
	expect(() => {
		TrophyProfileManager.getPsnProfileByUrl('https://psnprofiles.com/');
	}).toThrow(Error);
	expect(() => {
		TrophyProfileManager.getPsnProfileByUrl('https://psnprofiles.com/');
	}).toThrow('Profile url is invalid. Expected url: https://psnprofiles.com/game/PROFILE');
});
