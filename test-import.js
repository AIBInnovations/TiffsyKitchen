try {
  const sub = require('./src/modules/subscriptions/index.ts');
  console.log('Import successful!');
  console.log('Exports:', Object.keys(sub));
  console.log('SubscriptionsScreen type:', typeof sub.SubscriptionsScreen);
} catch (e) {
  console.error('Import failed:', e.message);
}
