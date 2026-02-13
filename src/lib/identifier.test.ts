import { getIdentifierInfo } from './identifier';

describe('Identifier Logic', () => {
    test('should identify Operator correctly', () => {
        const op = getIdentifierInfo('IDENTIFIED');
        expect(op.label).toBe('Operador');
        expect(op.color).toContain('blue');
    });

    test('should identify Client correctly', () => {
        const cl = getIdentifierInfo('QUICK');
        expect(cl.label).toBe('Cliente');
        expect(cl.color).toContain('green');
    });

    test('should identify Anonymous correctly', () => {
        const anon = getIdentifierInfo('UNIDENTIFIED');
        expect(anon.label).toBe('Anônimo');
        expect(anon.color).toContain('gray');
    });

    test('should handle unknown type as Anonymous', () => {
        const unknown = getIdentifierInfo('UNKNOWN_TYPE');
        expect(unknown.label).toBe('Anônimo');
    });
});
