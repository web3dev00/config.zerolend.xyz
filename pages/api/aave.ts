import { NextApiRequest, NextApiResponse } from "next";
import { Contract, ethers } from "ethers";
import { UiPoolDataProvider } from "@aave/contract-helpers";
import { formatReserves } from "@aave/math-utils";
import dayjs from "dayjs";
import { compactNumber } from "../../utils/utils";

const chainIdToRPCProvider: Record<number, string> = {
  1: "https://eth-mainnet.alchemyapi.io/v2/demo",
  137: "https://polygon-rpc.com",
  43114: "https://api.avax.network/ext/bc/C/rpc",
  42161: "https://arb1.arbitrum.io/rpc",
  250: "https://rpc.ftm.tools",
  10: "https://optimism-mainnet.public.blastapi.io",
  1666600000: "https://api.harmony.one",
  1088: "https://andromeda.metis.io/?owner=1088",
  8453: "https://base-mainnet.public.blastapi.io",
  100: "https://gnosis-mainnet.public.blastapi.io",
  56: "https://bsc-mainnet.public.blastapi.io",
  534352: "https://scroll-mainnet.public.blastapi.io",
};

type configInterface = {
  chainId: string;
  marketName: string;
  protocol: string;
  lendingPoolAddressProvider: string;
  uiDataProvider: string;
  pool: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const config: configInterface = {
    chainId: req.query.chainId as string,
    marketName: req.query.marketName as string,
    protocol: req.query.protocol as string,
    lendingPoolAddressProvider: req.query.lendingPoolAddressProvider as string,
    uiDataProvider: req.query.uiDataProvider as string,
    pool: req.query.pool as string,
  };

  const currentTimestamp = dayjs().unix();

  const lendingPoolAddressProvider = config.lendingPoolAddressProvider;

  const chainId: number = parseInt(config.chainId, 10);

  const provider = new ethers.providers.StaticJsonRpcProvider(
    chainIdToRPCProvider[chainId],
    chainId
  );

  try {
    const poolDataProviderContract = new UiPoolDataProvider({
      uiPoolDataProviderAddress: config.uiDataProvider,
      provider,
      chainId,
    });

    let paused = false;
    if (config.protocol === "v2") {
      const abi = ["function paused() public view returns (bool)"];
      const poolContract = new Contract(config.pool, abi, provider);
      paused = await poolContract.paused();
    }

    const reserves = await poolDataProviderContract.getReservesHumanized({
      lendingPoolAddressProvider,
    });

    const formattedPoolReserves = formatReserves({
      reserves: reserves.reservesData,
      currentTimestamp,
      marketReferenceCurrencyDecimals:
        reserves.baseCurrencyData.marketReferenceCurrencyDecimals,
      marketReferencePriceInUsd:
        reserves.baseCurrencyData.marketReferenceCurrencyPriceInUsd,
    });

    const reservesArray = formattedPoolReserves.map((n) =>
      config.protocol === "v3"
        ? {
            symbol: n.symbol,
            frozen: n.isFrozen ? "True" : "False",
            paused: n.isPaused ? "True" : "False",
            canCollateral: n.usageAsCollateralEnabled ? "True" : "False",
            LTV: parseInt(n.baseLTVasCollateral) / 100 + "%",
            liqThereshold: parseInt(n.reserveLiquidationThreshold) / 100 + "%",
            liqBonus: parseInt(n.reserveLiquidationBonus.slice(-3)) / 100 + "%",
            reserveFactor: parseFloat(n.reserveFactor) * 100 + "%",
            canBorrow: n.borrowingEnabled ? "True" : "False",
            optimalUtilization:
              ((parseInt(n.optimalUsageRatio) / 10 ** 27) * 100).toFixed(0) +
              "%",
            varBorrowRate:
              (parseFloat(n.variableBorrowAPY) * 100).toFixed(2) + "%",
            canBorrowStable: n.stableBorrowRateEnabled ? "True" : "False",
            stableBorrowRate:
              (parseFloat(n.stableBorrowAPY) * 100).toFixed(2) + "%",
            shareOfStableRate:
              parseInt(n.totalDebtUSD) === 0 ||
              parseInt(n.totalStableDebtUSD) === 0
                ? "0%"
                : (
                    (parseInt(n.totalStableDebtUSD) /
                      parseInt(n.totalDebtUSD)) *
                    100
                  ).toFixed(2) + "%",
            isIsolated: n.debtCeiling === "0" ? "False" : "True",
            debtCeiling:
              n.debtCeiling === "0"
                ? "N/A"
                : compactNumber({ value: n.debtCeiling, visibleDecimals: 2 })
                    .prefix +
                  compactNumber({ value: n.debtCeiling, visibleDecimals: 2 })
                    .postfix,
            supplyCap:
              n.supplyCap === "0"
                ? "N/A"
                : compactNumber({ value: n.supplyCap, visibleDecimals: 2 })
                    .prefix +
                  compactNumber({ value: n.supplyCap, visibleDecimals: 2 })
                    .postfix,
            borrowCap:
              n.borrowCap === "0"
                ? "N/A"
                : compactNumber({ value: n.borrowCap, visibleDecimals: 2 })
                    .prefix +
                  compactNumber({ value: n.borrowCap, visibleDecimals: 2 })
                    .postfix,
            eModeLtv: n.eModeLtv / 100 + "%",
            eModeLiquidationThereshold: n.eModeLiquidationThreshold / 100 + "%",
            eModeLiquidationBonus:
              parseInt(n.eModeLiquidationBonus.toString().slice(-3)) / 100 +
              "%",
            borrowableInIsolation: n.borrowableInIsolation ? "True" : "False",
            flashloanEnabled: n.flashLoanEnabled ? "True" : "False",
            assetLink:
              "https://app.aave.com/reserve-overview/?underlyingAsset=" +
              n.id.slice(n.id.indexOf("-") + 1, n.id.lastIndexOf("-")) +
              "&marketName=" +
              config.marketName,
          }
        : {
            symbol: n.symbol,
            frozen: n.isFrozen ? "True" : "False",
            paused: paused ? "True" : "False",
            canCollateral: n.usageAsCollateralEnabled ? "True" : "False",
            LTV: parseInt(n.baseLTVasCollateral) / 100 + "%",
            liqThereshold: parseInt(n.reserveLiquidationThreshold) / 100 + "%",
            liqBonus: parseInt(n.reserveLiquidationBonus.slice(-3)) / 100 + "%",
            reserveFactor: parseFloat(n.reserveFactor) * 100 + "%",
            canBorrow: n.borrowingEnabled ? "True" : "False",
            optimalUtilization:
              ((parseInt(n.optimalUsageRatio) / 10 ** 27) * 100).toFixed(0) +
              "%",
            varBorrowRate:
              (parseFloat(n.variableBorrowAPY) * 100).toFixed(2) + "%",
            canBorrowStable: n.stableBorrowRateEnabled ? "True" : "False",
            stableBorrowRate:
              (parseFloat(n.stableBorrowAPY) * 100).toFixed(2) + "%",
            shareOfStableRate:
              parseInt(n.totalDebtUSD) === 0 ||
              parseInt(n.totalStableDebtUSD) === 0
                ? "0%"
                : (
                    (parseInt(n.totalStableDebtUSD) /
                      parseInt(n.totalDebtUSD)) *
                    100
                  ).toFixed(2) + "%",
            assetLink:
              "https://app.aave.com/reserve-overview/?underlyingAsset=" +
              n.id.slice(n.id.indexOf("-") + 1, n.id.lastIndexOf("-")) +
              "&marketName=" +
              config.marketName,
          }
    );

    res.status(200).json({ data: reservesArray });
  } catch (e) {
    console.log(e);
    res.status(500).json({ error: "failed to fetch data" });
  }
}
