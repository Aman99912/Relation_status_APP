import { StyleSheet } from "react-native";
import { COLORS } from "../Color";

export const styles = StyleSheet.create({
  container: {
    paddingVertical: 40,
    alignItems: 'center',
    // backgroundColor: '#F5F7FA',
    backgroundColor: COLORS.background,
    paddingHorizontal: 20,
    minHeight: '100%',
  },
navItem: {
  position: 'absolute',
  top: 45,
  right: 30,
  zIndex: 999,
},

iconContainer: {
  position: 'relative',
  width: 30,
  height: 30,
  justifyContent: 'center',
  alignItems: 'center',
},

notificationNumber: {
  position: 'absolute',
  top: -6,
  right: -6,
  backgroundColor: 'red',
  borderRadius: 12,
  minWidth: 20,
  height: 20,
  justifyContent: 'center',
  alignItems: 'center',
  paddingHorizontal: 4,
},

notificationText: {
  color: 'white',
  fontSize: 10,
  fontWeight: 'bold',
},


  
  userBox: {
    backgroundColor: '#fff',
    borderRadius: 20,
    width: 320,
    paddingVertical: 30,
    paddingHorizontal: 25,
    alignItems: 'center',
    marginBottom: 20,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  mainUserCardCenter: {
    // When no friends, main user card center vertically
    marginTop: "50%",
  },
  mainUserCardBelow: {
    // When friends exist, main user card below friends list with marginTop smaller
    marginTop: 35,
  },
  avatarContainer: {
    backgroundColor: COLORS.gray,
    // backgroundColor: #e3d1d8,
    borderRadius: 50,
    padding: 18,
    marginBottom: 15,
    width: 100,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '138%',
    height: '138%',
    borderRadius: 50,
    resizeMode: 'cover',
  },
  userText: {
    fontSize: 20,
    color: '#222',
    fontWeight: '700',
    marginBottom: 12,
  },
  infoContainer: {
    width: '100%',
    alignItems: 'flex-start',
    paddingLeft: 12,
    marginBottom: 15,
  },
  infoText: {
    fontSize: 15,
    color: '#555',
    marginVertical: 3,
    fontWeight: '500',
  },
  statusContainer: {
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    width: '100%',
    paddingTop: 10,
    alignItems: 'center',
  },
  statusText: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
  },
  otpBox: {
    backgroundColor: '#fff',
    width: 300,
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    marginBottom: 20,
    elevation: 3,
  },
  verifyButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  verifyText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 25,
  },
  modalBox: {
    backgroundColor: '#fff',
    width: '100%',
    maxWidth: 350,
    borderRadius: 20,
    padding: 25,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 20,
    color: '#222',
  },
  cancelButton: {
    marginTop: 20,
    paddingVertical: 12,
  },
  cancelText: {
    color: COLORS.primary,
    fontWeight: '600',
    fontSize: 16,
  },
});
