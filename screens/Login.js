import { Box, Button, HStack, Input, NativeBaseProvider, ScrollView, Select, Stack, Text, Toast, VStack } from 'native-base';
import React, { useEffect } from 'react';
import { ActivityIndicator, Image, Keyboard, Linking, StatusBar, StyleSheet, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { API_KEY, APP_VERSION, BASE_URL, OS_TYPE } from '../auth_provider/Config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LinearGradient from 'react-native-linear-gradient';
import { useTranslation } from 'react-i18next';
import i18n from '../assets/language/i18n';
import messaging from '@react-native-firebase/messaging';

const LoginScreen = ({ navigation, route }) => {

    const { t } = useTranslation();

    const [loading, setLoading] = React.useState(false);

    const [phoneNum, setPhoneNum] = React.useState('');
    const [otp, setOtp] = React.useState('');

    const [otpVerification, setOtpVerification] = React.useState(false);
    const [currentLanguage, setLanguage] = React.useState('Eng');

    const [versionFound, setVersionFound] = React.useState(false);
    const [storeUrl, setStoreUrl] = React.useState("");
    const [serverToken, setServerToken] = React.useState("");
    const [orgId, setOrgId] = React.useState('');

    const [pop, setPop] = React.useState(false);
    const [languageList, setLanguageList] = React.useState([]);

    useEffect(() => {
        setLoading(true);

        let formdata = new FormData();
        formdata.append("APIkey", `${API_KEY}`);
        formdata.append("app_ver", `${APP_VERSION}`);
        formdata.append("os_type", `${OS_TYPE}`);
        console.log(formdata);
        fetch(`${BASE_URL}/app_version_check`, {
            method: 'POST',
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            body: formdata
        })
            .then((response) => response.json())
            .then((responseJson) => {
                console.log("Version Check:", responseJson);
                setLoading(false);
                if (responseJson.version_details.update_available == 0) {
                    AsyncStorage.getItem('userToken').then(val => {
                        if (val != null) {
                            navigation.replace('Home');
                        }
                    });
                } else {
                    AsyncStorage.clear();
                    setStoreUrl(responseJson.version_details.store_url);
                    setVersionFound(true);
                }
            })
            .catch((error) => {
                setLoading(false);
                console.log("Version Check Error:", error);
            });

        AsyncStorage.getItem('language').then(val => {
            if (val != null) {
                setLanguage(val);
                i18n
                    .changeLanguage(val)
                    .then(() => setLoading(false))
                    .catch(err => console.log(err));
            } else {
                setLoading(false);
            }
        });

        getAllLanguage();
        getServerKey();

    }, []);

    async function getServerKey() {
        let fcmToken = await messaging().getToken();
        if (fcmToken) {
            console.log("login token:", fcmToken);
            setServerToken(fcmToken);
        } else {
            console.log("login token error:", fcmToken);
        }
    }

    const getAllLanguage = () => {
        let formdata = new FormData();
        formdata.append("APIkey", `${API_KEY}`);
        fetch(`${BASE_URL}/get_language_by_program`, {
            method: 'POST',
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            body: formdata
        })
            .then((response) => response.json())
            .then((responseJson) => {
                console.log("Language List:", responseJson);
                setLanguageList(responseJson.language_list);
                setLoading(false);
            })
            .catch((error) => {
                setLoading(false);
                console.log("Language Lise Error:", error);
            });
    }

    const onSaveLang = () => {
        AsyncStorage.setItem('language', currentLanguage);
        i18n
            .changeLanguage(currentLanguage)
            .then(() => setLoading(true))
            .catch(err => console.log(err));
        setTimeout(function () {
            setLoading(false);
            setPop(false);
        }, 500);
    }

    const sendOtp = () => {
        Keyboard.dismiss()
        if (phoneNum.trim() == '') {
            Toast.show({ description: t("Please enter Phone Number") });
        } else {
            setLoading(true);
            let formdata = new FormData();
            formdata.append("mobileNumber", phoneNum);
            formdata.append("APIkey", `${API_KEY}`);
            fetch(`${BASE_URL}/get_login_otp`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                body: formdata
            })
                .then((response) => response.json())
                .then((responseJson) => {
                    setLoading(false);
                    console.log("Get OTP:", responseJson);
                    if (responseJson.status == 'success') {
                        setOtpVerification(true);
                        if (responseJson.otp != "") {
                            setOtp(responseJson.otp);
                        }
                        setOrgId(responseJson.orgId);
                        Toast.show({ description: responseJson.message });
                    } else {
                        Toast.show({ description: responseJson.message });
                    }
                })
                .catch((error) => {
                    setLoading(false);
                    console.log("OTP Error:", error);
                    Toast.show({ description: t("Sorry! Somthing went Wrong. Maybe Network request Failed") });
                });
        }
    }

    const onVerify = () => {
        Keyboard.dismiss();
        if (otp == '') {
            Toast.show({ description: t("Please enter OTP") });
        } else {
            setLoading(true);
            let formdata = new FormData();
            formdata.append("APIkey", `${API_KEY}`);
            formdata.append("mobileNumber", phoneNum);
            formdata.append("otpVal", otp);
            formdata.append("orgId", orgId);
            formdata.append("language_code", currentLanguage);
            formdata.append("device_token", serverToken);
            console.log(formdata);
            fetch(`${BASE_URL}/validate_login_otp`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                body: formdata
            })
                .then((response) => response.json())
                .then((responseJson) => {
                    setLoading(false);
                    console.log("Verify OTP:", responseJson);
                    if (responseJson.status == 'success') {
                        Toast.show({ description: t("Successfully Login..") });
                        AsyncStorage.setItem('userToken', JSON.stringify(responseJson));
                        navigation.replace('Home');
                        setPhoneNum("");
                        setOtp("");
                    } else {
                        Toast.show({ description: responseJson.message });
                    }
                })
                .catch((error) => {
                    setLoading(false);
                    console.log("Verify OTP Error:", error);
                    Toast.show({ description: t("Sorry! Somthing went Wrong. Maybe Network request Failed") });
                });
        }
    }

    const onContinueUpdate = () => {
        Linking.openURL(storeUrl);
    }

    return (
        <NativeBaseProvider>
            <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
            <LinearGradient
                colors={["#ffffff", "#ebf9c8", "#cbf75e", "#2BBB86"]}
                flex={1}
                style={{ paddingHorizontal: 5 }}
                start={{ x: 0.5, y: 0 }}
            >
                <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
                    <VStack flex={1} alignItems="center" justifyContent="center">
                        <Box alignItems="center">
                            <Image source={require('../assets/images/logo.png')} style={styles.logo} />
                        </Box>
                        <Image source={require('../assets/images/landing.png')} style={styles.langing} />
                        <Stack style={styles.formbox}>
                            <ScrollView keyboardShouldPersistTaps="handled" maxHeight={200}>
                                <VStack space={5} alignItems="center">
                                    <Text color="#111111" fontSize="sm" fontWeight="medium" textAlign="center">{t("Enter Registered Mobile Number")}</Text>
                                    <View style={styles.inputbox}>
                                        <Input size="md" keyboardType='number-pad' maxLength={10} value={phoneNum} onChangeText={(text) => setPhoneNum(text)} variant="unstyled" InputLeftElement={<Icon name="phone-portrait-outline" size={20} color="#f04e23" style={{ width: 25, marginLeft: 10, textAlign: 'center' }} />} placeholder={t("Enter Mobile No.") + " *"} />
                                    </View>
                                    <HStack justifyContent="space-between" width="100%">
                                        <Button style={[styles.custbtn, { width: 55, backgroundColor: '#f04e23' }]} onPress={() => setPop(true)}>
                                            <HStack alignItems="center">
                                                <Icon name="language-outline" size={20} color="#ffffff" />
                                                <Icon name="caret-down-outline" size={14} color="#ffffff" />
                                            </HStack>
                                        </Button>
                                        <Button style={[styles.custbtn, { width: '72%' }]} onPress={() => sendOtp()}>
                                            <Text color="#ffffff" fontSize="md" fontWeight="medium">{t("Login")}</Text>
                                        </Button>
                                    </HStack>
                                </VStack>
                            </ScrollView>
                        </Stack>
                        {/* <Stack justifyContent="center" alignItems="center" paddingY="4">
                            <TouchableOpacity alignItems="center" onPress={() => navigation.replace('Otp')}>
                                <Text color="#444444" fontSize="sm" fontWeight="medium" textAlign="center">{t("Login with Username")}</Text>
                                <Text color="#ffffff" fontSize="lg" fontWeight="bold" textAlign="center">{t("User Login")}</Text>
                            </TouchableOpacity>
                        </Stack> */}
                    </VStack>
                </TouchableWithoutFeedback>
            </LinearGradient>
            {otpVerification && (
                <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
                    <View style={styles.spincontainer}>
                        <LinearGradient
                            colors={['#ffffff', '#cbf75e']}
                            start={{ x: 0.5, y: 0 }}
                            style={{ width: 280, borderRadius: 15, overflow: 'hidden' }}
                        >
                            <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
                                <VStack space={1} w="100%" paddingY="5" paddingX="5" alignItems="center" justifyContent="center">
                                    <Image source={require('../assets/images/logo.png')} style={[styles.logo, { width: '90%', marginBottom: 10 }]} />
                                    <ScrollView keyboardShouldPersistTaps="handled" maxHeight={300}>
                                        <Text fontSize="lg" fontWeight="bold" color="#111111" textAlign="center">{t("Verify OTP")}</Text>
                                        <Text color="#111111" fontSize="sm" textAlign="center" marginY={3}>{t("Enter OTP code from your Phone we just sent you")}</Text>
                                        <VStack space={5} alignItems="center" width="100%" marginTop={5}>
                                            <View style={styles.inputbox}>
                                                <Input size="lg" value={otp.toString()} onChangeText={(text) => setOtp(text)} keyboardType='number-pad' maxLength={6} variant="unstyled" InputLeftElement={<Icon name="key-outline" size={20} color="#f04e23" style={{ width: 25, marginLeft: 10, textAlign: 'center' }} />} placeholder={t("Enter OTP") + " *"} />
                                            </View>
                                            <Button style={styles.custbtn} onPress={() => onVerify()}>
                                                <Text color="#ffffff" fontSize="md" fontWeight="medium">{t("Verify OTP")}</Text>
                                            </Button>
                                            <TouchableOpacity style={{ alignSelf: 'center', marginBottom: 15 }} onPress={() => sendOtp()}>
                                                <Text color="#f04e23" fontSize="md" fontWeight="bold" textAlign="center">{t("Resend OTP")}?</Text>
                                            </TouchableOpacity>
                                        </VStack>
                                    </ScrollView>
                                </VStack>
                            </TouchableWithoutFeedback>
                        </LinearGradient>
                        <TouchableOpacity style={{ alignSelf: 'center', marginTop: 20, borderColor: '#ffffff', borderWidth: 1, borderRadius: 20, paddingHorizontal: 15, paddingVertical: 5 }} onPress={() => { setOtpVerification(false), setOtp("") }}>
                            <Text color="#ffffff" fontSize="sm" fontWeight="normal" textAlign="center" letterSpacing={1}>{t("Close")}</Text>
                        </TouchableOpacity>
                    </View>
                </TouchableWithoutFeedback>
            )}
            {pop && (
                <View style={styles.spincontainer}>
                    <LinearGradient
                        colors={['#ffffff', '#cbf75e']}
                        start={{ x: 0.5, y: 0 }}
                        style={{ width: 280, borderRadius: 15, overflow: 'hidden' }}
                    >
                        <VStack space={1} w="100%" paddingY="10" paddingX="5" alignItems="center" justifyContent="center">
                            <Text mt={5} mb={3} fontSize="xl" fontWeight="bold" color="#111111">{t("Select Language")}</Text>
                            <View style={styles.inputbox}>
                                <Select variant="underlined" size="md"
                                    selectedValue={currentLanguage}
                                    onValueChange={value => setLanguage(value)}
                                    style={{ paddingLeft: 15, height: 45 }}
                                    _selectedItem={{
                                        backgroundColor: '#eeeeee',
                                        endIcon: <Icon name="checkmark-circle" size={20} color="#2BBB86" style={{ right: 0, position: 'absolute' }} />
                                    }}>
                                    {languageList.map((item, index) =>
                                        <Select.Item key={index} label={item.name} value={item.language_code} />
                                    )}
                                </Select>
                            </View>
                            <Button style={styles.custbtn} onPress={() => onSaveLang()} marginY={2} marginTop={8}>
                                <Text color="#ffffff" fontSize="sm" fontWeight="medium">{t("Continue")}</Text>
                            </Button>
                        </VStack>
                    </LinearGradient>
                </View>
            )}
            {versionFound && (
                <View style={styles.spincontainer}>
                    <LinearGradient
                        colors={['#ffffff', '#cbf75e']}
                        start={{ x: 0.5, y: 0 }}
                        style={{ width: 280, borderRadius: 15, overflow: 'hidden' }}
                    >
                        <VStack space={1} w="100%" paddingY="10" paddingX="5" alignItems="center" justifyContent="center">
                            <Image source={require('../assets/images/logo.png')} style={[styles.logo, { width: '90%', marginBottom: 10 }]} />
                            <Text mb={3} fontSize="xl" fontWeight="bold" color="#111111">{t("Update Warning")}!</Text>
                            <Text textAlign="center" fontSize="sm" fontWeight="medium" color="#111111" mb={3}>{t("App need Update to the Latest Version. Please click on Update Now button to Continue")}...</Text>
                            <Button size="sm" style={{ backgroundColor: '#111111', width: 150, borderRadius: 10, overflow: 'hidden' }} onPress={() => onContinueUpdate()} marginY={4}>
                                <Text color="#ffffff" fontSize="sm" fontWeight="medium">{t("Update Now")}</Text>
                            </Button>
                        </VStack>
                    </LinearGradient>
                </View>
            )}
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
    logo: { width: 240, height: 140, resizeMode: 'contain', marginBottom: 30 },
    langing: { width: '80%', height: 280, resizeMode: 'contain', maxWidth: 280, position: 'relative', zIndex: 99 },
    formbox: { backgroundColor: 'rgba(255,255,255,0.5)', width: '80%', maxWidth: 280, paddingHorizontal: 25, paddingVertical: 25, paddingTop: 70, marginTop: -52, overflow: 'hidden', borderBottomEndRadius: 30, borderBottomStartRadius: 30 },
    inputbox: { backgroundColor: 'rgba(255,255,255,0.7)', borderRadius: 12, width: '100%', overflow: 'hidden' },
    custbtn: { width: '100%', backgroundColor: '#111111', borderRadius: 12, overflow: 'hidden' },
    spincontainer: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0, 0, 0, 0.9)' },
});

export default LoginScreen;