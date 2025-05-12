import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import axios from 'axios';
import FloatingInput from './floatintext';
import { APIPATH } from '../utils/apiPath';
import AsyncStorage from '@react-native-async-storage/async-storage';


export default function AddUser() {
  const [generatedCode, setGeneratedCode] = useState('');
  const [inputCode, setInputCode] = useState('');
  const [isCodeGenerated, setIsCodeGenerated] = useState(false);

const handleGenerateCode = async () => {
  try {
    const email = await AsyncStorage.getItem('userEmail');
    console.log('Email from AsyncStorage:', email);

    const response = await axios.get(
      `${APIPATH.BASE_URL}/${APIPATH.GETDATA}/${email}`,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (response.status === 200) {
      setGeneratedCode(response.data.code); // Directly set the received code
      console.log(response.data.code);
      setIsCodeGenerated(false);
    } else {
      Alert.alert('Error', response.data.message || 'Something went wrong');
    }
  } catch (error) {
    console.error('Error during code generation:', error);
    Alert.alert('Error', 'Server error: ' + error.message);
  }
};


  return (
    <View style={styles.container}>
      <Text style={styles.title}>Generate Unique User Code</Text>

      <TouchableOpacity
        style={[styles.button, isCodeGenerated && styles.disabledButton]}
        onPress={handleGenerateCode}
        disabled={isCodeGenerated}
      >
        <Text style={styles.buttonText}>
          {isCodeGenerated ? 'Code Generated' : 'Code ID'}
        </Text>
      </TouchableOpacity>

      {generatedCode !== '' && (
        <TextInput
          style={styles.codeInput}
          value={generatedCode}
          editable={false}
          placeholder="Your Generated Code"
        />
      )}

      <Text style={styles.orText}>OR</Text>

      <FloatingInput
        style={styles.codeEntry}
        label="Already Have a Code?"
        value={inputCode}
        onChangeText={setInputCode}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 25,
    backgroundColor: '#f4f8ff',
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 20,
    color: '#333',
  },
  button: {
    backgroundColor: '#4a90e2',
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: 'center',
    marginBottom: 10,
  },
  disabledButton: {
    backgroundColor: '#a0a0a0',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  codeInput: {
    borderWidth: 1.5,
    borderColor: '#ccc',
    borderRadius: 12,
    padding: 12,
    marginTop: 10,
    backgroundColor: '#e6f0ff',
    color: '#333',
  },
  orText: {
    marginVertical: 20,
    textAlign: 'center',
    color: '#999',
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 10,
    color: '#444',
  },
  codeEntry: {
    borderWidth: 1.5,
    borderColor: '#ccc',
    borderRadius: 12,
    padding: 12,
    backgroundColor: '#fff',
  },
});
