import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  Switch,
  FormControlLabel,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  SelectChangeEvent,
} from '@mui/material';
import {
  CalculatorInputs,
  CalculatorResults,
  PaymentFrequency,
  AmortizationRow,
  LoanInputs,
  PayoffInputs,
  PurchaseInputs,
} from '../types';
import { calculateResults, generateAmortizationTable } from '../utils/calculator';
import { TooltipTextField } from './TooltipTextField';
import { WizardStep } from './WizardStep';

const initialLoanInputs: LoanInputs = {
  faceValue: 0,
  annualInterestRate: 0,
  originalTerm: 30,
  paymentFrequency: 'Monthly',
  manualPayment: false,
  paymentAmount: 0,
};

const initialPayoffInputs: PayoffInputs = {
  payoffYears: 5,
  calculatedBalloon: 0,
};

const initialPurchaseInputs: PurchaseInputs = {
  purchasePrice: 0,
  purchaseDate: new Date().toISOString().split('T')[0],
};

const initialInputs: CalculatorInputs = {
  loanInputs: initialLoanInputs,
  payoffInputs: initialPayoffInputs,
  purchaseInputs: initialPurchaseInputs,
  currentStep: 0,
};

export const Calculator: React.FC = () => {
  const [inputs, setInputs] = useState<CalculatorInputs>(initialInputs);
  const [showAmortization, setShowAmortization] = useState(false);
  const [results, setResults] = useState<CalculatorResults>({
    monthlyPayment: 0,
    balloonAmount: 0,
    annualYield: 0,
    effectiveAnnualRate: 0,
    totalProfit: 0,
  });
  const [amortizationTable, setAmortizationTable] = useState<AmortizationRow[]>([]);
  const [error, setError] = useState<string | null>(null);

  const validateInputs = () => {
    const { loanInputs, payoffInputs, purchaseInputs } = inputs;

    if (loanInputs.faceValue <= 0) {
      setError('Face value must be greater than 0');
      return false;
    }
    if (loanInputs.annualInterestRate <= 0) {
      setError('Annual interest rate must be greater than 0');
      return false;
    }
    if (loanInputs.originalTerm <= 0) {
      setError('Original term must be greater than 0');
      return false;
    }
    if (loanInputs.manualPayment && loanInputs.paymentAmount <= 0) {
      setError('Payment amount must be greater than 0');
      return false;
    }
    if (payoffInputs.payoffYears <= 0) {
      setError('Payoff years must be greater than 0');
      return false;
    }
    if (purchaseInputs.purchasePrice <= 0) {
      setError('Purchase price must be greater than 0');
      return false;
    }
    return true;
  };

  useEffect(() => {
    try {
      if (validateInputs()) {
        const newResults = calculateResults(inputs);
        setResults(newResults);
        const table = generateAmortizationTable(inputs, newResults.annualYield / 100);
        setAmortizationTable(table);
        setError(null);
      }
    } catch (error) {
      console.error('Calculation error:', error);
      setError('Error in calculations. Please check your inputs.');
    }
  }, [inputs]);

  const handleInputChange = (
    section: 'loanInputs' | 'payoffInputs' | 'purchaseInputs',
    field: string
  ) => (
    event: React.ChangeEvent<HTMLInputElement | { value: unknown }> | SelectChangeEvent<PaymentFrequency>
  ) => {
    let value: string | number | boolean;
    
    if (field === 'paymentFrequency') {
      value = event.target.value as PaymentFrequency;
    } else if (field === 'manualPayment') {
      value = (event as React.ChangeEvent<HTMLInputElement>).target.checked;
    } else if (field === 'purchaseDate') {
      value = event.target.value as string;
    } else {
      value = Number(event.target.value);
    }

    setInputs((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  const handleNext = () => {
    setInputs((prev) => ({
      ...prev,
      currentStep: prev.currentStep + 1,
    }));
  };

  const handleBack = () => {
    setInputs((prev) => ({
      ...prev,
      currentStep: prev.currentStep - 1,
    }));
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatPercent = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'percent',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value / 100);
  };

  const renderStepContent = () => {
    switch (inputs.currentStep) {
      case 0:
        return (
          <WizardStep title="Original Loan Information" currentStep={inputs.currentStep}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TooltipTextField
                  fullWidth
                  label="Face Value of Loan"
                  type="number"
                  value={inputs.loanInputs.faceValue}
                  onChange={handleInputChange('loanInputs', 'faceValue')}
                  InputProps={{ startAdornment: '$' }}
                  tooltipText="The original or current outstanding principal amount of the loan"
                />
              </Grid>
              <Grid item xs={12}>
                <TooltipTextField
                  fullWidth
                  label="Annual Interest Rate (%)"
                  type="number"
                  value={inputs.loanInputs.annualInterestRate}
                  onChange={handleInputChange('loanInputs', 'annualInterestRate')}
                  tooltipText="The loan's contract interest rate per year"
                />
              </Grid>
              <Grid item xs={12}>
                <TooltipTextField
                  fullWidth
                  label="Original Term (Years)"
                  type="number"
                  value={inputs.loanInputs.originalTerm}
                  onChange={handleInputChange('loanInputs', 'originalTerm')}
                  tooltipText="The original (or remaining) term of the loan in years"
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Payment Frequency</InputLabel>
                  <Select<PaymentFrequency>
                    value={inputs.loanInputs.paymentFrequency}
                    onChange={handleInputChange('loanInputs', 'paymentFrequency') as (event: SelectChangeEvent<PaymentFrequency>) => void}
                    label="Payment Frequency"
                  >
                    <MenuItem value="Monthly">Monthly</MenuItem>
                    <MenuItem value="Quarterly">Quarterly</MenuItem>
                    <MenuItem value="Yearly">Yearly</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={inputs.loanInputs.manualPayment}
                      onChange={handleInputChange('loanInputs', 'manualPayment')}
                    />
                  }
                  label="Enter Payment Manually"
                />
              </Grid>
              {inputs.loanInputs.manualPayment && (
                <Grid item xs={12}>
                  <TooltipTextField
                    fullWidth
                    label="Payment Amount"
                    type="number"
                    value={inputs.loanInputs.paymentAmount}
                    onChange={handleInputChange('loanInputs', 'paymentAmount')}
                    InputProps={{ startAdornment: '$' }}
                    tooltipText="The fixed payment amount collected at each period"
                  />
                </Grid>
              )}
            </Grid>
          </WizardStep>
        );
      case 1:
        return (
          <WizardStep title="Expected Early Payoff" currentStep={inputs.currentStep}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TooltipTextField
                  fullWidth
                  label="Expected Payoff (Years)"
                  type="number"
                  value={inputs.payoffInputs.payoffYears}
                  onChange={handleInputChange('payoffInputs', 'payoffYears')}
                  tooltipText="How many years from now do you expect the borrower will pay off the loan"
                />
              </Grid>
              {results.balloonAmount > 0 && (
                <Grid item xs={12}>
                  <Typography variant="subtitle1" gutterBottom>
                    Expected Balloon Amount:
                  </Typography>
                  <Typography variant="h5" color="primary">
                    {formatCurrency(results.balloonAmount)}
                  </Typography>
                </Grid>
              )}
            </Grid>
          </WizardStep>
        );
      case 2:
        return (
          <WizardStep title="Purchase Details" currentStep={inputs.currentStep}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TooltipTextField
                  fullWidth
                  label="Purchase Price"
                  type="number"
                  value={inputs.purchaseInputs.purchasePrice}
                  onChange={handleInputChange('purchaseInputs', 'purchasePrice')}
                  InputProps={{ startAdornment: '$' }}
                  tooltipText="The amount you are paying to acquire the note at a discount"
                />
              </Grid>
              <Grid item xs={12}>
                <TooltipTextField
                  fullWidth
                  label="Purchase Date"
                  type="date"
                  value={inputs.purchaseInputs.purchaseDate}
                  onChange={handleInputChange('purchaseInputs', 'purchaseDate')}
                  InputLabelProps={{ shrink: true }}
                  tooltipText="The date when you plan to purchase the note"
                />
              </Grid>
            </Grid>
          </WizardStep>
        );
      case 3:
        return (
          <WizardStep title="Results" currentStep={inputs.currentStep}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle1">Monthly Payment:</Typography>
                <Typography variant="h5" color="primary">
                  {formatCurrency(results.monthlyPayment)}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle1">Balloon Amount:</Typography>
                <Typography variant="h5" color="primary">
                  {formatCurrency(results.balloonAmount)}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle1">Annual Yield (IRR):</Typography>
                <Typography variant="h5" color="primary">
                  {formatPercent(results.annualYield)}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle1">Effective Annual Rate:</Typography>
                <Typography variant="h5" color="primary">
                  {formatPercent(results.effectiveAnnualRate)}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle1">Total Profit:</Typography>
                <Typography variant="h4" color="primary">
                  {formatCurrency(results.totalProfit)}
                </Typography>
              </Grid>
            </Grid>
          </WizardStep>
        );
      default:
        return null;
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom align="center">
        Note Buying Calculator
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {renderStepContent()}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
        <Button
          disabled={inputs.currentStep === 0}
          onClick={handleBack}
          variant="outlined"
        >
          Back
        </Button>
        {inputs.currentStep === 3 ? (
          <Button
            variant="contained"
            onClick={() => setShowAmortization(!showAmortization)}
          >
            {showAmortization ? 'Hide' : 'Show'} Amortization Table
          </Button>
        ) : (
          <Button variant="contained" onClick={handleNext}>
            Next
          </Button>
        )}
      </Box>

      {showAmortization && inputs.currentStep === 3 && (
        <TableContainer component={Paper} sx={{ mt: 3 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Period</TableCell>
                <TableCell align="right">Starting Balance</TableCell>
                <TableCell align="right">Payment</TableCell>
                <TableCell align="right">Interest</TableCell>
                <TableCell align="right">Principal</TableCell>
                <TableCell align="right">Ending Balance</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {amortizationTable.map((row) => (
                <TableRow key={row.period}>
                  <TableCell>{row.period}</TableCell>
                  <TableCell align="right">{formatCurrency(row.startingBalance)}</TableCell>
                  <TableCell align="right">{formatCurrency(row.payment)}</TableCell>
                  <TableCell align="right">{formatCurrency(row.interestPortion)}</TableCell>
                  <TableCell align="right">{formatCurrency(row.principalPortion)}</TableCell>
                  <TableCell align="right">{formatCurrency(row.endingBalance)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Container>
  );
}; 