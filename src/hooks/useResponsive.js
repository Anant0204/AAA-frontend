import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

export const useResponsive = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  const isLaptop = useMediaQuery(theme.breakpoints.down('lg'));
  const isDesktop = useMediaQuery(theme.breakpoints.up('lg'));

  return {
    isMobile,
    isTablet,
    isLaptop,
    isDesktop,
  };
};

export default useResponsive;
