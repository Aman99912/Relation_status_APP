import styled from "styled-components";
import { View } from "react-native";
import Constants from 'expo-constants'
import { responsiveWidth, responsiveHeight, responsiveFontSize } from '../utils/responsive';

const StatusBarHeight = Constants.statusBarHeight;

export const colors= {
    primary: "#fff",
    secondary:"#E5E7EB",
    tertiary:"#1F2937",
    darkLight:"#6D28D9",
    brand:"#6D28D9",
    green:"#10B981",
    red:"#EF4444"

}
const {primary,secondary,tertiary,darkLight,brand,green,red} = colors;

export const StyleContainer= styled.View`
flex:1;
padding:${responsiveWidth(6)}px;
padding-top: ${StatusBarHeight + responsiveHeight(2)}px;
background-color: ${primary};
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