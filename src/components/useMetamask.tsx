import React, { useContext } from "react";
import { useWeb3React } from "@web3-react/core";
import { UserRejectedRequestError } from "@web3-react/injected-connector";
import { useEffect, useState } from "react";
import { injected } from "../connectors";
import useENSName from "../hooks/useENSName";
import useMetaMaskOnboarding from "../hooks/useMetaMaskOnboarding";
import { formatEtherscanLink, shortenHex } from "../services/util";
import { GlobalContext } from "../contexts";

type AccountProps = {
    triedToEagerConnect: boolean;
};

const useMetamask = ({ triedToEagerConnect }: AccountProps) => {
    const { active, error, activate, chainId, account, setError } =
        useWeb3React();

    const {
        isMetaMaskInstalled,
        isWeb3Available,
        startOnboarding,
        stopOnboarding,
    } = useMetaMaskOnboarding();

    // manage connecting state for injected connector
    const [connecting, setConnecting] = useState(false);
    useEffect(() => {
        if (active || error) {
            setConnecting(false);
            stopOnboarding();
        }
    }, [active, error, stopOnboarding]);

    const ENSName = useENSName(account);

    const { metamaskAddress, setMetamaskAddress } = useContext(GlobalContext);
    setMetamaskAddress(ENSName || account ? `${shortenHex(account, 4)}` : null);

    if (error) {
        return { error: null };
    }

    if (!triedToEagerConnect) {
        return { triedToEagerConnect: null };
    }

    if (typeof account !== "string") {
        return {
            account: null,
            isWeb3Available,
            isMetaMaskInstalled,
            onClick: isWeb3Available
                ? () => {
                    setConnecting(true);

                    activate(injected, undefined, true).catch((error) => {
                        // ignore the error if it's a user rejected request
                        if (error instanceof UserRejectedRequestError) {
                            setConnecting(false);
                        } else {
                            setError(error);
                        }
                    });
                }
                : startOnboarding,
        };
    }

    const href = {
        href: formatEtherscanLink("Account", [chainId, account]),
        target: "_blank",
        rel: "noopener noreferrer",
    };
    const address = ENSName || `${shortenHex(account, 4)}`;

    return { href, address };
};

export default useMetamask;
