import { useEffect, useMemo, useState } from "react";
import initSdk, { SafeInfo, SdkInstance } from "@gnosis.pm/safe-apps-sdk";

import provider from "../config/provider";

/**
 * Initialises the Gnosis Apps Sdk.
 */
export function useAppsSdk(): [SdkInstance, SafeInfo | undefined] {
  const [safeInfo, setSafeInfo] = useState<SafeInfo>();

  const safeMultisigUrls: RegExp[] = useMemo(() => {
    const urls: RegExp[] = [];
    urls.push(/http:\/\/localhost:3000/);
    return urls;
  }, []);
  const [appsSdk] = useState<SdkInstance>(initSdk(safeMultisigUrls));

  /* For development purposes with local provider */
  useEffect(() => {
    if (process.env.NODE_ENV !== "production" && process.env.REACT_APP_LOCAL_WEB3_PROVIDER) {
      console.warn("SABLIER APP: you are using a local web3 provider");
      provider
        .getSigner()
        .getAddress()
        .then((address: string) => {
          setSafeInfo({
            safeAddress: address,
            network: "rinkeby",
            ethBalance: "0.99",
          });
        });
    }
  }, [setSafeInfo]);

  /* Config Safe connector */
  useEffect(() => {
    appsSdk.addListeners({
      onSafeInfo: setSafeInfo,
    });

    return () => appsSdk.removeListeners();
  }, [appsSdk]);

  return [appsSdk, safeInfo];
}

/**
 * Delays side effects declaratively
 * https://twitter.com/PaulRBerg/status/1199150020085342209
 */
/* eslint-disable-next-line @typescript-eslint/no-empty-function */
export function useEffectWithDelay(condition = false, func = () => {}, delay = 1000) {
  useEffect(() => {
    if (condition) {
      const timeout: number = setTimeout(func, delay);

      return () => {
        clearTimeout(timeout);
      };
    }
    return undefined;
  }, [condition, delay, func]);
}

export function useEffectWithDefaultDelay({ condition = false, func = () => {} }) {
  return useEffectWithDelay(condition, func, 250);
}
