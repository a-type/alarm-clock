import { createMuiTheme } from '@material-ui/core';
import { ThemeOptions } from '@material-ui/core/styles/createMuiTheme';
import colors from './colors';
import { generateShadows } from './shadows';

const baseDarkPalette: ThemeOptions['palette'] = {
  type: 'dark',
  text: {
    primary: colors.white,
  },
  primary: {
    main: colors.bright,
  },
  secondary: {
    main: colors.dark,
  },
  background: {
    default: colors.black,
    paper: colors.trueBlack,
  },
};
const baseLightPalette: ThemeOptions['palette'] = {
  type: 'light',
  text: {
    primary: colors.black,
  },
  primary: {
    main: colors.black,
  },
  secondary: {
    main: colors.medium,
  },
  background: {
    default: colors.bright,
    paper: colors.white,
  },
};

const { palette: lightPalette, breakpoints } = createMuiTheme({
  palette: baseLightPalette,
});
const { palette: darkPalette } = createMuiTheme({ palette: baseDarkPalette });

const headingSettings = {
  fontFamily: '"EB Garamond", serif',
};

const themeFactory = (
  palette: ThemeOptions['palette'],
  shadows: ThemeOptions['shadows'],
) =>
  createMuiTheme({
    palette,
    shape: {},
    shadows,
    typography: {
      fontFamily: 'Montserrat, sans-serif',
      fontSize: 16,
      h1: headingSettings,
      h2: headingSettings,
      h3: headingSettings,
      h4: headingSettings,
      h5: headingSettings,
      h6: headingSettings,
      body1: {
        fontFamily: 'Montserrat, sans-serif',
      },
      body2: {
        fontFamily: 'Montserrat, sans-serif',
      },
    },
    overrides: {
      MuiAppBar: {
        colorDefault: {
          backgroundColor: 'transparent',
        },
      },
      MuiButton: {
        root: {
          textTransform: 'capitalize',
        },
      },
      MuiTypography: {
        h1: {
          [breakpoints.down('sm')]: {
            fontSize: '5vmax',
          },
        },
        h2: {
          [breakpoints.down('sm')]: {
            fontSize: '4vmax',
          },
        },
        h3: {
          [breakpoints.down('sm')]: {
            fontSize: '3.75vmax',
          },
        },
        h4: {
          [breakpoints.down('sm')]: {
            fontSize: '3.3vmax',
          },
        },
      },
    },
    props: {
      MuiTextField: {
        variant: 'outlined',
      },
      MuiButton: {
        color: 'primary',
      },
      MuiLink: {
        underline: 'always',
      },
    },
  });

export const lightTheme = themeFactory(lightPalette, generateShadows());
export const darkTheme = themeFactory(
  darkPalette,
  generateShadows(colors.blackRgb, colors.trueBlackRgb),
);
