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

export default function FloatingInput({
  label,
  value,
  setValue,
  secure = false,
  numeric = false, // New prop for numeric input
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

  // Allow only numeric input if `numeric` prop is true
  const handleTextChange = (text) => {
    if (numeric) {
      // Remove non-numeric characters using regex
      const numericText = text.replace(/[^0-9]/g, '');
      setValue(numericText);
    } else {
      setValue(text);
    }
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
    color: focused ? '#4a90e2' : '#aaa',
    backgroundColor: '#fff',
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
        onChangeText={handleTextChange} // Updated handler
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder=""
        placeholderTextColor="#aaa"
        secureTextEntry={secure && !showPassword}
        keyboardType={numeric ? "numeric" : "default"} 
      />
      {secure && (
        <TouchableOpacity
          onPress={togglePasswordVisibility}
          style={styles.eyeButton}
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
    borderColor: '#ccc',
    paddingTop: 18,
    paddingBottom: 8,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
    borderRadius: 8,
    width: '95%',
    alignSelf: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
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
    color: '#333',
  },
  eyeButton: {
    position: 'absolute',
    right: 15,
    top: '50%',
    transform: [{ translateY: 1 }],
  },
});