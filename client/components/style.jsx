import styled from "styled-components";
import { View } from "react-native";
import Constants from 'expo-constants'
import { responsiveWidth, responsiveHeight, responsiveFontSize } from '../utils/responsive';
import { COLORS } from '../Color';

const StatusBarHeight = Constants.statusBarHeight;

export const StyleContainer= styled.View`
  flex:1;
  padding:${responsiveWidth(6)}px;
  padding-top: ${StatusBarHeight + responsiveHeight(2)}px;
  background-color: ${COLORS.primary};
`;

export const InnerContainer =styled.View`
  flex:1;
  width:100%;
  align-items: center;
`;

export const PageLogo = styled.Image`
  width: ${responsiveWidth(60)}px;
  height: ${responsiveHeight(25)}px;
`;

export const PageTitle = styled.Text`
  font-size:${responsiveFontSize(3.5)}px;
  text-align:center;
  font-weight: bold;
`;