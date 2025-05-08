import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Animated,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';

export default function FloatingInput({
  label,
  secure = false,
  value,
  setValue,
}) {
  const [focused, setFocused] = useState(false);
  const labelAnim = useRef(new Animated.Value(value ? 1 : 0)).current;
  const [showPassword, setShowPassword] = useState(true);

  useEffect(() => {
    Animated.timing(labelAnim, {
      toValue: focused || value ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [focused, value]);

  const labelStyle = {
    position: 'absolute',
    left: 12,
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
    <View style={styles.inputContainer}>
      <Animated.Text style={labelStyle}>{label}</Animated.Text>
      <TextInput
        value={value}
        onChangeText={setValue}
        style={styles.input}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        secureTextEntry={secure && showPassword}
      />
      {secure && (
        <TouchableOpacity
          onPress={() => setShowPassword(!showPassword)}
          style={styles.eyeIcon}
        >
          <Text style={{ fontSize: 24 }}>{showPassword ? '🙈' : '👁️'}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  inputContainer: {
    marginBottom: 25,
    position: 'relative',
    borderWidth: 2,
    // borderBottomWidth: 2,
    borderColor: '#ccc',
    paddingTop: 18,
    paddingBottom: 6,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
    borderRadius: 8,
    width:"95%",
  },
  input: {
    fontSize: 16,
    paddingVertical: 6,
    color: '#333',
  },
  eyeIcon: {
    position: 'absolute',

    right: 10,
    top: 14,
  },
});
