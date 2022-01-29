import 'reflect-metadata';
require('dotenv-safe').config();
import express, {
	ErrorRequestHandler,
	NextFunction,
	Request,
	Response,
} from 'express';
import { createConnection, ConnectionOptions } from 'typeorm';
import cors from 'cors';
import axios from 'axios';
import createError from 'http-errors';
import { Task } from './entity/Task';
import { __PROD__ } from './contants';
import TodoController from './controller/todo';

(async () => {
	let config = {
		type: 'postgres',
		host: process.env.DB_HOST,
		port: 5432,
		username: process.env.DB_USERNAME,
		password: process.env.DB_PASSWORD,
		database: process.env.DB_NAME,
		synchronize: !__PROD__,
		logging: !__PROD__,
		migrationsRun: true,
		entities: [Task],
		migrations: ['src/migration/**/*.js'],
		subscribers: ['src/subscriber/**/*.js'],
		cli: {
			entitiesDir: 'src/entity',
			migrationsDir: 'src/migration',
			subscribersDir: 'src/subscriber',
		},
	} as ConnectionOptions;

	if (__PROD__) {
		config = {
			...config,
			ssl: true,
			extra: {
				ssl: {
					rejectUnauthorized: false,
				},
			},
		};
	}

	await createConnection(config).then(async () => {
		const app = express();
		app.use(cors({ origin: '*' }));
		app.use(express.json());

		app.use(async (req, _res, next) => {
			try {
				if (req.headers.authorization) {
					const refreshToken = req.headers.authorization.split(' ')[1];
					const { data } = await axios.post(
						`https://securetoken.googleapis.com/v1/token?key=${process.env.API}`,
						{
							grant_type: 'refresh_token',
							refresh_token: refreshToken,
						},
						{
							headers: {
								'Content-Type': 'application/json',
							},
						},
					);

					try {
						req.currentUser = data.user_id;

						next();
					} catch (error) {
						console.log(error);
						throw createError(401, error.message, { expired: true });
					}
				} else {
					throw createError(401, 'Authentication token unavailable', {
						expired: true,
					});
				}
			} catch (error) {
				next(error);
			}
		});

		app.use('/api/todo', TodoController);

		app.use(
			(
				error: ErrorRequestHandler,
				_req: Request,
				res: Response,
				_next: NextFunction,
			) => {
				res.status(500).json({ error });
				return;
			},
		);

		app.listen(process.env.PORT, () =>
			console.log(`Server started on ${process.env.PORT}`),
		);
	});
})();
