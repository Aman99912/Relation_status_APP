// BackButton.js
import React from 'react';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; 
import { COLORS } from '../Color'; 

const BackButton = ({ navigation, style }) => {
  return (
    <TouchableOpacity 
      style={[{ position: 'absolute', top: 50, left: 20 }, style]} 
      onPress={() => navigation.goBack()}
    >
      <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
    </TouchableOpacity>
  );
};

export default BackButton;
