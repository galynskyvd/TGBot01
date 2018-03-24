const request = require('axios');
const {api: {host}} = require('../config/options.json');

const methods = {
	CHECK_USER: async userId => await request.post(`${host}/checkUser`, {userId}),
	REGISTRATION_USER: async (userId, firstName) => await request.post(`${host}/registrationUser`, {userId, firstName}),
	GET_INDEX: async userId => await request.post(`${host}/getIndex`, {userId}),
	ADD_INDEX: async userId => await request.post(`${host}/addIndex`, {userId}),
	UPDATE_INDEX: async (userId, index) => await request.post(`${host}/updateIndex`, {userId, index}),
	ADD_ANSWER: async (userId, index, message) => await request.post(`${host}/addAnswer`, {userId, index, message}),
	GET_ANSWER: async (userId) => await request.post(`${host}/getAnswer`, {userId}),
	DONE_SURVEY: async userId => await request.post(`${host}/doneSurvey`, {userId}),
	GET_QUESTION: async index => await request.post(`${host}/getQuestion`, {index})
};

module.exports = methods;