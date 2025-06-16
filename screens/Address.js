import AsyncStorage from '@react-native-async-storage/async-storage';
import { Box, HStack, NativeBaseProvider, Text, VStack, Toast, Button, Stack, Input, Actionsheet, Select } from 'native-base';
import React, { useEffect } from 'react';
import Icon from 'react-native-vector-icons/Ionicons';
import { ActivityIndicator, Alert, Image, ImageBackground, Keyboard, Platform, Pressable, ScrollView, Share, StatusBar, StyleSheet, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { API_KEY, BASE_URL, CONTACT_HIER_ID, ORG_ID, PROGRAM_ID } from '../auth_provider/Config';
import LinearGradient from 'react-native-linear-gradient';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import moment from 'moment';
import ReactNativeBlobUtil from 'react-native-blob-util';
import { useTranslation } from 'react-i18next';

const AddreessScreen = ({ navigation, route }) => {

    const { t } = useTranslation();

    const [loading, setLoading] = React.useState(false);
    const [lightColor, setLightColor] = React.useState("#cbf75e");
    const [darkColor, setDarkColor] = React.useState("#2BBB86");
    const [logoImage, setLogoImage] = React.useState("");

    const [altAddress, setAltAddress] = React.useState("");
    const [parAddress, setParAddress] = React.useState("");

    const [addressId, setAddressId] = React.useState("");
    const [addressType, setAddressType] = React.useState("");

    const [otp, setOtp] = React.useState('');

    const [pop, setPop] = React.useState(false);
    const [successOrder, setSuccessOrder] = React.useState(false);
    const [popAddress, setPopAddress] = React.useState(false);

    const [address1, setAddress1] = React.useState("");
    const [address2, setAddress2] = React.useState("");
    const [address3, setAddress3] = React.useState("");
    const [state, setState] = React.useState("");
    const [city, setCity] = React.useState("");
    const [pinCode, setPinCode] = React.useState("");

    const [stateList, setStateList] = React.useState([]);
    const [cityList, setCityList] = React.useState([]);

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            setLoading(true);
            getAllData();
            console.log(route.params.cartId);
        });
        return unsubscribe;
    }, []);

    const onSelectState = (idVal) => {
        setLoading(true);
        setState(idVal);
        setCity("");
        getCityList(idVal);
    }


    const getAllData = () => {
        AsyncStorage.getItem('userToken').then(val => {
            if (val != null) {
                setLogoImage(JSON.parse(val).logo_url);

                setLightColor(JSON.parse(val).info.theme_color.light);
                setDarkColor(JSON.parse(val).info.theme_color.dark);

                let formdata = new FormData();
                formdata.append("token", JSON.parse(val).token);
                formdata.append("APIkey", `${API_KEY}`);
                fetch(`${BASE_URL}/get_user_address`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                    body: formdata
                })
                    .then((response) => response.json())
                    .then((responseJson) => {
                        console.log("get_user_address:", responseJson);
                        if (responseJson.status == 'success') {
                            setAltAddress(responseJson.address.alternate_addresses);
                            setParAddress(responseJson.address.permanent_address);
                            getStateList();
                        } else {
                            Toast.show({ description: responseJson.message });
                            setTimeout(function () {
                                setLoading(false);
                                if (responseJson.msg_code == "msg_1000") {
                                    AsyncStorage.clear();
                                    navigation.navigate('Login');
                                }
                            }, 1000);
                        }
                    })
                    .catch((error) => {
                        setLoading(false);
                        //console.log("get_user_address Error:", error);
                        Toast.show({ description: t("Sorry! Somthing went Wrong. Maybe Network request Failed") });
                    });
            } else {
                setLoading(false);
                AsyncStorage.clear();
                navigation.navigate('Login');
            }
        });
    }

    const getStateList = () => {
        AsyncStorage.getItem('userToken').then(val => {
            if (val != null) {
                let formdata = new FormData();
                formdata.append("token", JSON.parse(val).token);
                formdata.append("APIkey", `${API_KEY}`);
                fetch(`${BASE_URL}/GetStateList`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                    body: formdata
                })
                    .then((response) => response.json())
                    .then((responseJson) => {
                        console.log("GetStateList:", responseJson);
                        if (responseJson.status == 'success') {
                            setStateList(responseJson.state_list);
                            setLoading(false);
                        } else {
                            setLoading(false);
                            setStateList([]);
                            Toast.show({ description: responseJson.message });
                        }
                    })
                    .catch((error) => {
                        setLoading(false);
                        //console.log("GetStateList Error:", error);
                        Toast.show({ description: t("Sorry! Somthing went Wrong. Maybe Network request Failed") });
                    });
            } else {
                setLoading(false);
                AsyncStorage.clear();
                navigation.navigate('Login');
            }
        });
    }

    const getCityList = (stateId) => {
        AsyncStorage.getItem('userToken').then(val => {
            if (val != null) {
                let formdata = new FormData();
                formdata.append("token", JSON.parse(val).token);
                formdata.append("APIkey", `${API_KEY}`);
                formdata.append("state_id", stateId);
                fetch(`${BASE_URL}/GetCityWithStateIDList`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                    body: formdata
                })
                    .then((response) => response.json())
                    .then((responseJson) => {
                        console.log("GetCityWithStateIDList:", responseJson);
                        if (responseJson.status == 'success') {
                            setCityList(responseJson.city_list);
                            setLoading(false);
                        } else {
                            setLoading(false);
                            setStateList([]);
                            Toast.show({ description: responseJson.message });
                        }
                    })
                    .catch((error) => {
                        setLoading(false);
                        //console.log("GetCityWithStateIDList Error:", error);
                        Toast.show({ description: t("Sorry! Somthing went Wrong. Maybe Network request Failed") });
                    });
            } else {
                setLoading(false);
                AsyncStorage.clear();
                navigation.navigate('Login');
            }
        });
    }

    const selectAddress = (addId, addType) => {
        setAddressId(addId);
        setAddressType(addType);
        setLoading(true);
        AsyncStorage.getItem('userToken').then(val => {
            if (val != null) {
                let formdata = new FormData();
                formdata.append("APIkey", `${API_KEY}`);
                formdata.append("token", JSON.parse(val).token);
                formdata.append("orgId", JSON.parse(val).org_id);
                fetch(`${BASE_URL}/generate_shipping_otp`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                    body: formdata
                })
                    .then((response) => response.json())
                    .then((responseJson) => {
                        console.log("generate_shipping_otp:", responseJson);
                        if (responseJson.status == 'success') {
                            setPop(true);
                            Toast.show({ description: responseJson.message });
                            setLoading(false);
                        } else {
                            Toast.show({ description: responseJson.message });
                            setTimeout(function () {
                                setLoading(false);
                                if (responseJson.msg_code == "msg_1000") {
                                    AsyncStorage.clear();
                                    navigation.navigate('Login');
                                }
                            }, 1000);
                        }
                    })
                    .catch((error) => {
                        setLoading(false);
                        //console.log("generate_shipping_otp Error:", error);
                        Toast.show({ description: t("Sorry! Somthing went Wrong. Maybe Network request Failed") });
                    });
            } else {
                setLoading(false);
                AsyncStorage.clear();
                navigation.navigate('Login');
            }
        });
    }

    const onCancel = () => {
        setPop(false);
        setOtp("");
    }

    const resendOTP = () => {
        selectAddress(addressId, addressType);
    }

    const onVerify = () => {
        Keyboard.dismiss();
        if (otp.trim() == '') {
            Toast.show({ description: t("Please enter OTP") });
        } else {
            setLoading(true);
            AsyncStorage.getItem('userToken').then(val => {
                if (val != null) {
                    let formdata = new FormData();
                    formdata.append("token", JSON.parse(val).token);
                    formdata.append("otpVal", otp);
                    formdata.append("APIkey", `${API_KEY}`);
                    fetch(`${BASE_URL}/validate_otp_shipping`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'multipart/form-data',
                        },
                        body: formdata
                    })
                        .then((response) => response.json())
                        .then((responseJson) => {
                            //console.log("Verify OTP:", responseJson);
                            if (responseJson.status == 'success') {
                                onCancel();
                                onPlaceOrder();
                            } else {
                                setLoading(false);
                                Toast.show({ description: responseJson.message });
                            }
                        })
                        .catch((error) => {
                            setLoading(false);
                            //console.log("Verify OTP Error:", error);
                            Toast.show({ description: t("Sorry! Somthing went Wrong. Maybe Network request Failed") });
                        });
                } else {
                    setLoading(false);
                    AsyncStorage.clear();
                    navigation.navigate('Login');
                }
            });
        }
    }

    const onSaveAddress = () => {
        if (address1.trim() == "") {
            Toast.show({ description: t("Please enter Address Line 1") });
        } else if (address2.trim() == "") {
            Toast.show({ description: t("Please enter Address Line 2") });
        } else if (state == "") {
            Toast.show({ description: t("Please select State") });
        } else if (city == "") {
            Toast.show({ description: t("Please select City") });
        } else if (pinCode.trim() == "") {
            Toast.show({ description: t("Please enter Pincode") });
        } else {
            AsyncStorage.getItem('userToken').then(val => {
                if (val != null) {
                    let formdata = new FormData();
                    formdata.append("APIkey", `${API_KEY}`);
                    formdata.append("token", JSON.parse(val).token);
                    formdata.append("orgId", JSON.parse(val).org_id);
                    formdata.append("add_address_line1", address1);
                    formdata.append("add_address_line2", address2);
                    formdata.append("add_address_line3", address3);
                    formdata.append("add_state", state);
                    formdata.append("add_city", city);
                    formdata.append("add_pincode", pinCode);
                    console.log(formdata);
                    fetch(`${BASE_URL}/add_alternate_address`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'multipart/form-data',
                        },
                        body: formdata
                    })
                        .then((response) => response.json())
                        .then((responseJson) => {
                            console.log("add_alternate_address:", responseJson);
                            if (responseJson.status == 'success') {
                                onCancelAddress();
                                selectAddress(responseJson.address_id, 'dcm_contact_shipping_address');
                            } else {
                                if (responseJson.msg_code == "msg_1000") {
                                    Toast.show({ description: responseJson.message });
                                    setTimeout(function () {
                                        AsyncStorage.clear();
                                        navigation.navigate('Login');
                                    }, 1000);
                                } else {
                                    Alert.alert(
                                        t("Sorry") + "!",
                                        responseJson.message,
                                        [
                                            {
                                                text: t("Ok"), onPress: () => { }
                                            }
                                        ],
                                        { cancelable: false }
                                    );
                                }
                            }
                        })
                        .catch((error) => {
                            setLoading(false);
                            console.log("add_alternate_address Error:", error);
                            Toast.show({ description: t("Sorry! Somthing went Wrong. Maybe Network request Failed") });
                        });
                } else {
                    setLoading(false);
                    AsyncStorage.clear();
                    navigation.navigate('Login');
                }
            });
        }
    }

    const onPlaceOrder = () => {
        AsyncStorage.getItem('userToken').then(val => {
            if (val != null) {
                let formdata = new FormData();
                formdata.append("APIkey", `${API_KEY}`);
                formdata.append("token", JSON.parse(val).token);
                formdata.append("orgId", JSON.parse(val).org_id);
                formdata.append("combo_prod_id", route.params.cartId);
                formdata.append("address_id", addressId);
                formdata.append("referece_address_table", addressType);
                console.log(formdata);
                fetch(`${BASE_URL}/order`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                    body: formdata
                })
                    .then((response) => response.json())
                    .then((responseJson) => {
                        console.log("Order Placed:", responseJson);
                        if (responseJson.status == 'success') {
                            setLoading(false);
                            setSuccessOrder(true);
                            getAllData();
                        } else {
                            if (responseJson.msg_code == "msg_1000") {
                                Toast.show({ description: responseJson.message });
                                setTimeout(function () {
                                    setLoading(false);
                                    AsyncStorage.clear();
                                    navigation.navigate('Login');
                                }, 1000);
                            } else {
                                setLoading(false);
                                Alert.alert(
                                    t("Sorry") + "!",
                                    responseJson.message,
                                    [
                                        {
                                            text: t("Ok"), onPress: () => { }
                                        }
                                    ],
                                    { cancelable: false }
                                );
                            }
                        }
                    })
                    .catch((error) => {
                        setLoading(false);
                        //console.log("Order Placed Error:", error);
                        Toast.show({ description: t("Sorry! Somthing went Wrong. Maybe Network request Failed") });
                    });
            } else {
                setLoading(false);
                AsyncStorage.clear();
                navigation.navigate('Login');
            }
        });
    }

    const onContinue = () => {
        setSuccessOrder(false);
        navigation.navigate('Home');
    }

    const onCancelAddress = () => {
        setPopAddress(false);
        setAddress1("");
        setAddress2("");
        setAddress3("");
        setState("");
        setCity("");
        setPinCode("");
    }

    return (
        <NativeBaseProvider>
            <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
            <Box flex={1} bg="white">
                <LinearGradient
                    colors={["#ffffff", lightColor]}
                    start={{ x: 0.5, y: 0 }}
                >
                    <HStack justifyContent="space-between" alignItems="center" paddingX="4" paddingY="3" space={2}>
                        <TouchableOpacity onPress={() => navigation.goBack()} style={{ width: 60 }}>
                            <Icon name="chevron-back" size={26} color="#111111" />
                        </TouchableOpacity>
                        <Text color="#111111" fontSize="16" textAlign="center" fontWeight="bold" textTransform="capitalize">{t("Address Details")}</Text>
                        <Image source={logoImage ? { uri: logoImage } : require('../assets/images/logo.png')} style={{ width: 60, height: 25, resizeMode: 'contain' }} />
                    </HStack>
                </LinearGradient>
                <ScrollView>
                    <LinearGradient
                        colors={[lightColor, darkColor]}
                        style={{ height: 80, position: 'absolute', top: 0, width: '100%', borderBottomEndRadius: 100, borderBottomStartRadius: 100, overflow: 'hidden' }}
                        start={{ x: 0.5, y: 0 }}
                    ></LinearGradient>
                    <Box padding="5">
                        <VStack>
                            <Box style={styles.productbox}>
                                <VStack alignItems="center" w="100%" padding={3}>
                                    <TouchableOpacity onPress={() => setPopAddress(true)} style={{ width: '100%' }}>
                                        <Stack borderWidth={1} bg={"#444444"} justifyContent="center" borderColor="#444444" borderStyle="dashed" borderRadius={12} w="100%" height="45" padding="1" overflow="hidden">
                                            <Text color="#ffffff" fontSize="md" textAlign="center" fontWeight="medium" textTransform="capitalize">{t("Add New Address")}</Text>
                                        </Stack>
                                    </TouchableOpacity>
                                </VStack>
                            </Box>
                            <Box style={styles.productbox} mt="3">
                                <LinearGradient
                                    colors={[lightColor, darkColor]}
                                    start={{ x: 0.5, y: 0 }}
                                    style={{ padding: 10 }}
                                >
                                    <Text color="#111111" fontSize="14" textAlign="center" fontWeight="bold">{t("Parmanent Address")}</Text>
                                </LinearGradient>
                                {parAddress == "" ?
                                    <HStack padding="10" justifyContent="center">
                                        <Text fontSize='sm' color="#888888">----- {t("No Data Available")} -----</Text>
                                    </HStack>
                                    :
                                    <ScrollView nestedScrollEnabled={true}>
                                        <VStack padding="3">
                                            <HStack justifyContent="space-between" flexWrap="wrap" alignItems="center" w="100%" padding={2} borderColor="#dddddd" borderBottomWidth={1}>
                                                <Text color="#666666" fontSize="xs" fontWeight="medium" textTransform="capitalize">{t("Address Line1")}:</Text>
                                                <Text color="#111111" width={200} fontSize="sm" textAlign="right" fontWeight="bold">{parAddress.line1}</Text>
                                            </HStack>
                                            <HStack justifyContent="space-between" flexWrap="wrap" alignItems="center" w="100%" padding={2} borderColor="#dddddd" borderBottomWidth={1}>
                                                <Text color="#666666" fontSize="xs" fontWeight="medium" textTransform="capitalize">{t("Address Line2")}:</Text>
                                                <Text color="#111111" width={200} fontSize="sm" textAlign="right" fontWeight="bold">{parAddress.line2}</Text>
                                            </HStack>
                                            {parAddress.line3 != "" && (
                                                <HStack justifyContent="space-between" flexWrap="wrap" alignItems="center" w="100%" padding={2} borderColor="#dddddd" borderBottomWidth={1}>
                                                    <Text color="#666666" fontSize="xs" fontWeight="medium" textTransform="capitalize">{t("Address Line3")}:</Text>
                                                    <Text color="#111111" width={200} fontSize="sm" textAlign="right" fontWeight="bold">{parAddress.line3}</Text>
                                                </HStack>
                                            )}
                                            <HStack justifyContent="space-between" flexWrap="wrap" alignItems="center" w="100%" padding={2} borderColor="#dddddd" borderBottomWidth={1}>
                                                <Text color="#666666" fontSize="xs" fontWeight="medium" textTransform="capitalize">{t("Country")}:</Text>
                                                <Text color="#111111" width={200} fontSize="sm" textAlign="right" fontWeight="bold">{parAddress.country}</Text>
                                            </HStack>
                                            <HStack justifyContent="space-between" flexWrap="wrap" alignItems="center" w="100%" padding={2} borderColor="#dddddd" borderBottomWidth={1}>
                                                <Text color="#666666" fontSize="xs" fontWeight="medium" textTransform="capitalize">{t("State")}:</Text>
                                                <Text color="#111111" width={200} fontSize="sm" textAlign="right" fontWeight="bold">{parAddress.state}</Text>
                                            </HStack>
                                            <HStack justifyContent="space-between" flexWrap="wrap" alignItems="center" w="100%" padding={2} borderColor="#dddddd" borderBottomWidth={1}>
                                                <Text color="#666666" fontSize="xs" fontWeight="medium" textTransform="capitalize">{t("City")}:</Text>
                                                <Text color="#111111" width={200} fontSize="sm" textAlign="right" fontWeight="bold">{parAddress.city}</Text>
                                            </HStack>
                                            <HStack justifyContent="space-between" flexWrap="wrap" alignItems="center" w="100%" padding={2}>
                                                <Text color="#666666" fontSize="xs" fontWeight="medium" textTransform="capitalize">{t("Post Code")}:</Text>
                                                <Text color="#111111" width={200} fontSize="sm" textAlign="right" fontWeight="bold">{parAddress.post_code}</Text>
                                            </HStack>
                                            <HStack justifyContent="center" alignItems="center" w="100%" marginTop={4}>
                                                <LinearGradient
                                                    colors={["#821700", "#f04e23"]}
                                                    start={{ x: 0.5, y: 0 }}
                                                    style={styles.custbtn}
                                                >
                                                    <Button size="sm" width="100%" variant="link" _text={{ color: "#ffffff", fontWeight: 'bold', fontSize: 13 }} onPress={() => selectAddress(parAddress.add_id, 'dcm_addresses')}>{t("Delivery to This Address")}</Button>
                                                </LinearGradient>
                                            </HStack>
                                        </VStack>
                                    </ScrollView>
                                }
                            </Box>
                            <Box style={styles.productbox} mt="3">
                                <LinearGradient
                                    colors={[lightColor, darkColor]}
                                    start={{ x: 0.5, y: 0 }}
                                    style={{ padding: 10 }}
                                >
                                    <Text color="#111111" fontSize="14" textAlign="center" fontWeight="bold">{t("Alternative Address")}</Text>
                                </LinearGradient>
                                {altAddress == null ?
                                    <HStack padding="10" justifyContent="center">
                                        <Text fontSize='sm' color="#888888">----- {t("No Data Available")} -----</Text>
                                    </HStack>
                                    :
                                    <ScrollView nestedScrollEnabled={true}>
                                        <VStack padding="3">
                                            <HStack justifyContent="space-between" flexWrap="wrap" alignItems="center" w="100%" padding={2} borderColor="#dddddd" borderBottomWidth={1}>
                                                <Text color="#666666" fontSize="xs" fontWeight="medium" textTransform="capitalize">{t("Address Line1")}:</Text>
                                                <Text color="#111111" width={200} fontSize="sm" textAlign="right" fontWeight="bold">{altAddress.line1}</Text>
                                            </HStack>
                                            <HStack justifyContent="space-between" flexWrap="wrap" alignItems="center" w="100%" padding={2} borderColor="#dddddd" borderBottomWidth={1}>
                                                <Text color="#666666" fontSize="xs" fontWeight="medium" textTransform="capitalize">{t("Address Line2")}:</Text>
                                                <Text color="#111111" width={200} fontSize="sm" textAlign="right" fontWeight="bold">{altAddress.line2}</Text>
                                            </HStack>
                                            {parAddress.line3 != "" && (
                                                <HStack justifyContent="space-between" flexWrap="wrap" alignItems="center" w="100%" padding={2} borderColor="#dddddd" borderBottomWidth={1}>
                                                    <Text color="#666666" fontSize="xs" fontWeight="medium" textTransform="capitalize">{t("Address Line3")}:</Text>
                                                    <Text color="#111111" width={200} fontSize="sm" textAlign="right" fontWeight="bold">{altAddress.line3}</Text>
                                                </HStack>
                                            )}
                                            <HStack justifyContent="space-between" flexWrap="wrap" alignItems="center" w="100%" padding={2} borderColor="#dddddd" borderBottomWidth={1}>
                                                <Text color="#666666" fontSize="xs" fontWeight="medium" textTransform="capitalize">{t("Country")}:</Text>
                                                <Text color="#111111" width={200} fontSize="sm" textAlign="right" fontWeight="bold">{altAddress.country}</Text>
                                            </HStack>
                                            <HStack justifyContent="space-between" flexWrap="wrap" alignItems="center" w="100%" padding={2} borderColor="#dddddd" borderBottomWidth={1}>
                                                <Text color="#666666" fontSize="xs" fontWeight="medium" textTransform="capitalize">{t("State")}:</Text>
                                                <Text color="#111111" width={200} fontSize="sm" textAlign="right" fontWeight="bold">{altAddress.state}</Text>
                                            </HStack>
                                            <HStack justifyContent="space-between" flexWrap="wrap" alignItems="center" w="100%" padding={2} borderColor="#dddddd" borderBottomWidth={1}>
                                                <Text color="#666666" fontSize="xs" fontWeight="medium" textTransform="capitalize">{t("City")}:</Text>
                                                <Text color="#111111" width={200} fontSize="sm" textAlign="right" fontWeight="bold">{altAddress.city}</Text>
                                            </HStack>
                                            <HStack justifyContent="space-between" flexWrap="wrap" alignItems="center" w="100%" padding={2}>
                                                <Text color="#666666" fontSize="xs" fontWeight="medium" textTransform="capitalize">{t("Post Code")}:</Text>
                                                <Text color="#111111" width={200} fontSize="sm" textAlign="right" fontWeight="bold">{altAddress.post_code}</Text>
                                            </HStack>
                                            <HStack justifyContent="center" alignItems="center" w="100%" marginTop={4}>
                                                <LinearGradient
                                                    colors={["#821700", "#f04e23"]}
                                                    start={{ x: 0.5, y: 0 }}
                                                    style={styles.custbtn}
                                                >
                                                    <Button size="sm" width="100%" variant="link" _text={{ color: "#ffffff", fontWeight: 'bold', fontSize: 13 }} onPress={() => selectAddress(altAddress.add_id, 'dcm_contact_shipping_address')}>{t("Delivery to This Address")}</Button>
                                                </LinearGradient>
                                            </HStack>
                                        </VStack>
                                    </ScrollView>
                                }
                            </Box>
                        </VStack>
                    </Box>
                </ScrollView>
            </Box>
            {pop && (
                <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
                    <VStack flex={1} style={{ backgroundColor: "rgba(0,0,0,0.85)", position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center', padding: 30 }}>
                        <Box style={styles.productbox} padding={3}>
                            <Stack space={3} alignItems="center">
                                <Text color="#444444" fontSize="md" fontWeight="bold">{t("OTP Verification")}</Text>
                                <View style={styles.inputbox}>
                                    <Input size="lg" onChangeText={(text) => setOtp(text)} keyboardType='number-pad' maxLength={6} variant="unstyled" InputLeftElement={<Icon name="key-outline" size={20} color="#f04e23" style={{ width: 25, marginLeft: 10, textAlign: 'center' }} />} placeholder={t("Enter OTP") + " *"} />
                                </View>
                                <TouchableOpacity style={{ alignSelf: 'center' }} onPress={() => resendOTP()}>
                                    <Text color="#f04e23" fontSize="md" fontWeight="bold" textAlign="center">{t("Resend OTP")}?</Text>
                                </TouchableOpacity>
                            </Stack>
                            <HStack space={1} alignItems="center" justifyContent="space-evenly" bg="#eeeeee" borderRadius="10" overflow="hidden" padding="2" mt="6">
                                <LinearGradient
                                    colors={["#821700", "#f04e23"]}
                                    start={{ x: 0.5, y: 0 }}
                                    style={styles.optionbtn}
                                >
                                    <Button size="xs" variant="link" _text={{ color: "#ffffff", fontWeight: 'bold', fontSize: 13 }} onPress={() => onCancel()}>{t("Close")}</Button>
                                </LinearGradient>
                                <LinearGradient
                                    colors={["#10764F", "#2BBB86"]}
                                    start={{ x: 0.5, y: 0 }}
                                    style={styles.optionbtn}
                                >
                                    <Button size="xs" variant="link" _text={{ color: "#ffffff", fontWeight: 'bold', fontSize: 13 }} onPress={() => onVerify()}>{t("Verify")}</Button>
                                </LinearGradient>
                            </HStack>
                        </Box>
                    </VStack>
                </TouchableWithoutFeedback>
            )}
            {popAddress && (
                <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
                    <VStack flex={1} style={{ backgroundColor: "rgba(0,0,0,0.85)", position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center', padding: 30 }}>
                        <Box style={styles.productbox} padding={3}>
                            <Stack space={3} alignItems="center">
                                <Text color="#444444" fontSize="md" mb={1} fontWeight="bold">{t("Add New Address")}</Text>
                                <View style={styles.inputbox}>
                                    <Input size="lg" onChangeText={(text) => setAddress1(text)} variant="unstyled" InputLeftElement={<Icon name="location-outline" size={20} color="#666666" style={{ width: 25, marginLeft: 10, textAlign: 'center' }} />} placeholder={t("Address Line 1") + " *"} />
                                </View>
                                <View style={styles.inputbox}>
                                    <Input size="lg" onChangeText={(text) => setAddress2(text)} variant="unstyled" InputLeftElement={<Icon name="location-outline" size={20} color="#666666" style={{ width: 25, marginLeft: 10, textAlign: 'center' }} />} placeholder={t("Address Line 2") + " *"} />
                                </View>
                                <View style={styles.inputbox}>
                                    <Input size="lg" onChangeText={(text) => setAddress3(text)} variant="unstyled" InputLeftElement={<Icon name="location-outline" size={20} color="#666666" style={{ width: 25, marginLeft: 10, textAlign: 'center' }} />} placeholder={t("Address Line 3")} />
                                </View>
                                <View style={styles.inputbox}>
                                    <Select variant="underlined" size="lg" placeholder={t("Select State") + " *"}
                                        InputLeftElement={<Icon name="location-outline" size={20} color="#666666" style={{ width: 25, marginLeft: 10, marginRight: 10, textAlign: 'center' }} />}
                                        selectedValue={state}
                                        onValueChange={value => onSelectState(value)}
                                        _selectedItem={{
                                            backgroundColor: '#eeeeee',
                                            endIcon: <Icon name="checkmark-circle" size={22} color="#2BBB86" style={{ right: 0, position: 'absolute' }} />
                                        }}>
                                        {stateList.map((item, index) =>
                                            <Select.Item key={index} label={item.state_name} value={item.state_id} />
                                        )}
                                    </Select>
                                </View>
                                {state != "" && (
                                    <View style={styles.inputbox}>
                                        <Select variant="underlined" size="lg" placeholder={t("Select City") + " *"}
                                            InputLeftElement={<Icon name="location-outline" size={20} color="#666666" style={{ width: 25, marginLeft: 10, marginRight: 10, textAlign: 'center' }} />}
                                            selectedValue={city}
                                            onValueChange={value => setCity(value)}
                                            _selectedItem={{
                                                backgroundColor: '#eeeeee',
                                                endIcon: <Icon name="checkmark-circle" size={22} color="#2BBB86" style={{ right: 0, position: 'absolute' }} />
                                            }}>
                                            {cityList.map((item, index) =>
                                                <Select.Item key={index} label={item.city_name} value={item.city_id} />
                                            )}
                                        </Select>
                                    </View>
                                )}
                                <View style={styles.inputbox}>
                                    <Input size="lg" keyboardType='number-pad' maxLength={6} onChangeText={(text) => setPinCode(text)} variant="unstyled" InputLeftElement={<Icon name="location-outline" size={20} color="#666666" style={{ width: 25, marginLeft: 10, textAlign: 'center' }} />} placeholder={t("Pincode") + " *"} />
                                </View>
                            </Stack>
                            <HStack space={1} alignItems="center" justifyContent="space-evenly" bg="#eeeeee" borderRadius="10" overflow="hidden" padding="2" mt="6">
                                <LinearGradient
                                    colors={["#821700", "#f04e23"]}
                                    start={{ x: 0.5, y: 0 }}
                                    style={styles.optionbtn}
                                >
                                    <Button size="xs" variant="link" _text={{ color: "#ffffff", fontWeight: 'bold', fontSize: 13 }} onPress={() => onCancelAddress()}>{t("Close")}</Button>
                                </LinearGradient>
                                <LinearGradient
                                    colors={["#10764F", "#2BBB86"]}
                                    start={{ x: 0.5, y: 0 }}
                                    style={styles.optionbtn}
                                >
                                    <Button size="xs" variant="link" _text={{ color: "#ffffff", fontWeight: 'bold', fontSize: 13 }} onPress={() => onSaveAddress()}>{t("Save")}</Button>
                                </LinearGradient>
                            </HStack>
                        </Box>
                    </VStack>
                </TouchableWithoutFeedback>
            )}
            {successOrder && (
                <View style={styles.spincontainer}>
                    <LinearGradient
                        colors={[lightColor, darkColor]}
                        start={{ x: 0.5, y: 0 }}
                        style={{ width: 300, borderRadius: 15, overflow: 'hidden' }}
                    >
                        <VStack space={1} w="100%" paddingX="5" paddingY="10" alignItems="center" justifyContent="center">
                            <Icon name="checkmark-done-circle-outline" size={100} color="#111111"></Icon>
                            <Text mt={8} fontSize="xl" fontWeight="bold" color="#111111">{t("Thank You")}</Text>
                            <Text textAlign="center" fontSize="sm" fontWeight="medium" color="#111111" mb={3}>{t("Your order has been Placed Successfully")}.</Text>
                            <Button size="sm" style={{ backgroundColor: '#111111', width: 100, borderRadius: 10, overflow: 'hidden' }} onPress={() => onContinue()} marginY={4}>
                                <Text color="#ffffff" fontSize="sm" fontWeight="medium">{t("Continue")}</Text>
                            </Button>
                        </VStack>
                    </LinearGradient>
                </View>
            )}
            {loading && (
                <View style={styles.spincontainer}>
                    <ActivityIndicator animating={loading} size="large" color={darkColor} />
                </View>
            )}
        </NativeBaseProvider>
    );
};

const styles = StyleSheet.create({
    bgimage: { flex: 1, justifyContent: 'center' },
    inputbox: { backgroundColor: 'rgba(0,0,0,0.06)', borderRadius: 12, width: '100%', overflow: 'hidden', marginVertical: 0 },
    optionbtn: { backgroundColor: 'none', width: '46%', borderRadius: 8, overflow: 'hidden' },
    custbtn: { backgroundColor: 'none', borderRadius: 10 },
    note: { color: '#ffffff', width: 20, height: 20, borderRadius: 10, overflow: 'hidden', fontWeight: 'bold', fontSize: 16, lineHeight: 19, textAlign: 'center' },
    productbox: { borderRadius: 15, width: '96%', margin: '2%', backgroundColor: '#f6f6f6', borderColor: '#ffffff', borderWidth: 2, elevation: 10, shadowColor: '#666666', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.4, shadowRadius: 10, overflow: 'hidden' },
    spincontainer: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0, 0, 0, 0.8)' },
});

export default AddreessScreen;
