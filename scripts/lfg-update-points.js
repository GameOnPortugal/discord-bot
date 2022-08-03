const LfgProfileManager = require('../src/service/lfg/lfgProfileManager');

(async () => {
	console.log('Updating LFG profiles...');
	await LfgProfileManager.updateLfgPoints();
})();