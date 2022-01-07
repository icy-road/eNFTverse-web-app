
const ETHERSCAN_PREFIXES = {
    1: "",
    338: "tCro."
};


export function formatEtherscanLink(
    type: "Account" | "Transaction",
    data: [number | undefined, string]
) {
    switch (type) {
        case "Account": {
            const [chainId, address] = data;
            // @ts-ignore
            return `https://${ETHERSCAN_PREFIXES[chainId]}etherscan.io/address/${address}`;
        }
        case "Transaction": {
            const [chainId, hash] = data;
            // @ts-ignore
            return `https://${ETHERSCAN_PREFIXES[chainId]}etherscan.io/tx/${hash}`;
        }
    }
}

export function shortenHex(hex: string, length = 4) {
    return `${hex.substring(0, length + 2)}…${hex.substring(
        hex.length - length
    )}`;
}