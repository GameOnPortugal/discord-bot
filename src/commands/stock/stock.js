const StockUrlManager = require('./../../service/stock/StockUrlManager');


module.exports = {
	name: 'stock',
	description: 'Submit a stock url or check if already exists',
	guildOnly: true,
	args: true,
	usage: 'Submete um URL para controlo de stock ou verifica se um já existe!'
		+ '\nExemplos:'
		+ '\n'
		+ '\nUsa `|stock create url` - Cria um pedido para verificar e controlar stock de um determinado url'
		+ '\nUsa `|stock verify url` - Verifica o estado de um url e se já está a ser controlado ou nāo'
		+ '\nUsa `|stock help` - Instruções em como usar o comando',
	async execute(message, args) {
		if (args.length < 2) {
			await message.reply('Comand inválido. Usa `stock help` para saber como usar este comando!');

			return;
		}

		switch (args[0]) {
			case 'create': {
				let stockUrl = await StockUrlManager.findByUrl(args[1]);
				if (stockUrl) {
					await message.reply('Esse url já existe! Usa o `|stock verify url` para validar o estado dele!');

					return;
				}

				stockUrl = await StockUrlManager.create(message.author, args[1]);
				await message.reply('O teu url foi submetido com sucesso e será verificado dentre de algumas horas!');

				return;
			}
			case 'verify': {
				const stockUrl = await StockUrlManager.findByUrl(args[1]);
				if (!stockUrl) {
					await message.reply('Esse url nāo existe. Usa `|stock create url` para criares um pedido para ser verificado!');
				}

				await message.reply('Esse link existe e está **' + (stockUrl.is_validated ? 'validado!' : 'por validar!') + '**');

				return;
			}
		}

		await message.reply('Comando inválido. Usa `|stock help` para saber como usar este comando!');
	},
};
