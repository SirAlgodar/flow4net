export const getIdentifierInfo = (type: string) => {
    switch (type) {
        case 'IDENTIFIED':
            return { label: 'Operador', color: 'bg-blue-100 text-blue-800 border-blue-200' };
        case 'QUICK':
            return { label: 'Cliente', color: 'bg-green-100 text-green-800 border-green-200' };
        default:
            return { label: 'Anônimo', color: 'bg-gray-100 text-gray-800 border-gray-200' };
    }
};
