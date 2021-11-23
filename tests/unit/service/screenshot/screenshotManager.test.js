const ScreenshotManager = require('./../../../../src/service/screenshot/screenshotManager');

test('Extracts trophy data - old urls', async () => {
	expect.assertions(1);

	const result = await ScreenshotManager.generateMD5('https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_272x92dp.png');
	expect(result).toBe('80fa4bcab0351fdccb69c66fb55dcd00');
});

