
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Alert,
  SafeAreaView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { COLORS } from '../Color'; // Assuming COLORS is defined in Color.js
import { APIPATH } from '../utils/apiPath'; // Assuming APIPATH is defined
import Icon from 'react-native-vector-icons/Feather'; // For edit icon
import * as ImagePicker from 'expo-image-picker'; // For avatar selection
import { Ionicons } from '@expo/vector-icons'; 

const ProfileCompo = () => {
  const navigation = useNavigation();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [activeField, setActiveField] = useState(''); // To manage which field is being edited
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [avatar, setAvatar] = useState('');

  useFocusEffect(
    useCallback(() => {
      fetchUserData();
    }, [])
  );

  const fetchUserData = async () => {
    const id = await AsyncStorage.getItem('userId');
    const Token = await AsyncStorage.getItem('Token');

    if (!id) {
      setLoading(false);
      return Alert.alert('Error', 'User ID not found. Please log in again.');
    }

    try {
      const res = await axios.get(`${APIPATH.BASE_URL}/api/user/id?id=${id}`, {
        headers: { Authorization: `${Token}` },
      });
      const data = res.data;
      setUser(data);
      setUsername(data.username || '');
      setBio(data.bio || '');
      setGender(data.gender || '');
      setAge(data.age ? String(data.age) : '');
      setAvatar(data.avatar || '');
    } catch (err) {
      console.error("Failed to fetch user data:", err);
      Alert.alert('Error', 'Failed to fetch user data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const pickAvatar = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert("Permission Denied", "Camera roll access is required to select an avatar.");
      return;
    }

    const pickerResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.3,
      allowsEditing: true,
      aspect: [1, 1],
      base64: true,
    });

    if (!pickerResult.canceled && pickerResult.assets && pickerResult.assets[0].base64) {
      const base64Img = pickerResult.assets[0].base64;
      const imageSizeInMB = (base64Img.length * 3) / (4 * 1024 * 1024);

      if (imageSizeInMB > 1) {
        Alert.alert("Image Too Large", "Please select an image smaller than 1MB.");
        return;
      }

      const formattedImage = `data:image/jpeg;base64,${base64Img}`;
      setAvatar(formattedImage);
    } else {
      console.log('Image selection cancelled or failed');
    }
  };

  const handleSave = async () => {
    if (!user?.id) return Alert.alert('Error', 'User ID missing');

    try {
      const payload = {
        username,
        bio,
        age: Number(age),
        avatar,
      };

      const token = await AsyncStorage.getItem('Token');
      await axios.put(
        `${APIPATH.BASE_URL}/api/user/update/${user.id}`,
        payload,
        {
          headers: {
            Authorization: `${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      Alert.alert('Success', 'Profile updated successfully!');
      setEditMode(false);
      setActiveField('');
      fetchUserData(); // Re-fetch user data to update the UI
    } catch (err) {
      const serverMsg = err?.response?.data?.message || 'Failed to update profile. Please try again.';
      Alert.alert('Error', serverMsg);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  return (
            <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.profileBg }}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={26} color={COLORS.primary} />
        </TouchableOpacity>

       
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Edit Profile</Text>
        </View>

        {/* Profile Image and Edit Toggle */}
        <View style={styles.profileHeader}>
          <TouchableOpacity onPress={editMode ? pickAvatar : null} activeOpacity={0.8}>
            <Image
              source={avatar ? { uri: avatar } : require('../assets/avatar.png')}
              style={styles.profileImage}
            />
            {editMode && (
              <View style={styles.cameraIcon}>
                <Ionicons name="camera" size={24} color="#fff" />
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.editToggleButton, editMode && styles.editToggleButtonActive]}
            onPress={() => {
              setEditMode(!editMode);
              setActiveField('');
            }}
            activeOpacity={0.8}
          >
            <Text style={[styles.editToggleText, editMode && styles.editToggleTextActive]}>
              {editMode ? 'Cancel Edit' : 'Edit Profile'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* User Info Fields */}
        <View style={styles.infoContainer}>
          <Text style={styles.sectionTitle}>Basic Information</Text>

          {[
            { label: 'Username', value: username, onChange: setUsername, editable: true, key: 'username' },
            { label: 'Bio', value: bio, onChange: setBio, editable: true, multiline: true, key: 'bio' },
            { label: 'Age', value: age, onChange: setAge, editable: true, key: 'age', keyboardType: 'number-pad' },
            { label: 'Gender', value: gender, onChange: setGender, editable: true, key: 'gender' },
          ].map((field) => (
            <View key={field.key} style={styles.cardBox}>
              <Field
                label={field.label}
                value={field.value}
                editable={editMode && activeField === field.key && field.editable}
                onChange={field.onChange}
                onEditIconPress={() => setActiveField(field.key)}
                showEditIcon={editMode && field.editable}
                multiline={field.multiline}
                keyboardType={field.keyboardType}
              />
            </View>
          ))}

          {editMode && (
            <TouchableOpacity onPress={handleSave} style={styles.saveButton} activeOpacity={0.8}>
              <Text style={styles.saveText}>Save Changes</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};


const Field = ({
  label,
  value,
  editable,
  onChange,
  onEditIconPress,
  showEditIcon,
  multiline = false,
  keyboardType = 'default',
}) => (
  <View style={styles.infoRow}>
    <View style={styles.labelRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      {showEditIcon && onEditIconPress && (
        <TouchableOpacity onPress={onEditIconPress} style={styles.editIconTouchable}>
          <Icon name="edit" size={20} color={COLORS.primary} />
        </TouchableOpacity>
      )}
    </View>
    {editable && onChange ? (
      <TextInput
        value={value}
        onChangeText={onChange}
        style={[styles.input, multiline && { height: 80, textAlignVertical: 'top' }]}
        placeholder={`Enter ${label}`}
        placeholderTextColor="#999"
        autoFocus
        multiline={multiline}
        keyboardType={keyboardType}
      />
    ) : (
      <Text style={styles.infoValue}>{value || '-'}</Text>
    )}
  </View>
);

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.profileBg,
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: '#666',
  },
  container: {
    flexGrow: 1,
    backgroundColor: COLORS.profileBg,
    paddingBottom: 90,
    paddingHorizontal: 20,
   
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 10,
    padding: 5,
  },
  header: {
    alignItems: 'center',
    marginTop: 50,
    marginBottom: 30,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: COLORS.white,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 30,
  },
  profileImage: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 4,
    borderColor: COLORS.primary,
    marginBottom: 20,
  },
  cameraIcon: {
    position: 'absolute',
    bottom: 20,
    right: 5,
    backgroundColor: COLORS.primary,
    borderRadius: 20,
    padding: 8,
    borderWidth: 2,
    borderColor: '#fff',
  },
  editToggleButton: {
    backgroundColor: COLORS.addfriendbtn,
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 25,
    marginTop: 10,
  },
  editToggleButtonActive: {
    backgroundColor: COLORS.primary,
  },
  editToggleText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
  editToggleTextActive: {
    color: '#fff',
  },
  infoContainer: {
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
  },
  cardBox: {
    backgroundColor: '#fff',
    padding: 18,
    borderRadius: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 5,
  },
  infoRow: {
    marginBottom: 10,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 15,
    color: COLORS.gray,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  infoValue: {
    fontSize: 17,
    color: COLORS.text,
    fontWeight: '500',
  },
  input: {
    borderBottomWidth: 1.5,
    borderColor: COLORS.primary,
    fontSize: 17,
    paddingVertical: 5,
    color: COLORS.text,
  },
  saveButton: {
    marginTop: 30,
    backgroundColor: COLORS.addfriendbtn,
    paddingVertical: 16,
    borderRadius: 30,
    elevation: 8,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  saveText: {
    color: COLORS.white,
    textAlign: 'center',
    fontWeight: '700',
    fontSize: 18,
  },
  editIconTouchable: {
    padding: 5,
  },
});

export default ProfileCompo;