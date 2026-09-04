import { Router, Response } from 'express';
import prisma from '../prisma';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router({ mergeParams: true });
router.use(authenticate);

async function boardHasAccess(boardSlug: string, userId: string): Promise<boolean> {
  const board = await prisma.board.findFirst({
    where: {
      OR: [{ slug: boardSlug }, { id: boardSlug }],
      AND: [{ OR: [{ ownerId: userId }, { members: { some: { userId } } }] }],
    },
  });
  return !!board;
}

router.post('/', async (req: AuthRequest, res: Response): Promise<void> => {
  const { boardSlug, columnId } = req.params as { boardSlug: string; columnId: string };
  if (!(await boardHasAccess(boardSlug, req.userId!))) {
    res.status(403).json({ error: 'Access denied' });
    return;
  }
  const count = await prisma.task.count({ where: { columnId } });
  const task = await prisma.task.create({
    data: { title: req.body.title, description: req.body.description, priority: req.body.priority, dueDate: req.body.dueDate ? new Date(req.body.dueDate) : null, label: req.body.label, columnId, position: count },
  });
  res.status(201).json(task);
});

router.put('/:taskId', async (req: AuthRequest, res: Response): Promise<void> => {
  const { boardSlug, taskId } = req.params as { boardSlug: string; taskId: string };
  if (!(await boardHasAccess(boardSlug, req.userId!))) {
    res.status(403).json({ error: 'Access denied' });
    return;
  }
  const task = await prisma.task.update({
    where: { id: taskId },
    data: { title: req.body.title, description: req.body.description, priority: req.body.priority, dueDate: req.body.dueDate ? new Date(req.body.dueDate) : null, label: req.body.label },
  });
  res.json(task);
});

router.delete('/:taskId', async (req: AuthRequest, res: Response): Promise<void> => {
  const { boardSlug, columnId, taskId } = req.params as { boardSlug: string; columnId: string; taskId: string };
  if (!(await boardHasAccess(boardSlug, req.userId!))) {
    res.status(403).json({ error: 'Access denied' });
    return;
  }
  await prisma.task.delete({ where: { id: taskId } });
  const remaining = await prisma.task.findMany({ where: { columnId }, orderBy: { position: 'asc' } });
  await Promise.all(remaining.map((t: { id: string }, i: number) => prisma.task.update({ where: { id: t.id }, data: { position: i } })));
  res.status(204).send();
});

router.patch('/:taskId/move', async (req: AuthRequest, res: Response): Promise<void> => {
  const { boardSlug, taskId } = req.params as { boardSlug: string; taskId: string };
  const { targetColumnId, targetPosition } = req.body as { targetColumnId: string; targetPosition: number };

  if (!(await boardHasAccess(boardSlug, req.userId!))) {
    res.status(403).json({ error: 'Access denied' });
    return;
  }

  const task = await prisma.task.findUnique({ where: { id: taskId } });
  if (!task) { res.status(404).json({ error: 'Task not found' }); return; }

  const sourceColumnId = task.columnId;
  const isSameColumn = sourceColumnId === targetColumnId;

  await prisma.$transaction(async (tx: typeof prisma) => {
    if (isSameColumn) {
      const tasks = await tx.task.findMany({ where: { columnId: sourceColumnId }, orderBy: { position: 'asc' } });
      const reordered = tasks.filter((t: { id: string }) => t.id !== taskId);
      reordered.splice(targetPosition, 0, task);
      await Promise.all(reordered.map((t: { id: string }, i: number) => tx.task.update({ where: { id: t.id }, data: { position: i } })));
    } else {
      const sourceTasks = await tx.task.findMany({ where: { columnId: sourceColumnId }, orderBy: { position: 'asc' } });
      const newSource = sourceTasks.filter((t: { id: string }) => t.id !== taskId);
      await Promise.all(newSource.map((t: { id: string }, i: number) => tx.task.update({ where: { id: t.id }, data: { position: i } })));
      const targetTasks = await tx.task.findMany({ where: { columnId: targetColumnId }, orderBy: { position: 'asc' } });
      targetTasks.splice(targetPosition, 0, task);
      await Promise.all(
        targetTasks.map((t: { id: string }, i: number) =>
          tx.task.update({ where: { id: t.id }, data: { position: i, columnId: t.id === taskId ? targetColumnId : undefined } })
        )
      );
    }
  });

  const updated = await prisma.task.findUnique({ where: { id: taskId } });
  res.json(updated);
});

export default router;
