interface TableHeader {
  name: string;
  key: string;
  isPercent?: boolean;
  hasURL?: boolean;
  textForURL?: string;
}

interface Aavev2 {
  symbol: string;
  frozen: string;
  paused: string;
  canCollateral: string;
  LTV: string;
  liqThereshold: string;
  liqBonus: string;
  reserveFactor: string;
  canBorrow: string;
  optimalUtilization: string;
  varBorrowRate: string;
  canBorrowStable: string;
  stableBorrowRate: string;
  shareOfStableRate: string;
  assetLink: string;
}

interface Aavev3 {
  symbol: string;
  frozen: string;
  paused: string;
  canCollateral: string;
  LTV: string;
  liqThereshold: string;
  liqBonus: string;
  reserveFactor: string;
  canBorrow: string;
  optimalUtilization: string;
  varBorrowRate: string;
  canBorrowStable: string;
  stableBorrowRate: string;
  shareOfStableRate: string;
  debtCeiling: string;
  supplyCap: string;
  borrowCap: string;
  eModeLtv: string;
  eModeLiquidationThereshold: string;
  eModeLiquidationBonus: string;
  assetLink: string;
}

interface Benqi {
  symbol: string;
  collateralFactor: string;
  reserveFactor: string;
  closeFactor: string;
  liquidationIncentive: string;
  assetLink?: string;
}

export type assetType = Aavev2 | Aavev3 | Benqi;

export type { Aavev2, Aavev3, Benqi, TableHeader };
