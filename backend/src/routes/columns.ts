import { Router, Response } from 'express';
import prisma from '../prisma';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router({ mergeParams: true });
router.use(authenticate);

async function hasAccess(boardSlug: string, userId: string): Promise<boolean> {
  const board = await prisma.board.findFirst({
    where: {
      OR: [{ slug: boardSlug }, { id: boardSlug }],
      AND: [{ OR: [{ ownerId: userId }, { members: { some: { userId } } }] }],
    },
  });
  return !!board;
}

async function resolveBoardId(boardSlug: string): Promise<string | null> {
  const board = await prisma.board.findFirst({ where: { OR: [{ slug: boardSlug }, { id: boardSlug }] } });
  return board?.id ?? null;
}

router.post('/', async (req: AuthRequest, res: Response): Promise<void> => {
  const { boardSlug } = req.params as { boardSlug: string };
  if (!(await hasAccess(boardSlug, req.userId!))) {
    res.status(403).json({ error: 'Access denied' });
    return;
  }
  const boardId = (await resolveBoardId(boardSlug))!;
  const count = await prisma.column.count({ where: { boardId } });
  const column = await prisma.column.create({
    data: { title: req.body.title, boardId, position: count },
  });
  res.status(201).json(column);
});

router.put('/:columnId', async (req: AuthRequest, res: Response): Promise<void> => {
  const { boardSlug, columnId } = req.params as { boardSlug: string; columnId: string };
  if (!(await hasAccess(boardSlug, req.userId!))) {
    res.status(403).json({ error: 'Access denied' });
    return;
  }
  const column = await prisma.column.update({
    where: { id: columnId },
    data: { title: req.body.title },
  });
  res.json(column);
});

router.delete('/:columnId', async (req: AuthRequest, res: Response): Promise<void> => {
  const { boardSlug, columnId } = req.params as { boardSlug: string; columnId: string };
  if (!(await hasAccess(boardSlug, req.userId!))) {
    res.status(403).json({ error: 'Access denied' });
    return;
  }
  const boardId = (await resolveBoardId(boardSlug))!;
  await prisma.column.delete({ where: { id: columnId } });
  const remaining = await prisma.column.findMany({ where: { boardId }, orderBy: { position: 'asc' } });
  await Promise.all(remaining.map((c: { id: string }, i: number) => prisma.column.update({ where: { id: c.id }, data: { position: i } })));
  res.status(204).send();
});

export default router;
