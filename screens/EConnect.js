import AsyncStorage from '@react-native-async-storage/async-storage';
import { Box, Button, HStack, Input, NativeBaseProvider, ScrollView, Select, Text, Toast } from 'native-base';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, StyleSheet, TouchableOpacity, StatusBar, View, Keyboard, ImageBackground } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import { API_KEY, BASE_URL, CONTACT_HIER_ID, ORG_ID, PROGRAM_ID } from '../auth_provider/Config';
import { useTranslation } from 'react-i18next';

const EConnectScreen = ({ navigation }) => {

    const { t } = useTranslation();

    const [loading, setLoading] = React.useState(false);
    const [lightColor, setLightColor] = React.useState("#cbf75e");
    const [darkColor, setDarkColor] = React.useState("#2BBB86");
    const [logoImage, setLogoImage] = React.useState("");

    const [openFor, setOpenFor] = React.useState("");
    const [showEngineer, setShowEngineer] = React.useState("false");


    const [productList, setProductList] = React.useState([]);
    const [customerName, setCustomerName] = React.useState("");
    const [mobileNumber, setMobileNumber] = React.useState("");
    const [proId, setProId] = React.useState("");

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
                fetch(`${BASE_URL}/get_master_product_list_for_esite_consultant`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                    body: formdata
                })
                    .then((response) => response.json())
                    .then((responseJson) => {
                        //console.log("Get:", responseJson);
                        if (responseJson.status == 'success') {
                            setLoading(false);
                            setProductList(responseJson.product_list);
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
                        //console.log("Get Error:", error);
                        Toast.show({ description: t("Sorry! Somthing went Wrong. Maybe Network request Failed") });
                    });
            } else {
                setLoading(false);
                AsyncStorage.clear();
                navigation.navigate('Login');
            }
        });
    }

    const onRequest = () => {
        Keyboard.dismiss();
        if (customerName.trim() == "") {
            Toast.show({ description: t("Please enter Customer Name") });
        } else if (mobileNumber.trim() == "") {
            Toast.show({ description: t("Please enter Customer Mobile Number") });
        } else if (mobileNumber.length < 10) {
            Toast.show({ description: t("Mobile Number should be 10 digits") });
        } else if (proId == "") {
            Toast.show({ description: t("Please select Product") });
        } else {
            setLoading(true);
            AsyncStorage.getItem('userToken').then(val => {
                if (val != null) {
                    let formdata = new FormData();
                    formdata.append("APIkey", `${API_KEY}`);
                    formdata.append("token", JSON.parse(val).token);
                    formdata.append("orgId", JSON.parse(val).org_id);
                    formdata.append("customer_name", customerName);
                    formdata.append("mobile_no", mobileNumber);
                    formdata.append("saleProduct", proId);
                    fetch(`${BASE_URL}/consultant_registration`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'multipart/form-data',
                        },
                        body: formdata
                    })
                        .then((response) => response.json())
                        .then((responseJson) => {
                            //console.log("Request:", responseJson);
                            if (responseJson.status == 'success') {
                                Toast.show({ description: responseJson.message });
                                setTimeout(function () {
                                    setLoading(false);
                                    navigation.goBack();
                                }, 1000);
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
                            //console.log("Request Error:", error);
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
                        <Text color="#111111" fontSize="16" textAlign="center" fontWeight="bold" textTransform="capitalize">{t("E-Consultant")}</Text>
                        <Image source={logoImage ? { uri: logoImage } : require('../assets/images/logo.png')} style={{ width: 60, height: 25, resizeMode: 'contain' }} />
                    </HStack>
                </LinearGradient>
                <ImageBackground source={require('../assets/images/bg.jpg')} imageStyle={{ resizeMode: 'contain', position: 'absolute', bottom: 0, top: '65%', opacity: 0.6 }} style={styles.bgimage}>
                    <ScrollView>
                        <LinearGradient
                            colors={[lightColor, darkColor]}
                            style={{ height: 150, position: 'absolute', top: 0, width: '100%', borderBottomEndRadius: 100, borderBottomStartRadius: 100, overflow: 'hidden' }}
                            start={{ x: 0.5, y: 0 }}
                        ></LinearGradient>
                        <Box padding="5">
                            <Box style={styles.productbox}>
                                <View style={styles.inputbox}>
                                    <Input size="lg" onChangeText={(text) => setCustomerName(text)} variant="unstyled" InputLeftElement={<Icon name="person-outline" size={20} color="#666666" style={{ width: 25, marginLeft: 10, textAlign: 'center' }} />} placeholder={t("Customer Name") + " *"} />
                                </View>
                                <View style={styles.inputbox}>
                                    <Input size="lg" keyboardType='number-pad' maxLength={10} onChangeText={(text) => setMobileNumber(text)} variant="unstyled" InputLeftElement={<Icon name="phone-portrait-outline" size={20} color="#666666" style={{ width: 25, marginLeft: 10, textAlign: 'center' }} />} placeholder={t("Customer Mobile Number") + " *"} />
                                </View>
                                <View style={styles.inputbox}>
                                    <Select variant="underlined" size="lg" placeholder={t("Select Product") + " *"}
                                        InputLeftElement={<Icon name="grid-outline" size={20} color="#666666" style={{ width: 25, marginLeft: 10, marginRight: 10, textAlign: 'center' }} />}
                                        selectedValue={proId}
                                        onValueChange={value => setProId(value)}
                                        _selectedItem={{
                                            backgroundColor: '#eeeeee',
                                            endIcon: <Icon name="checkmark-circle" size={22} color="#2BBB86" style={{ right: 0, position: 'absolute' }} />
                                        }}>
                                        {productList.map((item, index) =>
                                            <Select.Item key={index} label={item.product_name} value={item.product_name} />
                                        )}
                                    </Select>
                                </View>
                            </Box>
                        </Box>
                    </ScrollView>
                </ImageBackground>
                <LinearGradient
                    colors={[darkColor, lightColor]}
                    start={{ x: 0.5, y: 0 }}
                >
                    <HStack paddingY="3" paddingX="6" justifyContent="space-between" alignContent="center">
                        <Button style={[styles.custbtn, { borderColor: '#111111', borderWidth: 2 }]} onPress={() => onRequest()}>
                            <Text color="#ffffff" fontSize="md" fontWeight="medium">{t("Send Request")}</Text>
                        </Button>
                    </HStack>
                </LinearGradient>
            </Box>
            {loading && (
                <View style={styles.spincontainer}>
                    <ActivityIndicator animating={loading} size="large" color={darkColor} />
                </View>
            )}
        </NativeBaseProvider>
    )
}

const styles = StyleSheet.create({
    bgimage: { flex: 1, justifyContent: 'center' },
    productbox: { borderRadius: 15, width: '96%', margin: '2%', backgroundColor: '#f6f6f6', padding: 15, borderColor: '#ffffff', borderWidth: 2, elevation: 10, shadowColor: '#666666', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.4, shadowRadius: 10, overflow: 'hidden' },
    inputbox: { backgroundColor: 'rgba(0,0,0,0.06)', borderRadius: 12, width: '100%', overflow: 'hidden', marginVertical: 7 },
    custbtn: { width: '100%', backgroundColor: '#111111', borderRadius: 12, overflow: 'hidden' },
    spincontainer: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0, 0, 0, 0.8)' },
});

export default EConnectScreen;
