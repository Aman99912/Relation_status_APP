import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  Modal,
  TextInput,
  ScrollView,
  Animated,
  ActivityIndicator,
  Platform,
  Alert, // Added Alert for confirmation dialog
} from 'react-native';
import axios from 'axios';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { APIPATH } from '../utils/apiPath';
import { useNavigation } from '@react-navigation/native';
import CalendarNote from '../components/calender';
import { COLORS } from '../Color';

export default function DiaryScreen() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();
  const calendarHandle = () => navigation.navigate('MainApp', { screen: 'calendarScreen' });

  const [modalVisible, setModalVisible] = useState(false);
  const [detailEntry, setDetailEntry] = useState(null);
  const [fadeAnim] = useState(new Animated.Value(0));

  const [addingEntry, setAddingEntry] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newImages, setNewImages] = useState([]);

  const fetchEntries = async () => {
    const user_Id = await AsyncStorage.getItem('userId');
    try {
      setLoading(true);
      const Token = await AsyncStorage.getItem('Token');
      const { data } = await axios.get(`${APIPATH.BASE_URL}/${APIPATH.GETDIARY}?userID=${user_Id}`, {
        headers: {
          Authorization: `${Token}`,
        },
      });
      if (data.success) {
        setEntries(data.entries);
      } else {
        setEntries([]);
      }
    } catch (e) {
      console.error('Fetch entries error:', e);
      setEntries([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEntry = async (entryId) => {
    Alert.alert(
      "Delete Entry",
      "Are you sure you want to delete this diary entry?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Delete",
          onPress: async () => {
            try {
              setLoading(true);
              const Token = await AsyncStorage.getItem('Token');
              const { data } = await axios.delete(`${APIPATH.BASE_URL}/${APIPATH.DELETEDIARY}/${entryId}`, {
                headers: {
                  Authorization: `${Token}`,
                },
              });

              if (data.success) {
                Alert.alert('Success', 'Entry deleted successfully!');
                fetchEntries(); // Refresh the list after deletion
              } else {
                Alert.alert('Failed', data.message || 'Failed to delete entry.');
              }
            } catch (error) {
              console.error('Delete entry error:', error);
              Alert.alert('Error', error.response?.data?.message || 'An error occurred while deleting the entry.');
            } finally {
              setLoading(false);
            }
          },
          style: 'destructive'
        }
      ]
    );
  };

  useEffect(() => {
    fetchEntries();
  }, []);

  useEffect(() => {
    if (!modalVisible) {
      fetchEntries();
    }
  }, [modalVisible]);

  useEffect(() => {
    if (detailEntry) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }).start();
    } else {
      fadeAnim.setValue(0);
    }
  }, [detailEntry]);

  const pickImage = async () => {
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        alert('Permission to access gallery is required!');
        return;
      }
    }
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.6,
      allowsMultipleSelection: true,
    });

    if (!result.canceled) {
      const selected = result.assets ? result.assets : [result];
      setNewImages(prev => [...prev, ...selected.map(img => img.uri)]);
    }
  };

  const submitNewEntry = async () => {
    const user_Id = await AsyncStorage.getItem('userId');
    if (!newTitle.trim()) {
      alert('Please enter title');
      return;
    }
    try {
      setAddingEntry(true);
      const Token = await AsyncStorage.getItem('Token');
      const { data } = await axios.post(`${APIPATH.BASE_URL}/${APIPATH.ADDDIARY}`, {
        userId: user_Id,
        title: newTitle,
        description: newDescription,
        images: newImages,
      },
        {
          headers: {
            Authorization: `${Token}`,
          },
        });

      if (data.success) {
        setNewTitle('');
        setNewDescription('');
        setNewImages([]);
        setModalVisible(false);
      } else {
        alert('Failed to add entry');
      }
    } catch (err) {
      alert('Error adding entry: ' + err.message);
    } finally {
      setAddingEntry(false);
    }
  };

  const renderCard = ({ item }) => (
    <View
      style={[styles.card, { borderWidth: 1.5, borderColor: COLORS.diaryCardBorder, shadowColor: COLORS.diaryCardBorder, shadowOpacity: 0.10, shadowRadius: 10, elevation: 6 }]}
    >
      <TouchableOpacity
        style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}
        onPress={() => setDetailEntry(item)}
        activeOpacity={0.85}
      >
        <Image
          source={item.images && item.images.length > 0 ? { uri: item.images[0] } : require('../assets/male.png')}
          style={styles.cardImage}
        />
        <View style={styles.cardTextContainer}>
          <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
          <Text style={styles.cardDate}>{new Date(item.createdAt).toLocaleDateString()}</Text>
        </View>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.optionsButton}
        onPress={() => handleDeleteEntry(item._id)}
      >
        <FontAwesome name="trash" size={24} color={COLORS.primaryDark} />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.backgroundLight }}>
      {loading ? (
        <ActivityIndicator size="large" color={COLORS.primaryDark} style={{ marginTop: 30 }} />
      ) : (
        <FlatList
          data={entries}
          renderItem={renderCard}
          keyExtractor={item => item._id}
          contentContainerStyle={{ paddingBottom: 140, paddingTop: 10 }}
          ListEmptyComponent={<Text style={styles.emptyText}>No entries yet.</Text>}
          ListHeaderComponent={
            <>
              <CalendarNote />
              <View style={styles.container}>
                <Text style={{ fontSize: 22, fontWeight: '500', color: '#555', marginBottom: 10, letterSpacing: 0.2, textAlign: 'center' }}>Diary Journal</Text>
              </View>
            </>
          }
        />
      )}
      <Modal visible={!!detailEntry} animationType="fade" transparent>
        <Animated.View style={[styles.modalContainer, { opacity: fadeAnim }]}>
          <View style={styles.modalContent}>
            <ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              style={{ marginBottom: 20 }}
            >
              {detailEntry?.images?.length > 0 ? (
                detailEntry.images.map((img, i) => (
                  <Image key={i} source={{ uri: img }} style={styles.modalImage} />
                ))
              ) : (
                <Image source={require('../assets/male.png')} style={styles.modalImage} />
              )}
            </ScrollView>
            <Text style={styles.modalTitle}>{detailEntry?.title}</Text>
            <Text style={styles.modalDescription}>{detailEntry?.description || 'No description'}</Text>

            <TouchableOpacity style={styles.closeBtn} onPress={() => setDetailEntry(null)}>
              <Text style={styles.closeBtnText}>Close</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </Modal>
      <TouchableOpacity
        style={[styles.addButton, { backgroundColor: COLORS.addfriendbtn, width: '45%', shadowColor: COLORS.primary, position: 'absolute', bottom: 80, right: 15,  zIndex: 10 }]}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.85}
      >
        <Text style={styles.addButtonText}>+ Add Entry</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundLight,
    paddingHorizontal: 16,
    paddingTop: 32,
  },
  header: {
    fontSize: 32,
    fontWeight: '900',
    marginTop: -20,
    marginBottom: 10,
    color: COLORS.primaryDark,
    textAlign: 'center',
    textShadowColor: COLORS.diaryCardBorder,
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: COLORS.backgroundLight,
    borderRadius: 20,
    marginBottom: 16,
    padding: 16,
    shadowColor: COLORS.diaryModalShadow,
    shadowOpacity: 0.1,
    marginHorizontal: 15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 },
    elevation: 5,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.diaryCardBorder,
  },
  cardImage: {
    width: 90,
    height: 90,
    borderRadius: 16,
    backgroundColor: COLORS.lightGray,
  },
  cardTextContainer: {
    flex: 1,
    marginLeft: 16,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
  },
  cardDate: {
    fontSize: 14,
    color: COLORS.text,
    marginTop: 6,
    fontWeight: '500',
  },
  optionsButton: {
    padding: 8,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 40,
    fontSize: 16,
    color: COLORS.gray,
    fontStyle: 'italic',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: COLORS.modalOverlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 50,
  },
  modalContent: {
    backgroundColor: COLORS.diaryModalBg,
    borderRadius: 24,
    padding: 24,
    width: '90%',
    maxHeight: '85%',
    shadowColor: COLORS.diaryModalShadow,
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  modalImage: {
    width: 320,
    height: 230,
    borderRadius: 18,
    marginRight: 14,
    resizeMode: 'cover',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '800',
    marginTop: 14,
    color: COLORS.text,
  },
  modalDescription: {
    fontSize: 17,
    marginTop: 10,
    color: COLORS.text,
    fontWeight: '500',
  },
  closeBtn: {
    marginTop: 24,
    backgroundColor: COLORS.addfriendbtn,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
  },
  closeBtnText: {
    color: COLORS.text,
    fontWeight: '700',
    fontSize: 16,
  },
  addButton: {
    position: 'absolute',
    bottom: 90,
    right: 25,
    backgroundColor: COLORS.addfriendbtn,
    borderRadius: 50,
    paddingVertical: 18,
    paddingHorizontal: 30,
    elevation: 10,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.4,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  addButtonText: {
    color: "#fff",
    fontWeight: 'bold',
    fontSize: 18,
    letterSpacing: 0.5,
    textAlign: 'center',

  },
  addModalContainer: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  addModalContent: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 24,
  },
  addModalHeader: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.primaryDark,
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
    fontSize: 16,
    backgroundColor: COLORS.white,
    color: COLORS.textDark,
  },
  pickImageBtn: {
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 14,
    backgroundColor: COLORS.backgroundLight,
  },
  pickImageBtnText: {
    color: COLORS.primaryDark,
    fontWeight: '700',
    fontSize: 16,
  },
  thumbImage: {
    width: 70,
    height: 70,
    borderRadius: 14,
    marginRight: 14,
    backgroundColor: COLORS.lightGray,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 18,
  },
  modalActionBtn: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginHorizontal: 6,
    backgroundColor: COLORS.addfriendbtn,
  },
  saveBtn: {
    backgroundColor: COLORS.addfriendbtn,
  },
  cancelBtn: {
    backgroundColor: COLORS.addfriendbtn,
  },
  deleteBtn: {
    backgroundColor: COLORS.addfriendbtn,
  },
  modalActionText: {
    color: COLORS.text,
    fontWeight: '700',
    fontSize: 16,
  },
});