import { getIdentifierInfo } from './identifier';
import assert from 'assert';

console.log('Running Identifier Logic Tests...');

try {
    // Test Operator
    const op = getIdentifierInfo('IDENTIFIED');
    assert.strictEqual(op.label, 'Operador');
    assert.ok(op.color.includes('blue'), 'Operator should be blue');
    console.log('✅ Operator Test Passed');

    // Test Client
    const cl = getIdentifierInfo('QUICK');
    assert.strictEqual(cl.label, 'Cliente');
    assert.ok(cl.color.includes('green'), 'Client should be green');
    console.log('✅ Client Test Passed');

    // Test Anonymous
    const anon = getIdentifierInfo('UNIDENTIFIED');
    assert.strictEqual(anon.label, 'Anônimo');
    assert.ok(anon.color.includes('gray'), 'Anonymous should be gray');
    console.log('✅ Anonymous Test Passed');
    
    // Test Unknown
    const unknown = getIdentifierInfo('UNKNOWN_TYPE');
    assert.strictEqual(unknown.label, 'Anônimo');
    console.log('✅ Unknown Type Test Passed');

} catch (e) {
    console.error('❌ Test Failed:', e);
    process.exit(1);
}
