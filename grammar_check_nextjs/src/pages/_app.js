import React from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

const theme = createTheme({
  palette: {
    primary: {
      main: '#795548', // Pencil brown color
    },
    background: {
      default: '#f5f5dc' // a crème color
    },
  },
  components: {
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          '&:hover $notchedOutline': {
            borderColor: '#795548', // Hover state in pencil brown
          },
          '&$focused $notchedOutline': {
            borderColor: '#795548', // Focus state in pencil brown
            borderWidth: '2px', // Make border thicker on focus if desired
          },
        },
        notchedOutline: {
          borderColor: '#ccc', // Default border color
        },
      },
    },
  },
  typography: {
    fontFamily: '"Patrick Hand", cursive', // Using the "Patrick Hand" font
  },
});

export default function MyApp({ Component, pageProps }) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />  {/* This helps with CSS baseline reset and applies background color */}
      <Component {...pageProps} />
    </ThemeProvider>
  );
}
