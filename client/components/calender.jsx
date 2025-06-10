import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS } from '../Color';
import { APIPATH } from '../utils/apiPath';

export default function CalendarNote() {
  const [userId, setUserId] = useState(null);
  const [markedDates, setMarkedDates] = useState({});
  const [notes, setNotes] = useState({});
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [noteText, setNoteText] = useState('');
  const [showPopup, setShowPopup] = useState(false);
  const [popupText, setPopupText] = useState('');
  const lastTap = useRef(null);


  
  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const id = await AsyncStorage.getItem('userId');
        if (id) {
          setUserId(id);
          fetchNotes(id);
        } else {
          Alert.alert('Error', 'User ID not found');
        }
      } catch (error) {
        Alert.alert('Error', 'Failed to get User ID');
      }
    };
    fetchUserId();
  }, []); 

  const fetchNotes = async (id) => {
    setLoading(true);
    try {
      const Token =  await AsyncStorage.getItem('Token');
      console.log(Token)
      const res = await axios.get(`${APIPATH.BASE_URL}/${APIPATH.CALENDERSEND}?userId=${id}`, 
 {   headers: { Authorization: ` ${Token}` },
  }
);

      const notesFromServer = {};
      if (Array.isArray(res.data)) {
        res.data.forEach(note => {
          notesFromServer[note.date] = note.note;
        });
        setNotes(notesFromServer);
        updateMarkedDates(notesFromServer);
      } else {
        Alert.alert('Error', 'Unexpected response format');
      }
    } catch (e) {
      Alert.alert('Error', 'Failed to fetch notes');
    } finally {
      setLoading(false);
    }
  };

  const updateMarkedDates = (notesObj) => {
    const marks = {};
    Object.keys(notesObj).forEach(date => {
      marks[date] = {
        customStyles: {
          container: styles.animatedDot,
        },
      };
    });
    setMarkedDates(marks);
  };

  const handleDayTap = (day) => {
    const now = Date.now();
    const DOUBLE_PRESS_DELAY = 300;
    if (lastTap.current && (now - lastTap.current) < DOUBLE_PRESS_DELAY) {
      openNoteEditor(day.dateString);
    } else {
      lastTap.current = now;
      if (notes[day.dateString]) {
        setSelectedDate(day.dateString);
        setPopupText(notes[day.dateString]);
        setShowPopup(true);
        setTimeout(() => setShowPopup(false), 2500);
      }
    }
  };

  const openNoteEditor = (date) => {
    setSelectedDate(date);
    setNoteText(notes[date] || '');
    setModalVisible(true);
  };

  const saveNote = async () => {
    if (!noteText.trim()) {
      Alert.alert('Warning', 'Please enter some note text');
      return;
    }
    if (!userId) {
      Alert.alert('Error', 'User ID is missing');
      return;
    }
    setLoading(true);
    try {
      const Token =  await AsyncStorage.getItem('Token');
      await axios.post(`${APIPATH.BASE_URL}/${APIPATH.CALENDERSEND}`, {
        userId,
        date: selectedDate,
        note: noteText},
        {   headers: { Authorization: ` ${Token}` },
  }
      );
      const newNotes = { ...notes, [selectedDate]: noteText };
      setNotes(newNotes);
      updateMarkedDates(newNotes);
      setModalVisible(false);
    } catch (e) {
      Alert.alert('Error', e?.response?.data?.message || 'Failed to save note');
    } finally {
      setLoading(false);
    }
  };

  const deleteNote = async () => {
    if (!userId) {
      Alert.alert('Error', 'User ID is missing');
      return;
    }
    setLoading(true);
    try {
       const Token =  await AsyncStorage.getItem('Token');
       const id = await AsyncStorage.getItem('userId');
      
      //  console.log(`${APIPATH.BASE_URL}/${APIPATH.CALENDERSEND}/${selectedDate}`);
     
      await axios.delete(`${APIPATH.BASE_URL}/${APIPATH.CALENDERSEND}/${selectedDate}`, 
       {id} ,
        {   headers: { Authorization: `${Token}` 
      },
  }
      );
      const newNotes = { ...notes };
      delete newNotes[selectedDate];
      setNotes(newNotes);
      updateMarkedDates(newNotes);
      setModalVisible(false);
    } catch (e) {
       Alert.alert('Error', e?.response?.data?.message || 'Failed to delete note');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Calendar</Text>
      <Calendar
        onDayPress={handleDayTap}
        markedDates={markedDates}
        markingType={'custom'}
        theme={{
          selectedDayBackgroundColor: COLORS.primary,
          todayTextColor: COLORS.primary,
          arrowColor: COLORS.primary,
          monthTextColor: COLORS.primaryDark,
          textDayFontWeight: '600',
          textMonthFontWeight: '700',
          textDayHeaderFontWeight: '600',
        }}
      />

      {showPopup && (
        <View style={styles.popupNote}>
          <Text style={styles.popupText}>{popupText}</Text>
        </View>
      )}

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalHeader}>Note for {selectedDate}</Text>
            <TextInput
              style={styles.textInput}
              multiline
              placeholder="Write your note here..."
              value={noteText}
              onChangeText={setNoteText}
              autoFocus
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={[styles.btn, styles.saveBtn]} onPress={saveNote}>
                <Text style={styles.btnText}>Save</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.btn, styles.cancelBtn]} onPress={() => setModalVisible(false)}>
                <Text style={styles.btnText}>Cancel</Text>
              </TouchableOpacity>
              {notes[selectedDate] && (
                <TouchableOpacity
                  style={[styles.btn, styles.deleteBtn]}
                  onPress={() =>
                    Alert.alert('Delete Note', 'Are you sure?', [
                      { text: 'Cancel', style: 'cancel' },
                      { text: 'Delete', style: 'destructive', onPress: deleteNote },
                    ])
                  }
                >
                  <Text style={styles.btnText}>Delete</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </Modal>

      {loading && <ActivityIndicator style={{ marginTop: 10 }} size="large" color={COLORS.primary} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    paddingTop: 50,
    backgroundColor: '#FFF5F9',
  },
  header: {
    fontSize: 30,
    fontWeight: '800',
    color: '#872341',
    textAlign: 'center',
    marginBottom: 20,
  },
  animatedDot: {
    borderColor: 'green',
    borderWidth: 1,
    borderRadius: 10,
    padding: 1,
    backgroundColor: '#eaffea',
    shadowColor: 'green',
    shadowOpacity: 0.5,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 0 },
    elevation: 9,
  },
  popupNote: {
    position: 'absolute',
    top: 100,
    left: 30,
    right: 30,
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  popupText: {
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
  },
  modalHeader: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.primaryDark,
    marginBottom: 12,
  },
  textInput: {
    height: 100,
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: 8,
    padding: 10,
    textAlignVertical: 'top',
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  btn: {
    flex: 1,
    padding: 12,
    marginHorizontal: 4,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveBtn: {
    backgroundColor: COLORS.primary,
  },
  cancelBtn: {
    backgroundColor: '#777',
  },
  deleteBtn: {
    backgroundColor: '#d9534f',
  },
  btnText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 16,
  },
});
