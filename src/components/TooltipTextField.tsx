import React from 'react';
import { TextField, TextFieldProps, Tooltip } from '@mui/material';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { InputAdornment } from '@mui/material';

interface TooltipTextFieldProps extends Omit<TextFieldProps, 'InputProps'> {
  tooltipText: string;
  InputProps?: TextFieldProps['InputProps'];
}

export const TooltipTextField: React.FC<TooltipTextFieldProps> = ({
  tooltipText,
  InputProps = {},
  ...props
}) => {
  return (
    <TextField
      {...props}
      InputProps={{
        ...InputProps,
        endAdornment: (
          <InputAdornment position="end">
            <Tooltip title={tooltipText} arrow placement="top">
              <HelpOutlineIcon color="action" fontSize="small" />
            </Tooltip>
          </InputAdornment>
        ),
      }}
    />
  );
}; 