import AsyncStorage from '@react-native-async-storage/async-storage';
import { Box, HStack, NativeBaseProvider, Text, VStack, Toast, Button, Stack, Input, Checkbox, AlertDialog } from 'native-base';
import React, { useEffect } from 'react';
import Icon from 'react-native-vector-icons/Ionicons';
import { ActivityIndicator, Image, ImageBackground, Keyboard, ScrollView, StatusBar, StyleSheet, TouchableOpacity, TouchableWithoutFeedback, View, useWindowDimensions } from 'react-native';
import { API_KEY, BASE_URL, CONTACT_HIER_ID, ORG_ID, PROGRAM_ID } from '../auth_provider/Config';
import LinearGradient from 'react-native-linear-gradient';
import RenderHTML from 'react-native-render-html';
import { useTranslation } from 'react-i18next';

const GiftVouchersScreen = ({ navigation }) => {

    const { t } = useTranslation();

    const { width } = useWindowDimensions();

    const [loading, setLoading] = React.useState(false);
    const [lightColor, setLightColor] = React.useState("#cbf75e");
    const [darkColor, setDarkColor] = React.useState("#2BBB86");
    const [logoImage, setLogoImage] = React.useState("");
    const [dataFound, setDataFound] = React.useState("");

    const [allVouchers, setAllVouchers] = React.useState([]);

    const [pop, setPop] = React.useState(false);

    const [phoneNum, setPhoneNum] = React.useState('');
    const [otp, setOtp] = React.useState('');

    const [otpVerification, setOtpVerification] = React.useState(false);

    const [itemDetails, setItemDetails] = React.useState("");
    const [otpId, setOtpId] = React.useState("");
    const [termsCheck, setTermsCheck] = React.useState(false);

    const [isOpen, setIsOpen] = React.useState(false);
    const onClose = () => setIsOpen(false);
    const cancelRef = React.useRef(null);

    const [contentDetails, setContentDetails] = React.useState("");

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            setLoading(true);
            getAllData();
        });
        return unsubscribe;
    }, []);

    const getAllData = () => {
        AsyncStorage.getItem('userToken').then(val => {
            if (val != null) {
                setLogoImage(JSON.parse(val).logo_url);

                setLightColor(JSON.parse(val).info.theme_color.light);
                setDarkColor(JSON.parse(val).info.theme_color.dark);

                let formdata = new FormData();
                formdata.append("APIkey", `${API_KEY}`);
                formdata.append("token", JSON.parse(val).token);
                formdata.append("orgId", JSON.parse(val).org_id);
                fetch(`${BASE_URL}/voucher_list`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                    body: formdata
                })
                    .then((response) => response.json())
                    .then((responseJson) => {
                        //console.log("Voucher:", responseJson);
                        if (responseJson.status == 'success') {
                            setLoading(false);
                            setAllVouchers(responseJson.vouchers);
                            if (responseJson.vouchers.length != 0) {
                                setDataFound("found");
                            } else {
                                setDataFound("notfound");
                            }
                        } else {
                            Toast.show({ description: responseJson.message });
                            setDataFound("notfound");
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
                        //console.log("Voucher Error:", error);
                        Toast.show({ description: t("Sorry! Somthing went Wrong. Maybe Network request Failed") });
                    });
            } else {
                setLoading(false);
                AsyncStorage.clear();
                navigation.navigate('Login');
            }
        });
    }

    const unlockVoucher = (details) => {
        setItemDetails(details);
        setPop(true);
    }

    const onCancel = () => {
        setPop(false);
        setPhoneNum("");
        setOtp("");
        setOtpVerification(false);
        setTermsCheck(false);
    }

    const sendOtp = () => {
        Keyboard.dismiss()
        if (phoneNum.trim() == '') {
            Toast.show({ description: t("Please enter Registered Phone Number") });
        } else {
            setLoading(true);
            AsyncStorage.getItem('userToken').then(val => {
                if (val != null) {
                    let formdata = new FormData();
                    formdata.append("APIkey", `${API_KEY}`);
                    formdata.append("token", JSON.parse(val).token);
                    formdata.append("orgId", JSON.parse(val).org_id);
                    formdata.append("skuId", itemDetails.inv_sku_id);
                    formdata.append("mobileNumber", phoneNum);
                    formdata.append("productName", itemDetails.product_name);
                    formdata.append("lockedCode", itemDetails.locked_code);
                    fetch(`${BASE_URL}/registered_mobile_number_verification`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'multipart/form-data',
                        },
                        body: formdata
                    })
                        .then((response) => response.json())
                        .then((responseJson) => {
                            setLoading(false);
                            //console.log("Get OTP:", responseJson);
                            if (responseJson.status == 'success') {
                                Toast.show({ description: responseJson.message });
                                setOtpVerification(true);
                                setOtpId(responseJson.verification_respons.otp_id);
                                getContent();
                            } else {
                                Toast.show({ description: responseJson.message });
                            }
                        })
                        .catch((error) => {
                            setLoading(false);
                            //console.log("OTP Error:", error);
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

    const onVerify = () => {
        Keyboard.dismiss();
        if (otp.trim() == '') {
            Toast.show({ description: t("Please enter OTP") });
        } else if (termsCheck == false) {
            Toast.show({ description: t("Please accept Terms & Condition") });
        } else {
            setLoading(true);
            AsyncStorage.getItem('userToken').then(val => {
                if (val != null) {
                    let formdata = new FormData();
                    formdata.append("APIkey", `${API_KEY}`);
                    formdata.append("token", JSON.parse(val).token);
                    formdata.append("orgId", JSON.parse(val).org_id);
                    formdata.append("skuId", itemDetails.inv_sku_id);
                    formdata.append("otpId", otpId);
                    formdata.append("is_tnc_checked", termsCheck);
                    formdata.append("otp", otp);
                    fetch(`${BASE_URL}/voucher_otp_verification`, {
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
                                Toast.show({ description: responseJson.message });
                                onCancel();
                                getAllData();
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

    const getContent = () => {
        AsyncStorage.getItem('userToken').then(val => {
            if (val != null) {
                let formdata = new FormData();
                formdata.append("APIkey", `${API_KEY}`);
                formdata.append("token", JSON.parse(val).token);
                formdata.append("orgId", JSON.parse(val).org_id);
                formdata.append("contentSpotCode", "vriddhiAppVoucherCodeTermsAndConditions");
                fetch(`${BASE_URL}/general_content_spot`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                    body: formdata
                })
                    .then((response) => response.json())
                    .then((responseJson) => {
                        setLoading(false);
                        //console.log("Content:", JSON.stringify(responseJson));
                        if (responseJson.status == 'success') {
                            setContentDetails(responseJson.content_spot_details.content_spot_contents[0]);
                        } else {
                            Toast.show({ description: responseJson.message });
                        }
                    })
                    .catch((error) => {
                        setLoading(false);
                        //console.log("Content Error:", error);
                        Toast.show({ description: t("Sorry! Somthing went Wrong. Maybe Network request Failed") });
                    });
            } else {
                setLoading(false);
                AsyncStorage.clear();
                navigation.navigate('Login');
            }
        });
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
                        <Text color="#111111" fontSize="16" textAlign="center" fontWeight="bold" textTransform="capitalize">{t("Gift Vouchers")}</Text>
                        <Image source={logoImage ? { uri: logoImage } : require('../assets/images/logo.png')} style={{ width: 60, height: 25, resizeMode: 'contain' }} />
                    </HStack>
                </LinearGradient>
                <ImageBackground source={require('../assets/images/bg.jpg')} imageStyle={{ resizeMode: 'contain', position: 'absolute', bottom: 0, top: '65%', opacity: allVouchers.length < 3 ? 0.6 : 0 }} style={styles.bgimage}>
                    <ScrollView>
                        <LinearGradient
                            colors={[lightColor, darkColor]}
                            style={{ height: 150, position: 'absolute', top: 0, width: '100%', borderBottomEndRadius: 100, borderBottomStartRadius: 100, overflow: 'hidden' }}
                            start={{ x: 0.5, y: 0 }}
                        ></LinearGradient>
                        <Box padding="5">
                            {dataFound == "notfound" && (
                                <Stack space={5} style={[styles.productbox, { height: 350, justifyContent: 'center', alignItems: 'center', padding: 30 }]}>
                                    <Icon name="hourglass-outline" size={80} color="#999999" />
                                    <Text fontSize='lg' fontWeight="bold" textAlign="center" color="#111111">{t("Result Not Found")}</Text>
                                    <Text fontSize='sm' fontWeight="medium" textAlign="center" color="#666666">{t("Whoops... This Information is not available for a moment")}</Text>
                                </Stack>
                            )}
                            {dataFound == "found" && (
                                <VStack>
                                    {allVouchers.map((item, index) =>
                                        <Box key={index} style={styles.productbox}>
                                            <HStack space="4">
                                                <Box style={styles.productimage}>
                                                    <Image source={item.prod_img ? { uri: item.BaseUrl + item.prod_img } : require('../assets/images/noimage.jpg')} style={{ width: 100, height: 90 }} resizeMode='contain' />
                                                </Box>
                                                <VStack style={styles.productdetails} space="1">
                                                    <Text fontSize='sm' fontWeight="bold" mb="2">{item.product_name}</Text>
                                                    <HStack space="2" alignItems="center">
                                                        <Text fontSize='xs'>{t("Order No")}:</Text>
                                                        <Text fontSize='sm' fontWeight="medium">{item.order_id}</Text>
                                                    </HStack>
                                                    <HStack space="2" alignItems="center" flexWrap="wrap">
                                                        <Text fontSize='xs'>{t("Code")}:</Text>
                                                        {item.is_code_visible ?
                                                            <Text fontSize='sm' fontWeight="medium"> {item.sku_code}</Text>
                                                            :
                                                            <Text fontSize='sm' fontWeight="medium">{item.locked_code}</Text>
                                                        }
                                                    </HStack>
                                                    {!item.is_code_visible && (
                                                        <LinearGradient
                                                            colors={[lightColor, darkColor]}
                                                            start={{ x: 0.5, y: 0 }}
                                                            style={styles.custbtn}
                                                        >
                                                            <Button size="sm" variant="link" _text={{ color: "#111111", fontWeight: 'bold', fontSize: 13 }} onPress={() => unlockVoucher(item)}>{t("Unlock")}</Button>
                                                        </LinearGradient>
                                                    )}
                                                    {item.is_code_visible && (
                                                        <HStack space="2" alignItems="center" flexWrap="wrap">
                                                            <Text fontSize='xs'>{t("Pin")}:</Text>
                                                            <Text fontSize='sm' fontWeight="medium">{item.activation_pin}</Text>
                                                        </HStack>
                                                    )}
                                                    <HStack space="2" alignItems="center" flexWrap="wrap">
                                                        <Text fontSize='xs'>{t("Validity")}:</Text>
                                                        <Text fontSize='xs' fontWeight="medium">{item.sku_valid_till}</Text>
                                                    </HStack>
                                                </VStack>
                                            </HStack>
                                        </Box>
                                    )}
                                </VStack>
                            )}
                        </Box>
                    </ScrollView>
                </ImageBackground>
            </Box>
            {loading && (
                <View style={styles.spincontainer}>
                    <ActivityIndicator animating={loading} size="large" color={darkColor} />
                </View>
            )}
            {pop && (
                <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
                    <VStack flex={1} style={{ backgroundColor: "rgba(0,0,0,0.85)", position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center', padding: 30 }}>
                        <Box style={styles.productbox}>
                            {!otpVerification ?
                                <Stack space={5} alignItems="center">
                                    <Text color="#444444" fontSize="md" fontWeight="bold">{t("Phone Verification")}</Text>
                                    <View style={styles.inputbox}>
                                        <Input size="lg" keyboardType='number-pad' maxLength={10} onChangeText={(text) => setPhoneNum(text)} variant="unstyled" InputLeftElement={<Icon name="phone-portrait-outline" size={20} color="#f04e23" style={{ width: 25, marginLeft: 10, textAlign: 'center' }} />} placeholder={t("Phone Number") + " *"} />
                                    </View>
                                </Stack>
                                :
                                <Stack space={3} alignItems="center">
                                    <Text color="#444444" fontSize="md" fontWeight="bold">{t("OTP Verification")}</Text>
                                    <View style={styles.inputbox}>
                                        <Input size="lg" onChangeText={(text) => setOtp(text)} keyboardType='number-pad' maxLength={6} variant="unstyled" InputLeftElement={<Icon name="key-outline" size={20} color="#f04e23" style={{ width: 25, marginLeft: 10, textAlign: 'center' }} />} placeholder={t("Enter OTP") + " *"} />
                                    </View>
                                    <TouchableOpacity style={{ alignSelf: 'center' }} onPress={() => sendOtp()}>
                                        <Text color="#f04e23" fontSize="md" fontWeight="bold" textAlign="center">{t("Resend OTP")}?</Text>
                                    </TouchableOpacity>
                                    <Stack space={2} marginTop="4">
                                        <Checkbox shadow={2} onChange={() => setTermsCheck(!termsCheck)} accessibilityLabel="Checkbox">
                                            {t("I accept the terms & conditions")}
                                        </Checkbox>
                                        <TouchableOpacity style={{ alignSelf: 'center' }} onPress={() => setIsOpen(!isOpen)}>
                                            <Text color="#f04e23" fontSize="sm" fontWeight="medium" textAlign="center">{t("Read Terms & Condition")}</Text>
                                        </TouchableOpacity>
                                    </Stack>
                                </Stack>
                            }
                            <HStack space={1} alignItems="center" justifyContent="space-evenly" bg="#eeeeee" borderRadius="10" overflow="hidden" padding="2" mt="6">
                                <LinearGradient
                                    colors={["#821700", "#f04e23"]}
                                    start={{ x: 0.5, y: 0 }}
                                    style={styles.optionbtn}
                                >
                                    <Button size="xs" variant="link" _text={{ color: "#ffffff", fontWeight: 'bold', fontSize: 13 }} onPress={() => onCancel()}>{t("Close")}</Button>
                                </LinearGradient>
                                {!otpVerification ?
                                    <LinearGradient
                                        colors={["#10764F", "#2BBB86"]}
                                        start={{ x: 0.5, y: 0 }}
                                        style={styles.optionbtn}
                                    >
                                        <Button size="xs" variant="link" _text={{ color: "#ffffff", fontWeight: 'bold', fontSize: 13 }} onPress={() => sendOtp()}>{t("Send")}</Button>
                                    </LinearGradient>
                                    :
                                    <LinearGradient
                                        colors={["#10764F", "#2BBB86"]}
                                        start={{ x: 0.5, y: 0 }}
                                        style={styles.optionbtn}
                                    >
                                        <Button size="xs" variant="link" _text={{ color: "#ffffff", fontWeight: 'bold', fontSize: 13 }} onPress={() => onVerify()}>{t("Verify")}</Button>
                                    </LinearGradient>
                                }
                            </HStack>
                        </Box>
                    </VStack>
                </TouchableWithoutFeedback>
            )}
            <AlertDialog leastDestructiveRef={cancelRef} isOpen={isOpen} onClose={onClose}>
                <AlertDialog.Content style={{ width: 320 }}>
                    <AlertDialog.CloseButton />
                    <AlertDialog.Header><Text style={{ fontSize: 18, fontWeight: 'bold', marginRight: 40 }}>{contentDetails.title}</Text></AlertDialog.Header>
                    <AlertDialog.Body>
                        <RenderHTML contentWidth={width} baseStyle={{ color: '#444444', fontSize: 14 }} source={{ html: contentDetails.article_detail }} />
                    </AlertDialog.Body>
                </AlertDialog.Content>
            </AlertDialog>
        </NativeBaseProvider>
    );
};

const styles = StyleSheet.create({
    bgimage: { flex: 1, justifyContent: 'center' },
    inputbox: { backgroundColor: 'rgba(0,0,0,0.06)', borderRadius: 12, width: '100%', overflow: 'hidden', marginVertical: 7 },
    optionbtn: { backgroundColor: 'none', width: '46%', borderRadius: 8, overflow: 'hidden' },
    custbtn: { backgroundColor: 'none', width: 80, borderRadius: 10, marginTop: 10 },
    productbox: { borderRadius: 15, width: '96%', margin: '2%', backgroundColor: '#f6f6f6', padding: 15, borderColor: '#ffffff', borderWidth: 2, elevation: 10, shadowColor: '#666666', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.4, shadowRadius: 10, },
    productimage: { borderColor: '#dddddd', backgroundColor: '#ffffff', borderWidth: 1, borderRadius: 10, width: '38%', height: 90, justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
    productdetails: { width: '58%' },
    spincontainer: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0, 0, 0, 0.8)', zIndex: 99 },
});

export default GiftVouchersScreen;