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
} from 'react-native';
import axios from 'axios';
import * as ImagePicker from 'expo-image-picker';
import { COLORS } from '../Color'; // Your color constants
import { APIPATH } from '../utils/apiPath';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function DiaryScreen() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);
  const [detailEntry, setDetailEntry] = useState(null);
  const [fadeAnim] = useState(new Animated.Value(0));

  // Add Entry states
  const [addingEntry, setAddingEntry] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newImages, setNewImages] = useState([]);

  const fetchEntries = async () => {
    const user_Id = await AsyncStorage.getItem('userId');
    try {
      setLoading(true);
      const { data } = await axios.get(`${APIPATH.BASE_URL}/${APIPATH.GETDIARY}/?userID=${user_Id}`);
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

  useEffect(() => {
    fetchEntries();
  }, []);

  // Refresh entries when modal closes (add entry modal)
  useEffect(() => {
    if (!modalVisible) {
      fetchEntries();
    }
  }, [modalVisible]);

  // Fade animation for detail modal
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

  // Open image picker for new entry
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

      const { data } = await axios.post(`${APIPATH.BASE_URL}/${APIPATH.ADDDIARY}`, {
        userId: user_Id,
        title: newTitle,
        description: newDescription,
        images: newImages,
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
    <TouchableOpacity
      style={styles.card}
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
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>My Diary</Text>

      {loading ? (
        <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 30 }} />
      ) : (
        <FlatList
          data={entries}
          renderItem={renderCard}
          keyExtractor={item => item._id}
          contentContainerStyle={{ paddingBottom: 140, paddingTop: 10 }}
          ListEmptyComponent={<Text style={styles.emptyText}>No entries yet.</Text>}
        />
      )}

      {/* Detail Modal */}
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

      {/* Add Entry Button */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.8}
      >
        <Text style={styles.addButtonText}>+ Add Entry</Text>
      </TouchableOpacity>

      {/* Add Entry Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.addModalContainer}>
          <View style={styles.addModalContent}>
            <Text style={styles.addModalHeader}>Add New Diary Entry</Text>

            <TextInput
              placeholder="Title"
              value={newTitle}
              onChangeText={setNewTitle}
              style={styles.input}
              editable={!addingEntry}
            />
            <TextInput
              placeholder="Description"
              value={newDescription}
              onChangeText={setNewDescription}
              style={[styles.input, { height: 90, textAlignVertical: 'top' }]}
              multiline
              editable={!addingEntry}
            />

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{ marginVertical: 12 }}
            >
              {newImages.map((uri, i) => (
                <Image key={i} source={{ uri }} style={styles.thumbImage} />
              ))}
            </ScrollView>

            <TouchableOpacity
              style={styles.pickImageBtn}
              onPress={pickImage}
              disabled={addingEntry}
              activeOpacity={0.7}
            >
              <Text style={styles.pickImageBtnText}>Pick Images</Text>
            </TouchableOpacity>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalActionBtn, styles.cancelBtn]}
                onPress={() => {
                  setModalVisible(false);
                  setNewTitle('');
                  setNewDescription('');
                  setNewImages([]);
                }}
                disabled={addingEntry}
                activeOpacity={0.7}
              >
                <Text style={styles.modalActionText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalActionBtn, styles.saveBtn]}
                onPress={submitNewEntry}
                disabled={addingEntry}
                activeOpacity={0.7}
              >
                {addingEntry ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={styles.modalActionText}>Save</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    fontSize: 30,
    fontWeight: '800',
    marginBottom: 20,
    color: COLORS.primaryDark,
    alignSelf: 'center',
  },
  card: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 16,
    marginBottom: 14,
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    padding: 14,
    alignItems: 'center',
  },
  cardImage: {
    width: 90,
    height: 90,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
  },
  cardTextContainer: {
    flex: 1,
    marginLeft: 16,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.primaryDark,
  },
  cardDate: {
    fontSize: 14,
    color: '#888',
    marginTop: 6,
    fontWeight: '500',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 40,
    fontSize: 16,
    color: '#999',
    fontStyle: 'italic',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'center',
    paddingHorizontal: 18,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    maxHeight: '80%',
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
    color: COLORS.primaryDark,
  },
  modalDescription: {
    fontSize: 17,
    marginTop: 10,
    color: '#555',
    fontWeight: '500',
  },
  closeBtn: {
    marginTop: 24,
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
  },
  closeBtnText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 16,
  },
  addButton: {
    position: 'absolute',
    bottom: 90,
    right: 25,
    backgroundColor: COLORS.primary,
    borderRadius: 36,
    paddingVertical: 16,
    paddingHorizontal: 26,
    elevation: 7,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.4,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 },
  },
  addButtonText: {
    color: 'white',
    fontWeight: '800',
    fontSize: 18,
  },
  addModalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.38)',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  addModalContent: {
    backgroundColor: 'white',
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
    borderWidth: 1.5,
    borderColor: '#ccc',
    borderRadius: 14,
    padding: 14,
    marginBottom: 18,
    fontSize: 17,
    color: COLORS.textDark || '#222',
  },
  pickImageBtn: {
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  pickImageBtnText: {
    color: COLORS.primary,
    fontWeight: '700',
    fontSize: 16,
  },
  thumbImage: {
    width: 70,
    height: 70,
    borderRadius: 14,
    marginRight: 14,
    backgroundColor: '#eee',
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
  },
  cancelBtn: {
    backgroundColor: '#bbb',
  },
  saveBtn: {
    backgroundColor: COLORS.primary,
  },
  modalActionText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 16,
  },
});
