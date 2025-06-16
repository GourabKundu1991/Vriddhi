import AsyncStorage from '@react-native-async-storage/async-storage';
import { Actionsheet, Box, Button, HStack, Input, NativeBaseProvider, Radio, ScrollView, Select, Stack, Text, Toast, VStack, useDisclose } from 'native-base';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, StyleSheet, TouchableOpacity, StatusBar, View, Keyboard, Pressable, ImageBackground } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import { API_KEY, BASE_URL, CONTACT_HIER_ID, ORG_ID, PROGRAM_ID } from '../auth_provider/Config';
import { useTranslation } from 'react-i18next';

const RegisterLiftingScreen = ({ navigation }) => {

    const { t } = useTranslation();

    const [loading, setLoading] = React.useState(false);
    const [lightColor, setLightColor] = React.useState("#cbf75e");
    const [darkColor, setDarkColor] = React.useState("#2BBB86");
    const [cameraColor, setCameraColor] = React.useState("#f04e23");
    const [logoImage, setLogoImage] = React.useState("");

    const [openFor, setOpenFor] = React.useState("");
    const [showEngineer, setShowEngineer] = React.useState("false");

    const [searchTerm, setSearchTerm] = React.useState("");
    const [dealerList, setDealerList] = React.useState([]);
    const [dealer, setDealer] = React.useState("");
    const [productList, setProductList] = React.useState([]);
    const [prod, setProd] = React.useState("");
    const [qty, setQty] = React.useState("");
    const [customerName, setCustomerName] = React.useState("");
    const [mobileNumber, setMobileNumber] = React.useState("");
    const [address, setAddress] = React.useState("");
    const [state, setState] = React.useState("");
    const [stateList, setStateList] = React.useState([]);
    const [district, setDistrict] = React.useState("");
    const [districtList, setDistrictList] = React.useState([]);
    const [pinCode, setPinCode] = React.useState("");
    const [saleMessage, setSaleMessage] = React.useState("");

    const { isOpen, onOpen, onClose } = useDisclose();

    const [isStateOpen, setIsStateOpen] = React.useState(false);

    const [isWindowOpen, setIsWindowOpen] = React.useState(false);

    const [baseUrl, setBaseUrl] = React.useState("");

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
                setBaseUrl(JSON.parse(val).BaseUrl);

                setLightColor(JSON.parse(val).info.theme_color.light);
                setDarkColor(JSON.parse(val).info.theme_color.dark);

                let formdata = new FormData();
                formdata.append("APIkey", `${API_KEY}`);
                formdata.append("token", JSON.parse(val).token);
                formdata.append("orgId", JSON.parse(val).org_id);
                fetch(`${BASE_URL}/get_product_master_and_dealer_company_list`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                    body: formdata
                })
                    .then((response) => response.json())
                    .then((responseJson) => {
                        //console.log("Get:", JSON.stringify(responseJson));
                        if (responseJson.status == 'success') {
                            setOpenFor(responseJson.open_for);
                            setShowEngineer(responseJson.show_engineer_view);
                            setIsWindowOpen(true);
                            if (responseJson.show_engineer_view == "true") {
                                setProductList(responseJson.product_list);
                                getDefaultInfo();
                            } else {
                                setLoading(false);
                            }
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

    const getDefaultInfo = () => {
        AsyncStorage.getItem('userToken').then(val => {
            if (val != null) {
                let formdata = new FormData();
                formdata.append("APIkey", `${API_KEY}`);
                formdata.append("token", JSON.parse(val).token);
                formdata.append("orgId", JSON.parse(val).org_id);
                fetch(`${BASE_URL}/get_default_info`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                    body: formdata
                })
                    .then((response) => response.json())
                    .then((responseJson) => {
                        console.log("Get Info:", responseJson);
                        setLoading(false);
                        if (responseJson.status == 'success') {
                            setStateList(responseJson.states);
                        } else {
                            Toast.show({ description: responseJson.message });
                        }
                    })
                    .catch((error) => {
                        setLoading(false);
                        console.log("Get Info Error:", error);
                        Toast.show({ description: t("Sorry! Somthing went Wrong. Maybe Network request Failed") });
                    });
            } else {
                setLoading(false);
                AsyncStorage.clear();
                navigation.navigate('Login');
            }
        });
    }

    const searchDealer = () => {
        if (searchTerm.trim() == "") {
            Toast.show({ description: t("Please enter some Dealer Data") });
        } else {
            Keyboard.dismiss();
            setLoading(true);
            AsyncStorage.getItem('userToken').then(val => {
                if (val != null) {
                    let formdata = new FormData();
                    formdata.append("APIkey", `${API_KEY}`);
                    formdata.append("token", JSON.parse(val).token);
                    formdata.append("orgId", JSON.parse(val).org_id);
                    formdata.append("keyword", searchTerm);
                    fetch(`${BASE_URL}/dealer_listing`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'multipart/form-data',
                        },
                        body: formdata
                    })
                        .then((response) => response.json())
                        .then((responseJson) => {
                            console.log("Dealer:", responseJson);
                            setProductList([]);
                            if (responseJson.status == 'success') {
                                setLoading(false);
                                setDealerList(responseJson.dealer_list);
                                setDealer("");
                            } else {
                                Toast.show({ description: responseJson.message });
                                setDealerList([]);
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
                            //console.log("Dealer Error:", error);
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

    const onSelectDealer = (id) => {
        setLoading(true);
        setDealer(id);
        AsyncStorage.getItem('userToken').then(val => {
            if (val != null) {
                let formdata = new FormData();
                formdata.append("APIkey", `${API_KEY}`);
                formdata.append("token", JSON.parse(val).token);
                formdata.append("orgId", JSON.parse(val).org_id);
                formdata.append("dealer_id", id);
                console.log(formdata);
                fetch(`${BASE_URL}/get_product_by_dealer_id`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                    body: formdata
                })
                    .then((response) => response.json())
                    .then((responseJson) => {
                        console.log("Product:", JSON.stringify(responseJson));
                        if (responseJson.status == 'success') {
                            setLoading(false);
                            setProductList(responseJson.group);
                        } else {
                            Toast.show({ description: responseJson.message });
                            setProductList([]);
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
                        console.log("Product Error:", error);
                        Toast.show({ description: t("Sorry! Somthing went Wrong. Maybe Network request Failed") });
                    });
            } else {
                setLoading(false);
                AsyncStorage.clear();
                navigation.navigate('Login');
            }
        });
    }

    const onSelectProduct = (pro) => {
        setLoading(true);
        setProd(pro);
        AsyncStorage.getItem('userToken').then(val => {
            if (val != null) {
                let formdata = new FormData();
                formdata.append("APIkey", `${API_KEY}`);
                formdata.append("token", JSON.parse(val).token);
                formdata.append("orgId", JSON.parse(val).org_id);
                formdata.append("product_id", pro.product_Id);
                fetch(`${BASE_URL}/get_total_sale_for_product`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                    body: formdata
                })
                    .then((response) => response.json())
                    .then((responseJson) => {
                        //console.log("Sale For Product:", responseJson);
                        onClose();
                        if (responseJson.status == 'success') {
                            setLoading(false);
                            setSaleMessage(responseJson.sale_register_message);
                            setQty("");
                            setCustomerName("");
                            setMobileNumber("");
                            setAddress("");
                            setState("");
                            setDistrict("");
                            setPinCode("");
                        } else {
                            Toast.show({ description: responseJson.message });
                            setSaleMessage("");
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
                        //console.log("Sale For Product Error:", error);
                        Toast.show({ description: t("Sorry! Somthing went Wrong. Maybe Network request Failed") });
                    });
            } else {
                setLoading(false);
                AsyncStorage.clear();
                navigation.navigate('Login');
            }
        });
    }

    const onStateOpen = () => {
        setIsStateOpen(true);
    }
    const onStateClose = () => {
        setIsStateOpen(false);
    }

    const onSelectState = (details) => {
        setState(details);
        setDistrict("");
        setDistrictList(details.district_list);
        onStateClose();
    }

    const onRegister = () => {
        Keyboard.dismiss();
        if (showEngineer != "true" && searchTerm.trim() == "") {
            Toast.show({ description: t("Please search Dealer and Select Dealer") });
        } else if (showEngineer != "true" && dealerList.length != 0 && dealer == "") {
            Toast.show({ description: t("Please Select Dealer") });
        } else if (showEngineer == "true" && prod == "") {
            Toast.show({ description: t("Please select Product") });
        } else if (showEngineer == "true" && qty.trim() == "") {
            Toast.show({ description: t("Please enter Quantity") });
        } else if (showEngineer == "true" && customerName.trim() == "") {
            Toast.show({ description: t("Please enter Customer Name") });
        } else if (showEngineer == "true" && mobileNumber.trim() == "") {
            Toast.show({ description: t("Please enter Mobile Number") });
        } else if (showEngineer == "true" && mobileNumber.length < 10) {
            Toast.show({ description: t("Mobile Number should be 10 digits") });
        } else if (showEngineer == "true" && state == "") {
            Toast.show({ description: t("Please select State") });
        } else if (showEngineer == "true" && state != "" && district == "") {
            Toast.show({ description: t("Please select District") });
        } else {
            setLoading(true);
            AsyncStorage.getItem('userToken').then(val => {
                if (val != null) {
                    let formdata = new FormData();
                    formdata.append("APIkey", `${API_KEY}`);
                    formdata.append("token", JSON.parse(val).token);
                    formdata.append("orgId", JSON.parse(val).org_id);
                    formdata.append("dealer_contact_id", dealer);
                    formdata.append("prodMasId", prod == "" ? '' : prod.product_Id);
                    formdata.append("saleQuantity", qty);
                    formdata.append("customer_name", customerName);
                    formdata.append("mobile_number", mobileNumber);
                    formdata.append("address", address);
                    formdata.append("dcm_states_id", state == "" ? '' : state.id);
                    formdata.append("dcm_cities_id", district);
                    formdata.append("permanent_post_code", pinCode);
                    console.log(formdata);
                    fetch(`${BASE_URL}/enter_sale_data_modify`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'multipart/form-data',
                        },
                        body: formdata
                    })
                        .then((response) => response.json())
                        .then((responseJson) => {
                            console.log("Modify:", responseJson);
                            if (responseJson.status == 'success') {
                                Toast.show({ description: responseJson.message });
                                setLoading(false);
                                setSearchTerm("");
                                setDealer("");
                                setProd("");
                                setQty("");
                                setCustomerName("");
                                setMobileNumber("");
                                setAddress("");
                                setState("");
                                setDistrict("");
                                setPinCode("");
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
                            console.log("Modify Error:", error);
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
                        <Text color="#111111" fontSize="16" textAlign="center" fontWeight="bold" textTransform="capitalize">{t("Register Lifting")}</Text>
                        <Image source={logoImage ? { uri: logoImage } : require('../assets/images/logo.png')} style={{ width: 60, height: 25, resizeMode: 'contain' }} />
                    </HStack>
                </LinearGradient>
                <ImageBackground source={require('../assets/images/bg.jpg')} imageStyle={{ resizeMode: 'contain', position: 'absolute', bottom: 0, top: '65%', opacity: !isWindowOpen && showEngineer == "false" ? 0.6 : 0 }} style={styles.bgimage}>
                    <ScrollView>
                        <LinearGradient
                            colors={[lightColor, darkColor]}
                            style={{ height: 150, position: 'absolute', top: 0, width: '100%', borderBottomEndRadius: 100, borderBottomStartRadius: 100, overflow: 'hidden' }}
                            start={{ x: 0.5, y: 0 }}
                        ></LinearGradient>
                        {isWindowOpen ?
                            <Box padding="5">
                                <Box style={styles.productbox}>
                                    <Text color={cameraColor} fontSize="15" fontWeight="bold" textAlign="center" mb="5">{openFor}</Text>
                                    {showEngineer != "true" && (
                                        <HStack mb="5" justifyContent="space-between">
                                            <View style={[styles.inputbox, { width: '70%' }]}>
                                                <Input size="lg" value={searchTerm} onChangeText={(text) => setSearchTerm(text)} variant="unstyled" InputLeftElement={<Icon name="search-outline" size={20} color="#666666" style={{ width: 25, marginLeft: 10, textAlign: 'center' }} />} placeholder={t("Search Dealer") + " *"} />
                                            </View>
                                            <Button size="xs" style={[styles.custbtn, { width: '25%', marginVertical: 7, backgroundColor: "#777777" }]} onPress={() => searchDealer()}>
                                                <Text color="#ffffff" fontSize="md" fontWeight="medium">{t("Search")}</Text>
                                            </Button>
                                        </HStack>
                                    )}
                                    {dealerList.length != 0 && (
                                        <View>
                                            <Text color="#666666" fontSize="md" textAlign="center">{t("Please Select Dealer")}</Text>
                                            <View style={[styles.inputbox, { paddingHorizontal: 15 }]}>
                                                <Radio.Group name="myRadioGroup" accessibilityLabel="favorite number" value={dealer} onChange={value => {
                                                    onSelectDealer(value);
                                                }}>
                                                    {dealerList.map((item, index) =>
                                                        <Radio key={index} colorScheme="black" value={item.id}>
                                                            <VStack marginY={3}>
                                                                <Text color="#111111" fontSize="md" fontWeight="bold">{item.firm_name}</Text>
                                                                <Text color="#444444" fontSize="sm" fontWeight="medium">{item.value}</Text>
                                                            </VStack>
                                                        </Radio>
                                                    )}
                                                </Radio.Group>
                                            </View>
                                        </View>
                                    )}
                                    {productList.length != 0 && (
                                        <View>
                                            <Pressable style={styles.inputbox} onPress={onOpen}>
                                                <Input size="lg" readOnly variant="unstyled" value={prod.product_name}
                                                    InputLeftElement={<Icon name="apps-outline" size={20} color="#666666" style={{ width: 25, marginLeft: 10, textAlign: 'center' }} />}
                                                    InputRightElement={<Icon name="chevron-down-outline" size={30} color="#777777" style={{ width: 25, marginRight: 10, textAlign: 'center' }} />}
                                                    placeholder={t("Please Select Product") + " *"} />
                                            </Pressable>
                                            {saleMessage != "" && (
                                                <Text color={cameraColor} fontSize="sm" fontWeight="medium" textAlign="center" mb="2">{saleMessage}</Text>
                                            )}
                                            <Actionsheet isOpen={isOpen} onClose={onClose}>
                                                <Actionsheet.Content>
                                                    <ScrollView w="100%">
                                                        {productList.map((item, index) =>
                                                            <Box w="90%" key={index} justifyContent="center" marginX="5%" marginY="2" borderRadius={10} overflow="hidden" borderColor="#dddddd" borderWidth="1">
                                                                <Text fontSize="lg" textAlign="center" fontWeight="bold" color={darkColor} bg="#eeeeee" padding="2">
                                                                    {item.name} {t("Products")}
                                                                </Text>
                                                                <HStack justifyContent="center" flexWrap="wrap" padding={5}>
                                                                    {item.list.map((pro, ind) =>
                                                                        <TouchableOpacity onPress={() => onSelectProduct(pro)} key={ind} style={{ width: '42%', margin: '2%', alignItems: 'center' }}>
                                                                            <VStack background="#ffffff" borderColor={prod.product_name == pro.product_name ? darkColor : "#eeeeee"} borderStyle="solid" borderWidth="2" style={{ width: '100%', alignItems: 'center', height: 130, borderRadius: 12, overflow: 'hidden', justifyContent: 'center' }}>
                                                                                <Image source={{ uri: baseUrl + pro.product_image }} style={{ width: 60, height: 90, resizeMode: 'contain' }} />
                                                                                <Text fontSize="sm" textAlign="center" fontWeight="bold" mb="3">{pro.product_name}</Text>
                                                                            </VStack>
                                                                        </TouchableOpacity>
                                                                    )}
                                                                </HStack>
                                                            </Box>
                                                        )}
                                                    </ScrollView>
                                                </Actionsheet.Content>
                                            </Actionsheet>
                                            <View style={styles.inputbox}>
                                                <Input size="lg" value={qty} onChangeText={(text) => setQty(text)} variant="unstyled" InputLeftElement={<Icon name="options-outline" size={20} color="#666666" style={{ width: 25, marginLeft: 10, textAlign: 'center' }} />} placeholder={t("Quantity") + " *"} />
                                            </View>
                                        </View>
                                    )}
                                    {showEngineer == "true" && (
                                        <Box mt="5">
                                            <View style={styles.inputbox}>
                                                <Input size="lg" value={customerName} onChangeText={(text) => setCustomerName(text)} variant="unstyled" InputLeftElement={<Icon name="person-outline" size={20} color="#666666" style={{ width: 25, marginLeft: 10, textAlign: 'center' }} />} placeholder={t("Customer Name") + " *"} />
                                            </View>
                                            <View style={styles.inputbox}>
                                                <Input size="lg" value={mobileNumber} keyboardType='number-pad' maxLength={10} onChangeText={(text) => setMobileNumber(text)} variant="unstyled" InputLeftElement={<Icon name="phone-portrait-outline" size={20} color="#666666" style={{ width: 25, marginLeft: 10, textAlign: 'center' }} />} placeholder={t("Mobile Number") + " *"} />
                                            </View>
                                            <View style={styles.inputbox}>
                                                <Input size="lg" value={address} h={90} textAlignVertical='top' onChangeText={(text) => setAddress(text)} variant="unstyled" InputLeftElement={<Icon name="location-outline" size={20} color="#666666" style={{ width: 25, marginLeft: 10, textAlign: 'center' }} />} placeholder={t("Address")} multiline />
                                            </View>
                                            <Pressable style={styles.inputbox} onPress={() => onStateOpen()}>
                                                <Input size="lg" readOnly variant="unstyled" value={state.name}
                                                    InputLeftElement={<Icon name="location-outline" size={20} color="#666666" style={{ width: 25, marginLeft: 10, textAlign: 'center' }} />}
                                                    InputRightElement={<Icon name="chevron-down-outline" size={30} color="#777777" style={{ width: 25, marginRight: 10, textAlign: 'center' }} />}
                                                    placeholder={t("Select State") + " *"} />
                                            </Pressable>
                                            <Actionsheet isOpen={isStateOpen} onClose={onStateClose}>
                                                <Actionsheet.Content>
                                                    <ScrollView w="100%">
                                                        {stateList.map((item, index) =>
                                                            <Actionsheet.Item onPress={() => onSelectState(item)} key={index}>{item.name}</Actionsheet.Item>
                                                        )}
                                                    </ScrollView>
                                                </Actionsheet.Content>
                                            </Actionsheet>
                                            {state != "" && (
                                                <View style={styles.inputbox}>
                                                    <Select variant="underlined" size="lg" placeholder={t("Select District") + " *"}
                                                        InputLeftElement={<Icon name="location-outline" size={20} color="#666666" style={{ width: 25, marginLeft: 10, marginRight: 10, textAlign: 'center' }} />}
                                                        selectedValue={district}
                                                        onValueChange={value => setDistrict(value)}
                                                        _selectedItem={{
                                                            backgroundColor: '#eeeeee',
                                                            endIcon: <Icon name="checkmark-circle" size={22} color="#2BBB86" style={{ right: 0, position: 'absolute' }} />
                                                        }}>
                                                        {districtList.map((item, index) =>
                                                            <Select.Item key={index} label={item.name} value={item.id} />
                                                        )}
                                                    </Select>
                                                </View>
                                            )}
                                            <View style={styles.inputbox}>
                                                <Input size="lg" value={pinCode} onChangeText={(text) => setPinCode(text)} maxLength={6} variant="unstyled" InputLeftElement={<Icon name="location-outline" size={20} color="#666666" style={{ width: 25, marginLeft: 10, textAlign: 'center' }} />} placeholder={t("Pincode")} />
                                            </View>
                                        </Box>
                                    )}
                                </Box>
                            </Box>
                            :
                            <VStack flex={1} padding="6" alignItems="center">
                                <Stack space={5} style={[styles.productbox, { height: 350, justifyContent: 'center', alignItems: 'center', padding: 30 }]}>
                                    <Icon name="hourglass-outline" size={80} color="#999999" />
                                    <Text fontSize='lg' fontWeight="bold" textAlign="center" color="#111111">{t("Window Closed for Now")}</Text>
                                    <Text fontSize='sm' fontWeight="medium" textAlign="center" color="#666666">{t("Whoops... This Information is not available for a moment")}</Text>
                                </Stack>
                            </VStack>
                        }
                    </ScrollView>
                </ImageBackground>
                {isWindowOpen && (
                    <LinearGradient
                        colors={[darkColor, lightColor]}
                        start={{ x: 0.5, y: 0 }}
                    >
                        <HStack paddingY="3" paddingX="6" justifyContent="space-between" alignContent="center">
                            <Button style={[styles.custbtn, { borderColor: '#111111', borderWidth: 2 }]} onPress={() => onRegister()}>
                                <Text color="#ffffff" fontSize="md" fontWeight="medium">{t("Register Now")}</Text>
                            </Button>
                        </HStack>
                    </LinearGradient>
                )}
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

export default RegisterLiftingScreen;
