import { Task } from '../entity/Task';
import { NextFunction, Request, Response, Router } from 'express';

const router = Router();

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
	try {
		const userId = req.currentUser;
		const todos = await Task.find({ userId });
		res.status(200).json({ todos });
	} catch (error) {
		next(error.message);
	}
});

router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
	try {
		const { id } = req.params;
		const todo = await Task.findOne({ id: +id });
		res.status(200).json({ todo });
	} catch (error) {
		next(error.message);
	}
});

router.post('/', async (req: Request, res: Response, next: NextFunction) => {
	try {
		const { todo } = req.body;
		const userId = req.currentUser;
		const newTodo = await Task.create({
			todo,
			userId,
		}).save();
		res.status(201).json({ todo: newTodo });
	} catch (error) {
		next(error.message);
	}
});

router.put('/', async (req: Request, res: Response, next: NextFunction) => {
	try {
		const { id, todo, completed } = req.body;
		const userId = req.currentUser;
		const task = await Task.findOne({ id, userId });
		if (task) {
			if (todo) {
				task.todo = todo;
			}
			task.completed = completed;
			task.save();
			res.status(200).json({ task });
		} else {
			throw new Error('No todo found.');
		}
	} catch (error) {
		next(error.message);
	}
});

router.delete(
	'/:id',
	async (req: Request, res: Response, next: NextFunction) => {
		try {
			const { id } = req.params;
			const task = await Task.findOne({ id: +id });
			if (task) {
				task.remove();
				res.status(200).json({ message: 'Deleted' });
			} else {
				throw new Error('No todo found.');
			}
		} catch (error) {
			next(error.message);
		}
	},
);

export default router;
