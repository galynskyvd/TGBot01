const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const bodyParser = require('body-parser');
const {bot: {token, host, port}} = require('./config/options.json');
const API = require('./api');

const bot = new TelegramBot(token);
const app = express();

bot.setWebHook(`${host}/bot${token}`);

app.use(bodyParser.json());

app.post(`/bot${token}`, (req, res) => {
	bot.processUpdate(req.body);
	res.sendStatus(200);
});

app.listen(port, () => {
	console.log(`Express server is listening on ${port}`);
});

const messages = [
	'Привет. Ответьте на пару вопросов.',
	'Спасибо что ответили на наши вопросы. Хорошего дня!'
];

const getChat = msg => msg.hasOwnProperty('chat') ? msg.chat.id : msg.from.id;

const sendMessage = (msg, index) => {
	const message = messages[index];
	const chat = getChat(msg);

	bot.sendMessage(chat, message);
};

const sendNotify = (users, answers, first_name) => {
	const convertAnswers = answers.map(({title, message}, index) => (
		[`<b>${index + 1}. ${title}</b>\n${message}\n`]
	)).join('');

	const result = `
		<b>Новый отзыв</b>
		<b>Пользователь ${first_name} ответил на вопросы</b> 
		${convertAnswers}`;

	users.forEach(({user_id}) => {
		bot.sendMessage(user_id, result, {parse_mode: 'html'});
	});
};

const newQuestion = (msg, title) => {
	const chat = getChat(msg);

	bot.sendMessage(chat, title);
};

bot.on('message', async (msg) => {
	const {from: {id, first_name}, text} = msg;
	const {data: {status}} = await API.CHECK_USER(id);
	const {data: {index, is_done}} = await API.GET_INDEX(id);
	const {data: {title}} = await API.GET_QUESTION(index);

	if (!status) {
		await API.REGISTRATION_USER(id, first_name);
		await API.ADD_INDEX(id);
		sendMessage(msg, 0);
		newQuestion(msg, title);
	} else {
		if (is_done) {
			sendMessage(msg, 1);
		} else {
			if (title) {
				await API.ADD_ANSWER(id, index - 1, text);
				await API.UPDATE_INDEX(id, index + 1);
				newQuestion(msg, title);
			} else {
				await API.DONE_SURVEY(id);
				await API.ADD_ANSWER(id, index - 1, text);
				const {data: {users, answers}} = await API.GET_ANSWER(id);

				sendNotify(users, answers, first_name);
				sendMessage(msg, 1);
			}
		}
	}
});