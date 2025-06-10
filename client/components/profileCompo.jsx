import React, { useEffect, useState } from 'react';
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
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import { COLORS } from '../Color';
import { APIPATH } from '../utils/apiPath';
import Icon from 'react-native-vector-icons/Feather';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';

const ProfileCompo = () => {
  const navigation = useNavigation();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [activeField, setActiveField] = useState('');
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [avatar, setAvatar] = useState('');
  const [resending, setResending] = useState(false);

  useEffect(() => {
    fetchUserData();
  }, []); 
 
  const fetchUserData = async () => {
    const storedEmail = await AsyncStorage.getItem('userEmail');
    if (!storedEmail) return Alert.alert('Error', 'User email not found');

    try {
      const res = await axios.get(`${APIPATH.BASE_URL}/api/user/email?email=${storedEmail}`);
      const data = res.data;
      setUser(data);
      setUsername(data.username || '');
      setBio(data.bio || '');
      setGender(data.gender || '');
      setAge(data.age ? String(data.age) : '');
      setEmail(data.email || '');
      setMobile(data.mobileNo || '');
      setAvatar(data.avatar || '');
    } catch (err) {
      Alert.alert('Error', 'Failed to fetch user data');
    } finally {
      setLoading(false);
    }
  };

  const pickAvatar = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      Alert.alert("Permission denied", "Camera roll access is required to select an avatar.");
      return;
    }

    const pickerResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.5,
      allowsEditing: true,
      aspect: [1, 1],
      base64: true,
    });

    if (!pickerResult.cancelled) {
      const base64Img = `data:image/jpeg;base64,${pickerResult.assets[0].base64}`;
      setAvatar(base64Img);
    }
  };

  const handleSave = async () => {
    if (!user?.id) return Alert.alert('Error', 'User ID missing');

    try {
      const payload = {
        username,
        email,
        mobile,
        bio,
        age: Number(age),
        avatar,
      };

      const token = await AsyncStorage.getItem('Token');
      await axios.put(`${APIPATH.BASE_URL}/api/user/update/${user.id}`, payload, {
        headers: { Authorization: ` ${token}` },
      });

      Alert.alert('Success', 'Profile updated successfully!');
      setEditMode(false);
      setActiveField('');
      fetchUserData();
    } catch (err) {
      console.log(err?.response?.data?.message);
      Alert.alert('Error', err?.response?.data?.message);
    }
  };

  const handleOtpUpdate = async (field) => {
    const contact = field === 'email' ? email : mobile;

    if (!contact) {
      Alert.alert('Error', `${field === 'email' ? 'Email' : 'Mobile number'} is missing`);
      return;
    }

    try {
      setResending(true);
      const endpoint = field === 'email' ? APIPATH.SEND_API : 'send-otp-mobile';
      const payload = field === 'email' ? { email: contact } : { mobile: contact };

      const res = await axios.post(`${APIPATH.BASE_URL}/${endpoint}`, payload);
      Alert.alert('OTP Sent', `A verification code has been sent to your ${field === 'email' ? 'email' : 'mobile number'}. Please verify to proceed.`);
    } catch (error) {
      console.error('Error sending OTP:', error);
      Alert.alert('Error', 'Failed to send OTP. Please try again later.');
    } finally {
      setResending(false);
    }
  };

  if (loading)
    return <ActivityIndicator size="large" color={COLORS.primary} style={{ flex: 1 }} />;

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <TouchableOpacity style={{ position: 'absolute', top: 50, left: 20 }} onPress={() => navigation.navigate('MainApp', { screen: 'Logout' })}>
        <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
      </TouchableOpacity>

      <View style={styles.header}>
        <Text style={styles.headerTitle}>User Profile</Text>
      </View>

      <View style={styles.profileContainer}>
        <TouchableOpacity onPress={editMode ? pickAvatar : null}>
          <Image source={avatar ? { uri: avatar } : require('../assets/avatar.png')} style={styles.profileImage} />
        </TouchableOpacity>

        <View style={styles.profileDetails}>
          <Text style={styles.profileName}>{user?.fullname || 'Unknown'}</Text>
          <TouchableOpacity
            style={[styles.editToggleButton, editMode && styles.editToggleButtonActive]}
            onPress={() => {
              setEditMode(!editMode);
              setActiveField('');
            }}
          >
            <Text style={[styles.editToggleText, editMode && styles.editToggleTextActive]}>
              {editMode ? 'Cancel Edit' : 'Edit Profile'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.infoTitle}>User Info</Text>

        <Field label="Username" value={username} editable={editMode && activeField === 'username'} onChange={setUsername} onEditIconPress={() => setActiveField('username')} showEditIcon={editMode} />
        <Field label="Bio" value={bio} editable={editMode && activeField === 'bio'} onChange={setBio} onEditIconPress={() => setActiveField('bio')} showEditIcon={editMode} multiline />
        <Field label="Age" value={age} editable={false} showEditIcon={false} />
        <Field label="Gender"  value={gender} editable={false} showEditIcon={false} />
        <Field
          label="Email"
          value={email}
          editable={false}
          trailing={
            <TouchableOpacity onPress={() => handleOtpUpdate('email')}>
              <Text style={styles.editOtp}>Update</Text>
            </TouchableOpacity>
          }
        />
        <Field
          label="Mobile"
          value={mobile}
          editable={false}
          trailing={
            <TouchableOpacity onPress={() => handleOtpUpdate('mobile')}>
              <Text style={styles.editOtp}>Update</Text>
            </TouchableOpacity>
          }
        />

        {editMode && (
          <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
            <Text style={styles.saveText}>Save Changes</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
};

const Field = ({
  label,
  value,
  editable,
  onChange,
  trailing,
  onEditIconPress,
  showEditIcon,
  multiline = false,
}) => (
  <View style={styles.infoRow}>
    <View style={styles.labelRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      {showEditIcon && onEditIconPress && (
        <TouchableOpacity
          onPress={onEditIconPress}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          style={styles.editIconTouchable}
        >
          <Icon name="edit" size={18} color={COLORS.primary} />
        </TouchableOpacity>
      )}
    </View>
    {editable && onChange ? (
      <TextInput
        value={value}
        onChangeText={onChange}
        style={[
          styles.input,
          multiline && { height: 80, textAlignVertical: 'top' },
          { borderBottomColor: COLORS.primary },
        ]}
        placeholder={`Enter ${label}`}
        placeholderTextColor="#999"
        autoFocus
        multiline={multiline}
        keyboardType={label === 'Age' || label === 'Mobile' ? 'number-pad' : 'default'}
      />
    ) : (
      <View style={styles.valueRow}>
        <Text style={styles.infoValue}>{value || '-'}</Text>
        {trailing}
      </View>
    )}
  </View>
);

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#f9f9f9',
    paddingVertical: 40,
    paddingHorizontal: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 22,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.primary,
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    marginBottom: 28,
    elevation: 6,
  },
  profileImage: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  profileDetails: {
    flex: 1,
    marginLeft: 20,
  },
  profileName: {
    fontSize: 26,
    fontWeight: '800',
    color: '#222',
    marginBottom: 12,
  },
  editToggleButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#EEE',
    paddingVertical: 10,
    paddingHorizontal: 36,
    borderRadius: 25,
  },
  editToggleButtonActive: {
    backgroundColor: COLORS.primary,
  },
  editToggleText: {
    color: '#555',
    fontSize: 16,
    fontWeight: '600',
  },
  editToggleTextActive: {
    color: '#fff',
  },
  infoContainer: {
    backgroundColor: '#fff',
    borderRadius: 15,
    paddingVertical: 28,
    paddingHorizontal: 22,
    elevation: 6,
  },
  infoTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 22,
    color: COLORS.primary,
    textAlign: 'center',
  },
  infoRow: {
    marginBottom: 20,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  infoLabel: {
    fontSize: 16,
    color: '#555',
    fontWeight: '600',
  },
  infoValue: {
    fontSize: 17,
    color: '#222',
  },
  valueRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  input: {
    borderBottomWidth: 2,
    fontSize: 17,
    paddingVertical: 8,
    color: '#222',
  },
  editOtp: {
    color: COLORS.primary,
    fontWeight: '700',
    fontSize: 15,
  },
  saveButton: {
    marginTop: 30,
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 30,
    elevation: 8,
  },
  saveText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: '700',
    fontSize: 18,
  },
  editIconTouchable: {
    padding: 6,
  },
});

export default ProfileCompo;
