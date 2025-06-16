import { Box, Button, Input, NativeBaseProvider, ScrollView, Stack, Text, Toast, VStack } from 'native-base';
import React from 'react';
import { ActivityIndicator, Image, TouchableOpacity, Keyboard, StatusBar, StyleSheet, View, Platform, TouchableWithoutFeedback } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { API_KEY, APP_VERSION, BASE_URL, CONTACT_HIER_ID, ORG_ID, PROGRAM_ID } from '../auth_provider/Config';
import LinearGradient from 'react-native-linear-gradient';
import { useTranslation } from 'react-i18next';

const ForgotPasswordScreen = ({ navigation }) => {

    const { t } = useTranslation();

    const [loading, setLoading] = React.useState(false);

    const [username, setUserName] = React.useState('');

    const onForgot = () => {
        Keyboard.dismiss();
        if (username.trim() == '') {
            Toast.show({ description: t("Please enter Username") });
        } else {
            setLoading(true);
            let formdata = new FormData();
            formdata.append("user_name", username);
            formdata.append("APIkey", `${API_KEY}`);
            formdata.append("app_ver", `${APP_VERSION}`);
            formdata.append("programId", `${PROGRAM_ID}`);
            formdata.append("contactHierId", `${CONTACT_HIER_ID}`);
            formdata.append("orgId", `${ORG_ID}`);
            formdata.append("os_type", Platform.OS == 'ios' ? "ios" : "android");
            fetch(`${BASE_URL}/forgot_password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                body: formdata
            })
                .then((response) => response.json())
                .then((responseJson) => {
                    setLoading(false);
                    //console.log("Forgotpass:", responseJson);
                    if (responseJson.status == 'success') {
                        Toast.show({ description: responseJson.message });
                        setTimeout(function () {
                            navigation.goBack();
                        }, 1000);
                    } else {
                        Toast.show({ description: responseJson.message });
                    }
                })
                .catch((error) => {
                    setLoading(false);
                    //console.log("Forgotpass Error:", error);
                    Toast.show({ description: t("Sorry! Somthing went Wrong. Maybe Network request Failed") });
                });
        }
    }

    return (
        <NativeBaseProvider>
            <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
            <Box bg="#ffffff" alignItems="center" zIndex="9">
                <Image source={require('../assets/images/logo.png')} style={styles.logo} />
            </Box>
            <LinearGradient
                colors={["#ffffff", "#cbf75e", "#2BBB86"]}
                flex={1}
                style={{ paddingHorizontal: 5 }}
                start={{ x: 0.5, y: 0 }}
            >
                <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
                    <VStack flex={1} alignItems="center" justifyContent="center">
                        <Image source={require('../assets/images/landing.png')} style={styles.langing} />
                        <Stack space={5} style={styles.formbox} alignItems="center">
                            <Text color="#444444" fontSize="md" fontWeight="bold">{t("Forgot Password")}</Text>
                            <View style={styles.inputbox}>
                                <Input size="lg" onChangeText={(text) => setUserName(text)} variant="unstyled" InputLeftElement={<Icon name="person-outline" size={20} color="#f04e23" style={{ width: 25, marginLeft: 10, textAlign: 'center' }} />} placeholder={t("Username") + " *"} />
                            </View>
                            <Button style={styles.custbtn} onPress={() => onForgot()}>
                                <Text color="#ffffff" fontSize="md" fontWeight="medium">{t("Submit")}</Text>
                            </Button>
                        </Stack>
                        <Stack justifyContent="center" alignItems="center" paddingY="4">
                            <TouchableOpacity alignItems="center" onPress={() => navigation.goBack()}>
                                <Text color="#444444" fontSize="sm" fontWeight="medium" textAlign="center">{t("Login with Username")}</Text>
                                <Text color="#ffffff" fontSize="lg" fontWeight="bold" textAlign="center">{t("User Login")}</Text>
                            </TouchableOpacity>
                        </Stack>
                    </VStack>
                </TouchableWithoutFeedback>
            </LinearGradient>
            {loading && (
                <View style={styles.spincontainer}>
                    <ActivityIndicator animating={loading} size="large" color="#cbf75e" />
                </View>
            )}
        </NativeBaseProvider>
    );
};

const styles = StyleSheet.create({
    bgimage: { flex: 1, justifyContent: 'center' },
    logo: { width: 220, height: 120, resizeMode: 'contain', marginVertical: 10 },
    langing: { width: '70%', height: 280, resizeMode: 'contain', maxWidth: 280, position: 'relative', zIndex: 99 },
    formbox: { backgroundColor: 'rgba(255,255,255,0.5)', width: '70%', maxWidth: 280, paddingHorizontal: 25, paddingVertical: 25, paddingTop: 70, marginTop: -52, overflow: 'hidden', borderBottomEndRadius: 30, borderBottomStartRadius: 30 },
    inputbox: { backgroundColor: 'rgba(255,255,255,0.7)', borderRadius: 12, width: '100%', overflow: 'hidden' },
    custbtn: { width: '100%', backgroundColor: '#111111', borderRadius: 12, overflow: 'hidden' },
    spincontainer: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0, 0, 0, 0.8)' },
});

export default ForgotPasswordScreen;