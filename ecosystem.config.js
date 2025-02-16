const dotenv = require('dotenv');
dotenv.config();

const siteName = process.env.PROJECT_NAME || 'Web Site';

module.exports = {
	apps: [
		{
			name: siteName,
			script: 'dist/app.js',
			log_date_format: 'YYYY-MM-DD HH:mm Z',
		},
	],
};
