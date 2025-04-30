import styled from "styled-components";
import { View } from "react-native";
import Constants from 'expo-constants'

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
padding:25px;
padding-top: ${StatusBarHeight +10}px;
background-color: ${primary};
`;

export const InnerContainer =styled.View`
flex:1;
width:100%;
align-items: center;

`;

export const PageLogo = styled.Image`
width: 250px;
height: 200px;
`;

export const PageTitle = styled.Text`
font-size:30px;
text-align:center;
font-weight: bold;

`