import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  Animated,
  Platform,
  Pressable,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../Color';

export default function FloatingInput({
  label,
  value,
  setValue,
  secure = false,
  numeric = false, // New prop for numeric input
  ...rest // Spread all extra props to TextInput
}) {
  const [focused, setFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const labelAnim = useRef(new Animated.Value(value ? 1 : 0)).current;
  const inputRef = useRef(null);

  useEffect(() => {
    Animated.timing(labelAnim, {
      toValue: focused || value ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [focused, value]);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Directly set value for smooth typing; let parent handle any filtering
  const handleTextChange = (text) => {
    setValue(text);
  };

  const labelStyle = {
    position: 'absolute',
    left: 14,
    top: labelAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [18, -10],
    }),
    fontSize: labelAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [16, 12],
    }),
    color: focused ? COLORS.primary : COLORS.gray,
    backgroundColor: COLORS.white,
    paddingHorizontal: 4,
    zIndex: 10,
  };

  return (
    <View style={styles.inputWrapper}>
      <Pressable onPress={() => inputRef.current?.focus()} style={{ position: 'absolute', left: 14, right: 14 }}>
        <Animated.Text style={labelStyle}>{label}</Animated.Text>
      </Pressable>
      <TextInput
        ref={inputRef}
        style={[styles.input, { paddingRight: secure ? 40 : 10 }]}
        value={value}
        onChangeText={handleTextChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder=""
        placeholderTextColor={COLORS.gray}
        secureTextEntry={secure && !showPassword}
        keyboardType={numeric ? "numeric" : "default"}
        {...rest}
      />
      {secure && (
        <TouchableOpacity
          onPress={togglePasswordVisibility}
          style={styles.eyeButton}
          testID="eye-icon"
        >
          <Ionicons
            name={showPassword ? 'eye-off' : 'eye'}
            size={26}
            color="#aaa"
          />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  inputWrapper: {
    marginBottom: 25,
    position: 'relative',
    borderWidth: 1.5,
    borderBottomWidth: 2,
    borderTopWidth: 0,
    borderColor: COLORS.inputBorder,
    paddingTop: 18,
    paddingBottom: 8,
    paddingHorizontal: 10,
    backgroundColor: COLORS.white,
    borderRadius: 8,
    width: '95%',
    alignSelf: 'center',
    ...Platform.select({
      ios: {
        shadowColor: COLORS.cardShadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 6,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  input: {
    fontSize: 16,
    paddingVertical: 6,
    color: COLORS.text,
  },
  eyeButton: {
    position: 'absolute',
    right: 15,
    top: 18, // fixed value for better vertical alignment
    // Remove transform for more reliable positioning
  },
});