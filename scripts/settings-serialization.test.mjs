import assert from 'node:assert/strict';
import { buildUniversalSettingsPayload } from '../services/universalSettingsPayload.js';

const runConfig = {
  minAgents: 8,
  maxAgents: 12,
  maxMethodAgents: 4,
  forceExhaustion: false,
  minRounds: 1,
  maxRounds: 3,
  earlyStopDiminishingScore: 0.5,
  earlyStopNoveltyRatio: 0.2,
  earlyStopNewDomains: 1,
  earlyStopNewSources: 2,
};

const payload = buildUniversalSettingsPayload({
  provider: 'openai',
  runConfig,
  modelOverrides: { overseer_planning: 'gpt-4.1-mini', synthesis: 'gpt-4.1' },
  accessAllowlist: ['user@example.com', 'invalid-email'],
  apiKey: 'sk-test-should-not-leak',
  keys: { openai: 'sk-test-should-not-leak', google: 'AIza-test-should-not-leak' },
});

assert.equal(payload.provider, 'openai');
assert.deepEqual(payload.accessAllowlist, ['user@example.com']);
assert.ok(!('apiKey' in payload));
assert.ok(!('keys' in payload));

const serialized = JSON.stringify(payload);
assert.ok(!serialized.includes('sk-test-should-not-leak'));
assert.ok(!serialized.includes('AIza-test-should-not-leak'));

console.log('settings-serialization.test.mjs: ok');
