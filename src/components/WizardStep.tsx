import React from 'react';
import { Paper, Typography, Box, Stepper, Step, StepLabel } from '@mui/material';

interface WizardStepProps {
  title: string;
  currentStep: number;
  children: React.ReactNode;
}

const steps = [
  'Original Loan Information',
  'Expected Early Payoff',
  'Purchase Details',
  'Results'
];

export const WizardStep: React.FC<WizardStepProps> = ({
  title,
  currentStep,
  children
}) => {
  return (
    <>
      <Stepper activeStep={currentStep} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
      
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          {title}
        </Typography>
        <Box>{children}</Box>
      </Paper>
    </>
  );
}; 