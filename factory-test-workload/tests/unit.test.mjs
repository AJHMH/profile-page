import assert from 'node:assert/strict';
import test from 'node:test';
import { consumerMessage } from '../src/index.mjs';

test('the second workload identifies itself as a Factory consumer', () => {
	assert.equal(consumerMessage('profile-page'), 'Factory consumer: profile-page');
});
