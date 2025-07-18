import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { responsiveWidth, responsiveHeight } from '../utils/responsive';

export default function Loader({ visible = true, overlay = true }) {
  if (!visible) return null;
  return (
    <View style={[styles.container, overlay && styles.overlay]}>
      <ActivityIndicator size="large" color="#ff98c3" style={{ width: responsiveWidth(10), height: responsiveWidth(10) }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { justifyContent: 'center', alignItems: 'center', flex: 1 },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.6)',
    zIndex: 999,
  },
}); 