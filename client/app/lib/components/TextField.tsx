import { useState, forwardRef, ComponentProps } from 'react';
import {
  InputAdornment,
  TextField as MuiTextField,
  Typography,
  IconButton,
} from '@mui/material';
import { VisibilityOff, Visibility } from '@mui/icons-material';

type TextFieldProps = ComponentProps<typeof MuiTextField> & {
  description?: string;
};

const TextField = forwardRef<HTMLDivElement, TextFieldProps>(
  (props, ref): JSX.Element => {
    const { description, ...rest } = props;

    const [showPassword, setShowPassword] = useState(false);

    return (
      <div>
        <MuiTextField
          ref={ref}
          {...rest}
          {...(props.type === 'password' && {
            type: showPassword ? 'text' : 'password',
            InputProps: {
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={(): void => setShowPassword((state) => !state)}
                    onMouseDown={(e): void => e.preventDefault()}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            },
          })}
        />

        {description && (
          <Typography variant="body2" color="text.secondary">
            {description}
          </Typography>
        )}
      </div>
    );
  },
);

TextField.displayName = 'TextField';

export default TextField;
