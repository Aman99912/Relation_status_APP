import { Dimensions, PixelRatio } from 'react-native';

const { width, height } = Dimensions.get('window');

export const responsiveWidth = (w) => (width * w) / 100;
export const responsiveHeight = (h) => (height * h) / 100;
export const responsiveFontSize = (f) => Math.round(PixelRatio.roundToNearestPixel((width + height) / 2 * (f / 100))); 