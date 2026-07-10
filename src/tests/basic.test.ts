import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import app from '../app';
import prisma from '../config/prisma';
import { calculateCashAtHand } from '../controllers/dashboard.controller';
import { validateAmountAgainstCashAtHand } from '../controllers/financial.controller';

function once(server: any, eventName: string): Promise<void> {
  return new Promise((resolve) => server.once(eventName, () => resolve()));
}

test('prisma client exposes the user model', () => {
  assert.equal(typeof prisma.user, 'object');
  assert.equal(typeof prisma.user.findFirst, 'function');
});

test('cash out is deducted from cash at hand', () => {
  assert.equal(calculateCashAtHand({ cash: 1000, expenses: 120, pending: 80, cashOut: 50 }), 750);
});

test('expenses and cash outs cannot exceed available cash at hand', () => {
  assert.equal(validateAmountAgainstCashAtHand(500, 600), true);
  assert.equal(validateAmountAgainstCashAtHand(700, 600), false);
});

test('public dashboard summary endpoint returns a successful payload', async () => {
  const server = createServer(app);
  server.listen(0);
  await once(server, 'listening');

  const address = server.address();
  const port = typeof address === 'object' && address ? address.port : 0;

  try {
    const response = await fetch(`http://127.0.0.1:${port}/api/v1/dashboard/summary`);
    const body = await response.json();

    assert.equal(response.status, 200);
    assert.equal(body.success, true);
    assert.equal(body.data.month, new Date().getMonth() + 1);
  } finally {
    server.close();
  }
});
