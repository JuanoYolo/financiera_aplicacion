export const GMF_RATE = 0.004;

export function roundPesos(x: number): number { return Math.round(x); }
export function gmfFee(gross: number, exenta?: boolean): number { return exenta ? 0 : roundPesos(gross * GMF_RATE); }
export function netOut(gross: number, exenta?: boolean): number { return gross + gmfFee(gross, exenta); }
export function grossFromNetAvailable(net: number, exenta?: boolean): number { return exenta ? net : Math.floor(net / (1 + GMF_RATE)); }
export function grossToReachNet(net: number, exenta?: boolean): number { return exenta ? net : Math.ceil(net / (1 - GMF_RATE)); }

// Fallback para evitar problemas de cache/HMR con named exports
const GMF = { GMF_RATE, roundPesos, gmfFee, netOut, grossFromNetAvailable, grossToReachNet };
export default GMF;
