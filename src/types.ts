export type PaymentFrequency = 'Monthly' | 'Quarterly' | 'Yearly';
export type PaymentTiming = 'End' | 'Beginning';

export interface LoanInputs {
  faceValue: number;
  annualInterestRate: number;
  originalTerm: number;
  paymentFrequency: PaymentFrequency;
  manualPayment: boolean;
  paymentAmount: number;
}

export interface PayoffInputs {
  payoffYears: number;
  calculatedBalloon: number;
}

export interface PurchaseInputs {
  purchasePrice: number;
  purchaseDate: string;
}

export interface CalculatorInputs {
  loanInputs: LoanInputs;
  payoffInputs: PayoffInputs;
  purchaseInputs: PurchaseInputs;
  currentStep: number;
}

export interface CalculatorResults {
  monthlyPayment: number;
  balloonAmount: number;
  annualYield: number;
  effectiveAnnualRate: number;
  totalProfit: number;
}

export interface AmortizationRow {
  period: number;
  startingBalance: number;
  payment: number;
  interestPortion: number;
  principalPortion: number;
  endingBalance: number;
} 