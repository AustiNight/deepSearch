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
  keyOverrides: { openai: 'sk-test-should-not-leak', google: 'AIza-test-should-not-leak' },
  openDataConfig: {
    zeroCostMode: true,
    allowPaidAccess: true,
    featureFlags: {
      autoIngestion: true,
      evidenceRecovery: true,
      gatingEnforcement: true,
      usOnlyAddressPolicy: false
    },
    auth: {
      socrataAppToken: 'token-123',
      arcgisApiKey: 'AAPK-test-123'
    }
  }
});

assert.equal(payload.provider, 'openai');
assert.deepEqual(payload.accessAllowlist, ['user@example.com']);
assert.equal(payload.keyOverrides?.openai, 'sk-test-should-not-leak');
assert.equal(payload.keyOverrides?.google, 'AIza-test-should-not-leak');
assert.equal(payload.openDataConfig?.auth?.socrataAppToken, 'token-123');
assert.equal(payload.openDataConfig?.allowPaidAccess, false);

const serialized = JSON.stringify(payload);
assert.ok(serialized.includes('sk-test-should-not-leak'));
assert.ok(serialized.includes('AIza-test-should-not-leak'));
assert.ok(serialized.includes('token-123'));

const payloadWithoutAllowlist = buildUniversalSettingsPayload({
  provider: 'google',
  runConfig,
  modelOverrides: {},
});
assert.ok(!('accessAllowlist' in payloadWithoutAllowlist));

console.log('settings-serialization.test.mjs: ok');
