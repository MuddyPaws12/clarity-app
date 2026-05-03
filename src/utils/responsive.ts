import { useWindowDimensions } from 'react-native';

export function useResponsive() {
  const { width, height } = useWindowDimensions();
  
  const isTablet = width >= 768;
  const isLargeTablet = width >= 1024;
  
  const isMobile = !isTablet;
  const isPortrait = height > width;
  const isLandscape = !isPortrait;
  
  return {
    width,
    height,
    isTablet,
    isLargeTablet,
    isMobile,
    isPortrait,
    isLandscape,
  };
}

export function getScaledSize(mobileSize: number, tabletSize: number, isTablet: boolean) {
  return isTablet ? tabletSize : mobileSize;
}

export function getResponsivePadding(isTablet: boolean) {
  return {
    horizontal: isTablet ? 24 : 16,
    vertical: isTablet ? 16 : 12,
  };
}
