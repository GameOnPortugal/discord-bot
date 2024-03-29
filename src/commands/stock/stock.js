const StockUrlManager = require('./../../service/stock/stockUrlManager');


module.exports = {
	name: 'stock',
	description: 'Submit a stock url or check if already exists',
	guildOnly: true,
	args: true,
	usage: 'Comando relacionado com stock. Os link submetidos é partilhado por todos!'
		+ '\nExemplos:'
		+ '\n'
		+ '\nUsa `|stock create url` - Cria um pedido para verificar e controlar stock de um determinado url'
		+ '\nUsa `|stock verify url` - Verifica o estado de um url e se já está a ser controlado ou nāo'
		+ '\nUsa `|stock alert url` - Envia um alerta geral para todos sobre stock para um determinado url (ABUSOS NĀO SERÃO TOLERADOS!)'
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
			case 'alert': {
				let stockUrl = await StockUrlManager.findByUrl(args[1]);
				if (!stockUrl) {
					// Missing url from stock, create it
					stockUrl = await StockUrlManager.create(message.author, args[1]);
				}

				try {
					await StockUrlManager.stockNotification(message, stockUrl);
				}
				catch (error) {
					console.error(error);
					await message.reply('@Josh_Lopes ocorreu um erro ao enviar o alerta!');
				}

				await message.reply('Alerta de stock enviado! Nāo voltem a enviar para o mesmo URL num curto espaço de tempo! Lembrem-se que há delays para canais gratuitos!');

				return;
			}
		}

		await message.reply('Comando inválido. Usa `|stock help` para saber como usar este comando!');
	},
};
