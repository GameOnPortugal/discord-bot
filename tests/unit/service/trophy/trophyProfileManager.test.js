const TrophyProfileManager = require('./../../../../src/service/trophy/trophyProfileManager');

test('Extracts username from trophy url', () => {
	expect(TrophyProfileManager.getPsnProfileByUrl('https://psnprofiles.com/trophies/11805-marvels-spider-man-miles-morales/NunoGamerHDYTs')).toBe('NunoGamerHDYTs');
});

test('Extracts username from profile', () => {
	expect(TrophyProfileManager.getPsnProfileByUrl('https://psnprofiles.com/Josh_Lopes')).toBe('Josh_Lopes');
});

test('Throw error on invalid urls', () => {
	expect(() => {
		TrophyProfileManager.getPsnProfileByUrl('https://psnprofiles.com/');
	}).toThrow(Error);
	expect(() => {
		TrophyProfileManager.getPsnProfileByUrl('https://psnprofiles.com/');
	}).toThrow('Profile url is invalid. Expected url: https://psnprofiles.com/trophies/game/PROFILE');
});
