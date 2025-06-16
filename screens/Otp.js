import { Box, Button, HStack, Input, NativeBaseProvider, ScrollView, Select, Stack, Text, Toast, VStack } from 'native-base';
import React, { useEffect } from 'react';
import { ActivityIndicator, Alert, Image, Keyboard, Linking, Platform, StatusBar, StyleSheet, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { API_KEY, APP_VERSION, BASE_URL, CONTACT_HIER_ID, ORG_ID, OS_TYPE, PROGRAM_ID } from '../auth_provider/Config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LinearGradient from 'react-native-linear-gradient';
import { useTranslation } from 'react-i18next';
import messaging from '@react-native-firebase/messaging';

const OtpScreen = ({ navigation }) => {

    const { t, i18n } = useTranslation();

    const [loading, setLoading] = React.useState(false);

    const [show, setShow] = React.useState(false);

    const handleClick = () => setShow(!show);

    const [username, setUserName] = React.useState('');
    const [password, setPassword] = React.useState('');

    const [versionFound, setVersionFound] = React.useState(false);
    const [storeUrl, setStoreUrl] = React.useState("");

    const [serverToken, setServerToken] = React.useState("");

    const [pop, setPop] = React.useState(false);
    const [languageList, SetLanguageList] = React.useState([]);
    const [currentLanguage, setLanguage] = React.useState('Eng');

    useEffect(() => {
        setLoading(true);
        let formdata = new FormData();
        formdata.append("APIkey", `${API_KEY}`);
        formdata.append("app_ver", `${APP_VERSION}`);
        formdata.append("os_type", `${OS_TYPE}`);
        //console.log(formdata);
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
                    .then(() => console.log(val))
                    .catch(err => console.log(err));
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
        }
    }

    const getAllLanguage = () => {
        let formdata = new FormData();
        formdata.append("APIkey", `${API_KEY}`);
        //console.log(formdata);
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
                SetLanguageList(responseJson.language_list);
                setLoading(false);
            })
            .catch((error) => {
                setLoading(false);
                console.log("Language Lise Error:", error);
            });
    }

    const onLogin = () => {
        Keyboard.dismiss();
        if (username.trim() == '') {
            Toast.show({ description: t("Please enter Username") });
        } else if (password == '') {
            Toast.show({ description: t("Please enter Password") });
        } else {
            setLoading(true);
            let formdata = new FormData();
            formdata.append("userName", username);
            formdata.append("passwd", password);
            formdata.append("APIkey", `${API_KEY}`);
            formdata.append("app_ver", `${APP_VERSION}`);
            formdata.append("os_type", `${OS_TYPE}`);
            formdata.append("language_code", currentLanguage);
            formdata.append("device_token", serverToken);
            //console.log(formdata);
            fetch(`${BASE_URL}/auth`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                body: formdata
            })
                .then((response) => response.json())
                .then((responseJson) => {
                    setLoading(false);
                    console.log("Login:", responseJson);
                    if (responseJson.status == 'success') {
                        Toast.show({ description: t("Successfully Login..") });
                        AsyncStorage.setItem('userToken', JSON.stringify(responseJson));
                        navigation.replace('Home');
                    } else {
                        Toast.show({ description: responseJson.message });
                    }
                })
                .catch((error) => {
                    setLoading(false);
                    console.log("Login Error:", error);
                    Toast.show({ description: t("Sorry! Somthing went Wrong. Maybe Network request Failed") });
                });
        }
    }

    const onContinue = () => {
        Linking.openURL(storeUrl);
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

    return (
        <NativeBaseProvider>
            <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
            <Box bg="#ffffff" alignItems="center">
                <Image source={require('../assets/images/logo.png')} style={styles.logo} />
            </Box>
            <LinearGradient
                colors={["#ffffff", "#cbf75e", "#2BBB86"]}
                flex={1}
                style={{ paddingHorizontal: 5 }}
                start={{ x: 0.5, y: 0 }}
            >
                <ScrollView keyboardShouldPersistTaps="handled" marginTop={30}>
                    <VStack flex={1} alignItems="center" justifyContent="center">
                        <Image source={require('../assets/images/landing.png')} style={styles.langing} />
                        <Stack space={5} style={styles.formbox} alignItems="center">
                            <View style={styles.inputbox}>
                                <Input size="lg" onChangeText={(text) => setUserName(text)} variant="unstyled" InputLeftElement={<Icon name="person-outline" size={20} color="#f04e23" style={{ width: 25, marginLeft: 10, textAlign: 'center' }} />} placeholder={t("Username") + " *"} />
                            </View>
                            <View style={styles.inputbox}>
                                <Input size="lg" onChangeText={(text) => setPassword(text)} type={show ? "text" : "password"} variant="unstyled" InputLeftElement={<Icon name="lock-closed-outline" size={20} color="#f04e23" style={{ width: 25, marginLeft: 10, textAlign: 'center' }} />} placeholder={t("Password") + " *"} InputRightElement={<Icon name={show ? "eye-outline" : "eye-off-outline"} size={20} color="#000000" style={{ width: 25, textAlign: 'center', marginRight: 10 }} onPress={handleClick} />} />
                            </View>
                            <TouchableOpacity style={{ alignSelf: 'center' }} onPress={() => navigation.navigate('ForgotPassword')}>
                                <Text color="#666666" fontSize="sm" fontWeight="medium">{t("Forgot Password")}?</Text>
                            </TouchableOpacity>
                            <HStack justifyContent="space-between" width="100%">
                                <Button style={[styles.custbtn, { width: 55, backgroundColor: '#f04e23' }]} onPress={() => setPop(true)}>
                                    <HStack alignItems="center">
                                        <Icon name="language-outline" size={20} color="#ffffff" />
                                        <Icon name="caret-down-outline" size={14} color="#ffffff" />
                                    </HStack>
                                </Button>
                                <Button style={[styles.custbtn, { width: '72%' }]} onPress={() => onLogin()}>
                                    <Text color="#ffffff" fontSize="md" fontWeight="medium">{t("Login")}</Text>
                                </Button>
                            </HStack>
                        </Stack>
                        <Stack justifyContent="center" alignItems="center" paddingY="4">
                            <TouchableOpacity alignItems="center" onPress={() => navigation.replace('Login')}>
                                <Text color="#444444" fontSize="sm" fontWeight="medium" textAlign="center">{t("Login with Phone Number")}</Text>
                                <Text color="#ffffff" fontSize="lg" fontWeight="bold" textAlign="center">{t("OTP Login")}</Text>
                            </TouchableOpacity>
                        </Stack>
                    </VStack>
                </ScrollView>
            </LinearGradient>
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
                            <Image source={require('../assets/images/logo.png')} style={styles.logo} />
                            <Text mt={5} mb={3} fontSize="xl" fontWeight="bold" color="#111111">{t("Update Warning")}!</Text>
                            <Text textAlign="center" fontSize="sm" fontWeight="medium" color="#111111" mb={3}>{t("App need Update to the Latest Version. Please click on Update Now button to Continue")}...</Text>
                            <Button size="sm" style={{ backgroundColor: '#111111', width: 150, borderRadius: 10, overflow: 'hidden' }} onPress={() => onContinue()} marginY={4}>
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
    logo: { width: 220, height: 120, resizeMode: 'contain', marginVertical: 5 },
    langing: { width: '70%', height: 270, resizeMode: 'contain', maxWidth: 260, position: 'relative', zIndex: 99 },
    formbox: { backgroundColor: 'rgba(255,255,255,0.5)', width: '70%', maxWidth: 260, paddingHorizontal: 22, paddingVertical: 22, paddingTop: 70, marginTop: -52, overflow: 'hidden', borderBottomEndRadius: 30, borderBottomStartRadius: 30 },
    inputbox: { backgroundColor: 'rgba(255,255,255,0.7)', borderRadius: 12, width: '100%', overflow: 'hidden' },
    custbtn: { width: '100%', backgroundColor: '#111111', borderRadius: 12, overflow: 'hidden' },
    spincontainer: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0, 0, 0, 0.8)' },
    productbox: { borderRadius: 15, width: '96%', margin: '2%', backgroundColor: '#f6f6f6', padding: 15, borderColor: '#ffffff', borderWidth: 2, elevation: 10, shadowColor: '#666666', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.4, shadowRadius: 10, },
});

export default OtpScreen;