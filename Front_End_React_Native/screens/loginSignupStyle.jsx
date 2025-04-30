import {StyleSheet} from "react-native"

 export const styles = StyleSheet.create({
    container: {
      backgroundColor: "#fff",
      flex: 1,
      position: 'relative',
    },
    Signcontainer: {
      height: 44,
      width: "80%",
      justifyContent: "center",
      alignItems: "center",
      borderRadius: 17,
    },
    topimgContainer: {
      height: 70,
    },
    topimg: {
      width: "100%",
      height: 160,
    },
    Hello_Text_Area: {
      paddingTop: 70,
    },
    Hello_Text: {
      textAlign: "center",
      fontSize: 50,
      fontWeight: "bold",
    },
    login_under_text_area: {},
    login_under_text: {
      textAlign: "center",
      padding: 20,
      fontWeight: "bold",
    },
    input_Container: {
      backgroundColor: "#FFFFFF",
      flexDirection: "row",
      borderRadius: 12,
      marginHorizontal: 40,
      elevation: 10,
      marginVertical: 15,
      alignItems: "center",
      paddingHorizontal: 10,
    },
    inputIcon: {
      height: 25,
      width: 25,
      marginRight: 10,
    },
    InputText: {
      flex: 1,
      fontSize: 17,
    },
    signInContainer: {
      flexDirection: "row",
      width: "100%",
      marginTop: 40,
      justifyContent: "center",
    },
    signIn: {
      color: "#fff",
      fontSize: 20,
      fontWeight: "bold",
    },
    signup_btn: {
      marginTop: 60,
      alignItems: 'center',
    },
    signup_text: {
      color: 'red',
    
      fontWeight: "bold",
    },
    forgotPasswordText: {
            color: "#BEBEBE",
            textAlign: "right",
            fontSize: 15,
            width: "90%",
          },

    backgroundColorImgContainer: {
      position: "absolute",
      left: 0,
      bottom: 0,
    },
    backgroundColorImg: {
      height: 260,
      width: 150,
    }
  });
  