// import React, { useState, useRef, useEffect } from 'react';
// import {
//   View,
//   TextInput,
//   StyleSheet,
//   Animated,
//   Platform,
// } from 'react-native';

// export default function FloatingInput({
//   label,
//   value,
//   setValue,
// }) {
//   const [focused, setFocused] = useState(false);
//   const labelAnim = useRef(new Animated.Value(value ? 1 : 0)).current;

//   useEffect(() => {
//     Animated.timing(labelAnim, {
//       toValue: focused || value ? 1 : 0,
//       duration: 200,
//       useNativeDriver: false,
//     }).start();
//   }, [focused, value]);

//   const labelStyle = {
//     position: 'absolute',
//     left: 14,
//     top: labelAnim.interpolate({
//       inputRange: [0, 1],
//       outputRange: [18, -10],
//     }),
//     fontSize: labelAnim.interpolate({
//       inputRange: [0, 1],
//       outputRange: [16, 12],
//     }),
//     color: focused ? '#4a90e2' : '#aaa',
//     backgroundColor: '#fff',
//     paddingHorizontal: 4,
//     zIndex: 10,
//   };

//   return (
//     <View style={styles.inputWrapper}>
//       <Animated.Text style={labelStyle}>{label}</Animated.Text>
//       <TextInput
//         style={styles.input}
//         value={value}
//         onChangeText={setValue}
//         onFocus={() => setFocused(true)}
//         onBlur={() => setFocused(false)}
//         placeholder=""
//         placeholderTextColor="#aaa"
//       />
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   inputWrapper: {
//     marginBottom: 25,
//     position: 'relative',
//     borderWidth: 1.5,
//     borderBottomWidth: 2,
//     borderTopWidth: 0,
//     borderColor: '#ccc',
//     paddingTop: 18,
//     paddingBottom: 8,
//     paddingHorizontal: 10,
//     backgroundColor: '#fff',
//     borderRadius: 8,
//     width: '95%',
//     alignSelf: 'center',

//     // Soft professional shadow
//     ...Platform.select({
//       ios: {
//         shadowColor: '#000',
//         shadowOffset: { width: 0, height: 2 },
//         shadowOpacity: 0.05,
//         shadowRadius: 6,
//       },
//       android: {
//         elevation: 2,
//       },
//     }),
//   },
//   input: {
//     fontSize: 16,
//     paddingVertical: 6,
//     color: '#333',
//   },
// });
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  Animated,
  Platform,
  Pressable,
} from 'react-native';

export default function FloatingInput({
  label,
  value,
  setValue,
}) {
  const [focused, setFocused] = useState(false);
  const labelAnim = useRef(new Animated.Value(value ? 1 : 0)).current;
  const inputRef = useRef(null); // Ref to access TextInput

  useEffect(() => {
    Animated.timing(labelAnim, {
      toValue: focused || value ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [focused, value]);

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
        style={styles.input}
        value={value}
        onChangeText={setValue}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder=""
        placeholderTextColor="#aaa"
      />
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
});
