import { Router, Response } from 'express';
import prisma from '../prisma';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();
router.use(authenticate);

function toSlug(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

async function uniqueSlug(base: string, excludeId?: string): Promise<string> {
  let slug = base;
  let i = 1;
  while (true) {
    const existing = await prisma.board.findUnique({ where: { slug } });
    if (!existing || existing.id === excludeId) return slug;
    slug = `${base}-${i++}`;
  }
}

// Resolve board by slug or id
async function resolveBoard(slugOrId: string) {
  return prisma.board.findFirst({
    where: { OR: [{ slug: slugOrId }, { id: slugOrId }] },
  });
}

async function hasAccess(slugOrId: string, userId: string): Promise<boolean> {
  const board = await prisma.board.findFirst({
    where: {
      OR: [{ slug: slugOrId }, { id: slugOrId }],
      AND: [{ OR: [{ ownerId: userId }, { members: { some: { userId } } }] }],
    },
  });
  return !!board;
}

// List boards accessible to user
router.get('/', async (req: AuthRequest, res: Response) => {
  const boards = await prisma.board.findMany({
    where: {
      OR: [{ ownerId: req.userId }, { members: { some: { userId: req.userId } } }],
    },
    include: {
      owner: { select: { id: true, name: true, email: true } },
      members: { include: { user: { select: { id: true, name: true, email: true } } } },
      columns: { include: { tasks: { select: { id: true } } } },
    },
    orderBy: { createdAt: 'desc' },
  });
  res.json(boards);
});

// Get single board with columns and tasks
router.get('/:slug', async (req: AuthRequest, res: Response): Promise<void> => {
  const { slug } = req.params as { slug: string };
  if (!(await hasAccess(slug, req.userId!))) {
    res.status(403).json({ error: 'Access denied' });
    return;
  }
  const board = await prisma.board.findFirst({
    where: { OR: [{ slug }, { id: slug }] },
    include: {
      owner: { select: { id: true, name: true, email: true } },
      members: { include: { user: { select: { id: true, name: true, email: true } } } },
      columns: {
        orderBy: { position: 'asc' },
        include: { tasks: { orderBy: { position: 'asc' } } },
      },
    },
  });
  res.json(board);
});

// Create board
router.post('/', async (req: AuthRequest, res: Response) => {
  const { title, slug: rawSlug } = req.body;
  const baseSlug = rawSlug?.trim() ? toSlug(rawSlug.trim()) : toSlug(title);
  const slug = await uniqueSlug(baseSlug);
  const board = await prisma.board.create({
    data: { title, slug, ownerId: req.userId! },
    include: { owner: { select: { id: true, name: true, email: true } }, members: true, columns: true },
  });
  res.status(201).json(board);
});

// Update board title/slug
router.put('/:slug', async (req: AuthRequest, res: Response): Promise<void> => {
  const { slug } = req.params as { slug: string };
  const board = await resolveBoard(slug);
  if (!board || board.ownerId !== req.userId) {
    res.status(403).json({ error: 'Access denied' });
    return;
  }
  const data: { title?: string; slug?: string } = {};
  if (req.body.title) data.title = req.body.title;
  if (req.body.slug) data.slug = await uniqueSlug(toSlug(req.body.slug), board.id);
  const updated = await prisma.board.update({ where: { id: board.id }, data });
  res.json(updated);
});

// Delete board
router.delete('/:slug', async (req: AuthRequest, res: Response): Promise<void> => {
  const { slug } = req.params as { slug: string };
  const board = await resolveBoard(slug);
  if (!board || board.ownerId !== req.userId) {
    res.status(403).json({ error: 'Access denied' });
    return;
  }
  await prisma.board.delete({ where: { id: board.id } });
  res.status(204).send();
});

// Share board with a user by email
router.post('/:slug/members', async (req: AuthRequest, res: Response): Promise<void> => {
  const { slug } = req.params as { slug: string };
  const board = await resolveBoard(slug);
  if (!board || board.ownerId !== req.userId) {
    res.status(403).json({ error: 'Only the owner can share this board' });
    return;
  }
  const target = await prisma.user.findUnique({ where: { email: req.body.email } });
  if (!target) { res.status(404).json({ error: 'User not found' }); return; }
  if (target.id === req.userId) { res.status(400).json({ error: 'Cannot share with yourself' }); return; }
  const member = await prisma.boardMember.upsert({
    where: { boardId_userId: { boardId: board.id, userId: target.id } },
    update: {},
    create: { boardId: board.id, userId: target.id },
    include: { user: { select: { id: true, name: true, email: true } } },
  });
  res.status(201).json(member);
});

// Remove member from board
router.delete('/:slug/members/:userId', async (req: AuthRequest, res: Response): Promise<void> => {
  const { slug, userId } = req.params as { slug: string; userId: string };
  const board = await resolveBoard(slug);
  if (!board || board.ownerId !== req.userId) {
    res.status(403).json({ error: 'Only the owner can remove members' });
    return;
  }
  await prisma.boardMember.deleteMany({ where: { boardId: board.id, userId } });
  res.status(204).send();
});

export default router;
