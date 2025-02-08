import { CalculatorInputs, CalculatorResults, PaymentFrequency, AmortizationRow } from '../types';

const getPeriodsPerYear = (frequency: PaymentFrequency): number => {
  switch (frequency) {
    case 'Monthly':
      return 12;
    case 'Quarterly':
      return 4;
    case 'Yearly':
      return 1;
  }
};

const calculateMonthlyPayment = (
  faceValue: number,
  annualRate: number,
  termYears: number,
  periodsPerYear: number
): number => {
  const periodicRate = annualRate / (100 * periodsPerYear);
  const totalPeriods = termYears * periodsPerYear;
  
  return (
    (faceValue * periodicRate * Math.pow(1 + periodicRate, totalPeriods)) /
    (Math.pow(1 + periodicRate, totalPeriods) - 1)
  );
};

const calculateRemainingBalance = (
  faceValue: number,
  payment: number,
  annualRate: number,
  periodsElapsed: number,
  periodsPerYear: number
): number => {
  const periodicRate = annualRate / (100 * periodsPerYear);
  return (
    faceValue * Math.pow(1 + periodicRate, periodsElapsed) -
    (payment * (Math.pow(1 + periodicRate, periodsElapsed) - 1)) / periodicRate
  );
};

const calculateIRR = (cashFlows: number[], periodsPerYear: number): number => {
  let guess = 0.1;
  const maxIterations = 100;
  const tolerance = 0.00001;

  for (let i = 0; i < maxIterations; i++) {
    let npv = 0;
    let derivativeNpv = 0;

    for (let j = 0; j < cashFlows.length; j++) {
      const factor = Math.pow(1 + guess, j);
      npv += cashFlows[j] / factor;
      if (j > 0) {
        derivativeNpv -= (j * cashFlows[j]) / Math.pow(1 + guess, j + 1);
      }
    }

    const newGuess = guess - npv / derivativeNpv;
    if (Math.abs(newGuess - guess) < tolerance) {
      // Convert to annual rate
      const monthlyRate = newGuess;
      const effectiveAnnual = Math.pow(1 + monthlyRate, periodsPerYear) - 1;
      return effectiveAnnual;
    }
    guess = newGuess;
  }

  throw new Error('IRR calculation did not converge');
};

export const calculateResults = (inputs: CalculatorInputs): CalculatorResults => {
  const { loanInputs, payoffInputs, purchaseInputs } = inputs;
  const periodsPerYear = getPeriodsPerYear(loanInputs.paymentFrequency);
  
  // Calculate or use provided monthly payment
  const monthlyPayment = loanInputs.manualPayment
    ? loanInputs.paymentAmount
    : calculateMonthlyPayment(
        loanInputs.faceValue,
        loanInputs.annualInterestRate,
        loanInputs.originalTerm,
        periodsPerYear
      );
  
  // Calculate balloon amount
  const totalPayoffPeriods = payoffInputs.payoffYears * periodsPerYear;
  const balloonAmount = calculateRemainingBalance(
    loanInputs.faceValue,
    monthlyPayment,
    loanInputs.annualInterestRate,
    totalPayoffPeriods,
    periodsPerYear
  );
  
  // Prepare cash flows for IRR calculation
  const cashFlows = [-purchaseInputs.purchasePrice];
  for (let i = 0; i < totalPayoffPeriods; i++) {
    cashFlows.push(monthlyPayment);
  }
  cashFlows[cashFlows.length - 1] += balloonAmount;
  
  // Calculate IRR and effective annual rate
  const annualYield = calculateIRR(cashFlows, periodsPerYear) * 100;
  const effectiveAnnualRate = (Math.pow(1 + annualYield / 100 / periodsPerYear, periodsPerYear) - 1) * 100;
  
  // Calculate total profit
  const totalInflows = monthlyPayment * totalPayoffPeriods + balloonAmount;
  const totalProfit = totalInflows - purchaseInputs.purchasePrice;
  
  return {
    monthlyPayment,
    balloonAmount,
    annualYield,
    effectiveAnnualRate,
    totalProfit
  };
};

export const generateAmortizationTable = (
  inputs: CalculatorInputs,
  annualRate: number
): AmortizationRow[] => {
  const { loanInputs, payoffInputs } = inputs;
  const periodsPerYear = getPeriodsPerYear(loanInputs.paymentFrequency);
  const totalPeriods = payoffInputs.payoffYears * periodsPerYear;
  const periodicRate = annualRate / (periodsPerYear * 100);
  
  const table: AmortizationRow[] = [];
  let balance = loanInputs.faceValue;
  const payment = loanInputs.manualPayment
    ? loanInputs.paymentAmount
    : calculateMonthlyPayment(
        loanInputs.faceValue,
        loanInputs.annualInterestRate,
        loanInputs.originalTerm,
        periodsPerYear
      );
  
  for (let period = 1; period <= totalPeriods; period++) {
    const startingBalance = balance;
    const interestPortion = balance * periodicRate;
    const principalPortion = payment - interestPortion;
    balance -= principalPortion;
    
    // Handle last payment with balloon
    const isLastPeriod = period === totalPeriods;
    const finalPayment = isLastPeriod ? payment + balance : payment;
    const endingBalance = isLastPeriod ? 0 : balance;
    
    table.push({
      period,
      startingBalance,
      payment: finalPayment,
      interestPortion,
      principalPortion: finalPayment - interestPortion,
      endingBalance
    });
  }
  
  return table;
}; 