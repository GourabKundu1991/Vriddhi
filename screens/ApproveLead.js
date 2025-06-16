import AsyncStorage from '@react-native-async-storage/async-storage';
import { Actionsheet, Box, Button, HStack, Input, NativeBaseProvider, Pressable, Select, Text, Toast } from 'native-base';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, StyleSheet, TouchableOpacity, StatusBar, View, ScrollView, Keyboard } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import { API_KEY, BASE_URL, CONTACT_HIER_ID, ORG_ID, PROGRAM_ID } from '../auth_provider/Config';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import Geolocation from '@react-native-community/geolocation';
import { useTranslation } from 'react-i18next';

const ApproveLeadScreen = ({ navigation, route }) => {

    const { t } = useTranslation();

    const [loading, setLoading] = React.useState(false);
    const [lightColor, setLightColor] = React.useState("#cbf75e");
    const [darkColor, setDarkColor] = React.useState("#2BBB86");
    const [cameraColor, setCameraColor] = React.useState("#f04e23");
    const [logoImage, setLogoImage] = React.useState("");

    const [details, setDetails] = useState([]);

    const [stageList, setStageList] = React.useState([]);
    const [unitList, setUnitList] = React.useState([]);
    const [productList, setProductList] = React.useState([]);

    const [leadImage, setLeadImage] = React.useState("");
    const [lat, setLat] = React.useState("");
    const [lng, setLng] = React.useState("");
    const [constructionArea, setConstructionArea] = React.useState("");
    const [unit, setUnit] = React.useState("");
    const [constructionStage, setConstructionStage] = React.useState("");
    const [floor, setFloor] = React.useState("");
    const [siteConverted, setSiteConverted] = React.useState("");
    const [convertedTo, setConvertedTo] = React.useState("");
    const [quantity, setQuantity] = React.useState("");
    const [dealerCode, setDealerCode] = React.useState("");

    useEffect(() => {
        setLoading(true);
        getAllData();
        setDetails(route.params.details);
        console.log(route.params.details);
    }, [])

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
                fetch(`${BASE_URL}/get_lead_default_info`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                    body: formdata
                })
                    .then((response) => response.json())
                    .then((responseJson) => {
                        //console.log("Default Info:", responseJson);
                        if (responseJson.status == 'success') {
                            setStageList(responseJson.construction_array);
                            setUnitList(responseJson.unit_array);
                            getProductList();
                        } else {
                            Toast.show({ description: responseJson.message });
                            setStageList([]);
                            setUnit([]);
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
                        //console.log("Default Info Error:", error);
                        Toast.show({ description: t("Sorry! Somthing went Wrong. Maybe Network request Failed") });
                    });
            } else {
                setLoading(false);
                AsyncStorage.clear();
                navigation.navigate('Login');
            }
        });
    }

    const getProductList = () => {
        AsyncStorage.getItem('userToken').then(val => {
            if (val != null) {
                let formdata = new FormData();
                formdata.append("APIkey", `${API_KEY}`);
                formdata.append("token", JSON.parse(val).token);
                formdata.append("orgId", JSON.parse(val).org_id);
                fetch(`${BASE_URL}/get_product_brand_list`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                    body: formdata
                })
                    .then((response) => response.json())
                    .then((responseJson) => {
                        //console.log("Product List:", responseJson);
                        if (responseJson.status == 'success') {
                            setLoading(false);
                            setProductList(responseJson.data_list);
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
                        //console.log("Product List Error:", error);
                        Toast.show({ description: t("Sorry! Somthing went Wrong. Maybe Network request Failed") });
                    });
            } else {
                setLoading(false);
                AsyncStorage.clear();
                navigation.navigate('Login');
            }
        });
    }

    const [isPicker, setIsPicker] = React.useState(false);

    const onPickerOpen = () => {
        setIsPicker(true);
    }
    const onPickerClose = () => {
        setIsPicker(false);
    }

    const openProfilePicker = (type) => {
        onPickerClose();
        if (type == "library") {
            launchImageLibrary(
                {
                    mediaType: 'photo',
                    includeBase64: true,
                    maxHeight: 1500,
                    maxWidth: 1500,
                },
                (response) => {
                    //console.log(response);
                    if (response.assets != undefined) {
                        setLoading(true);
                        setLeadImage(response.assets[0].base64);
                        getLocation();
                    }
                },
            )
        } else if (type == "camera") {
            launchCamera(
                {
                    mediaType: 'photo',
                    includeBase64: true,
                    maxHeight: 1500,
                    maxWidth: 1500,
                },
                (response) => {
                    //console.log(response.assets);
                    if (response.assets != undefined) {
                        setLoading(true);
                        setLeadImage(response.assets[0].base64);
                        getLocation();
                    }
                },
            )
        }
    }

    const getLocation = () => {
        Geolocation.getCurrentPosition((position) => {
            console.log("Location:", position);
            setLat(position.coords.latitude);
            setLng(position.coords.longitude);
            setLoading(false);
        }, (error) => {
            setLoading(false);
            Toast.show({ description: error.message });
        },
            { enableHighAccuracy: false });
    }

    const onSetTo = (val) => {
        setSiteConverted(val);
        if (val == 'no') {
            setConvertedTo("");
            setQuantity("");
        }
    }

    const onCheckSubmit = () => {
        Keyboard.dismiss();
        if (leadImage == "") {
            Toast.show({ description: t("Please Upload Image") });
        } else if (constructionArea.trim() == "") {
            Toast.show({ description: t("Please enter Construction Area") });
        } else if (unit == "") {
            Toast.show({ description: t("Please select Unit") });
        } else if (constructionStage == "") {
            Toast.show({ description: t("Please select Construction Stage") });
        } else if (floor == "") {
            Toast.show({ description: t("Please select Floor") });
        } else if (siteConverted == "") {
            Toast.show({ description: t("Please select Site Converted") });
        } else if (siteConverted == "yes" && convertedTo == "") {
            Toast.show({ description: t("Please select Converted To") });
        } else if (siteConverted == "yes" && quantity.trim() == "") {
            Toast.show({ description: t("Please enter Quantity") });
        } else if (siteConverted == "yes" && dealerCode.trim() == "") {
            Toast.show({ description: t("Please enter Dealer Code") });
        } else {
            onSubmit();
        }
    }

    const onSubmit = () => {
        setLoading(true);
        AsyncStorage.getItem('userToken').then(val => {
            if (val != null) {
                let formdata = new FormData();
                formdata.append("APIkey", `${API_KEY}`);
                formdata.append("token", JSON.parse(val).token);
                formdata.append("orgId", JSON.parse(val).org_id);
                formdata.append("uploadImage", leadImage);
                formdata.append("locationLat", lat);
                formdata.append("locationLong", lng);
                formdata.append("constructionArea", constructionArea);
                formdata.append("unit", unit);
                formdata.append("constructionStage", constructionStage);
                formdata.append("noOfFloor", floor);
                formdata.append("siteConverted", siteConverted);
                formdata.append("convertedTo", convertedTo);
                formdata.append("quantity", quantity);
                formdata.append("dealerCode", dealerCode);
                formdata.append("status", 1);
                formdata.append("lead_id", details.id);
                fetch(`${BASE_URL}/lead_approval_confirmation`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                    body: formdata
                })
                    .then((response) => response.json())
                    .then((responseJson) => {
                        //console.log("Approve:", responseJson);
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
                        //console.log("Approve Error:", error);
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
                        <Text color="#111111" fontSize="16" textAlign="center" fontWeight="bold">{t("Approve Lead")}</Text>
                        <Image source={logoImage ? { uri: logoImage } : require('../assets/images/logo.png')} style={{ width: 60, height: 25, resizeMode: 'contain' }} />
                    </HStack>
                </LinearGradient>
                <ScrollView>
                    <LinearGradient
                        colors={[lightColor, darkColor]}
                        style={{ height: 130, position: 'absolute', top: 0, width: '100%', borderBottomEndRadius: 100, borderBottomStartRadius: 100, overflow: 'hidden' }}
                        start={{ x: 0.5, y: 0 }}
                    ></LinearGradient>
                    <Box padding="5">
                        <Box style={styles.productbox}>
                            {details.project_contact_person != "" && (
                                <HStack style={styles.inputbox} padding="3" justifyContent="space-between" alignItems="center">
                                    <Text color="#666666" fontSize="14">{t("Customer Name")} *</Text>
                                    <Text color="#111111" fontSize="16" fontWeight="bold" >{details.project_contact_person}</Text>
                                </HStack>
                            )}
                            {details.project_contact_phone_number != "" && (
                                <HStack style={styles.inputbox} padding="3" justifyContent="space-between" alignItems="center">
                                    <Text color="#666666" fontSize="14">{t("Mobile")} *</Text>
                                    <Text color="#111111" fontSize="16" fontWeight="bold" >{details.project_contact_phone_number}</Text>
                                </HStack>
                            )}
                            {details.project_address_line1 != "" && (
                                <HStack style={styles.inputbox} padding="3" justifyContent="space-between" alignItems="center">
                                    <Text color="#666666" fontSize="14">{t("Address")} *</Text>
                                    <Text color="#111111" fontSize="16" fontWeight="bold" >{details.project_address_line1}</Text>
                                </HStack>
                            )}
                            {details.state_name != null && (
                                <HStack style={styles.inputbox} padding="3" justifyContent="space-between" alignItems="center">
                                    <Text color="#666666" fontSize="14">{t("State")} *</Text>
                                    <Text color="#111111" fontSize="16" fontWeight="bold" >{details.state_name}</Text>
                                </HStack>
                            )}
                            {details.city_name != null && (
                                <HStack style={styles.inputbox} padding="3" justifyContent="space-between" alignItems="center">
                                    <Text color="#666666" fontSize="14">{t("District")} *</Text>
                                    <Text color="#111111" fontSize="16" fontWeight="bold" >{details.city_name}</Text>
                                </HStack>
                            )}
                            {details.pin_code != "" && (
                                <HStack style={styles.inputbox} padding="3" justifyContent="space-between" alignItems="center">
                                    <Text color="#666666" fontSize="14">{t("Pincode")} *</Text>
                                    <Text color="#111111" fontSize="16" fontWeight="bold" >{details.pin_code}</Text>
                                </HStack>
                            )}
                            {details.product_brand != "" && (
                                <HStack style={styles.inputbox} padding="3" justifyContent="space-between" alignItems="center">
                                    <Text color="#666666" fontSize="14">{t("Product Brand")} *</Text>
                                    <Text color="#111111" fontSize="16" fontWeight="bold" >{details.product_brand}</Text>
                                </HStack>
                            )}
                            {details.specific_product != "" && (
                                <HStack style={styles.inputbox} padding="3" justifyContent="space-between" alignItems="center">
                                    <Text color="#666666" fontSize="14">{t("Specific Brand")} *</Text>
                                    <Text color="#111111" fontSize="16" fontWeight="bold" >{details.specific_product}</Text>
                                </HStack>
                            )}
                            <HStack alignItems="center" mt="3" space={0}>
                                <Icon name="attach-outline" size={22} color="#666666" />
                                <Text color="#666666" fontSize="md" textTransform="capitalize">{t("Upload Image")} *</Text>
                            </HStack>
                            <View style={styles.inputbox}>
                                <Image source={leadImage != "" ? { uri: 'data:image/jpeg;base64,' + leadImage } : require('../assets/images/noimage.jpg')} alt="image" resizeMode='contain' style={{ width: '100%', height: 160 }} />
                                <Pressable onPress={() => onPickerOpen()} bg={cameraColor} position="absolute" bottom="3" right="3" width="50" height="50" justifyContent="center" alignItems="center" borderRadius="30" overflow="hidden">
                                    <Icon name="camera" size={26} color="#ffffff" />
                                </Pressable>
                            </View>
                            <View style={styles.inputbox}>
                                <Input size="lg" onChangeText={(text) => setConstructionArea(text)} variant="unstyled" placeholder={t("Construction Area") + " *"} />
                            </View>
                            <View style={styles.inputbox}>
                                <Select variant="underlined" size="lg" placeholder={t("Select Unit") + " *"}
                                    style={{ marginLeft: 10 }}
                                    selectedValue={unit}
                                    onValueChange={value => setUnit(value)}
                                    _selectedItem={{
                                        backgroundColor: '#eeeeee',
                                        endIcon: <Icon name="checkmark-circle" size={22} color="#2BBB86" style={{ right: 0, position: 'absolute' }} />
                                    }}>
                                    {unitList.map((item, index) =>
                                        <Select.Item key={index} label={item.label_name} value={item.label_val} />
                                    )}
                                </Select>
                            </View>
                            <View style={styles.inputbox}>
                                <Select variant="underlined" size="lg" placeholder={t("Select Construction Stage") + " *"}
                                    style={{ marginLeft: 10 }}
                                    selectedValue={constructionStage}
                                    onValueChange={value => setConstructionStage(value)}
                                    _selectedItem={{
                                        backgroundColor: '#eeeeee',
                                        endIcon: <Icon name="checkmark-circle" size={22} color="#2BBB86" style={{ right: 0, position: 'absolute' }} />
                                    }}>
                                    {stageList.map((item, index) =>
                                        <Select.Item key={index} label={item.label_name} value={item.label_val} />
                                    )}
                                </Select>
                            </View>
                            <View style={styles.inputbox}>
                                <Select variant="underlined" size="lg" placeholder={t("Select Floor") + " *"}
                                    style={{ marginLeft: 10 }}
                                    selectedValue={floor}
                                    onValueChange={value => setFloor(value)}
                                    _selectedItem={{
                                        backgroundColor: '#eeeeee',
                                        endIcon: <Icon name="checkmark-circle" size={22} color="#2BBB86" style={{ right: 0, position: 'absolute' }} />
                                    }}>
                                    <Select.Item label="Ground" value="0" />
                                    <Select.Item label="G+1" value="1" />
                                    <Select.Item label="G+2" value="2" />
                                    <Select.Item label="G+3 & Above" value="1" />
                                </Select>
                            </View>
                            <View style={styles.inputbox}>
                                <Select variant="underlined" size="lg" placeholder={t("Select Site Converted") + " *"}
                                    style={{ marginLeft: 10 }}
                                    selectedValue={siteConverted}
                                    onValueChange={value => onSetTo(value)}
                                    _selectedItem={{
                                        backgroundColor: '#eeeeee',
                                        endIcon: <Icon name="checkmark-circle" size={22} color="#2BBB86" style={{ right: 0, position: 'absolute' }} />
                                    }}>
                                    <Select.Item label="Yes" value="yes" />
                                    <Select.Item label="No" value="no" />
                                </Select>
                            </View>
                            {siteConverted == 'yes' && (
                                <View>
                                    <View style={styles.inputbox}>
                                        <Select variant="underlined" size="lg" placeholder={t("Converted To") + " *"}
                                            style={{ marginLeft: 10 }}
                                            selectedValue={convertedTo}
                                            onValueChange={value => setConvertedTo(value)}
                                            _selectedItem={{
                                                backgroundColor: '#eeeeee',
                                                endIcon: <Icon name="checkmark-circle" size={22} color="#2BBB86" style={{ right: 0, position: 'absolute' }} />
                                            }}>
                                            {productList.map((item, index) =>
                                                <Select.Item key={index} label={item.product_name} value={item.product_name} />
                                            )}
                                        </Select>
                                    </View>
                                    <View style={styles.inputbox}>
                                        <Input size="lg" onChangeText={(text) => setQuantity(text)} variant="unstyled" placeholder={t("Quantity") + " *"} />
                                    </View>
                                    <View style={styles.inputbox}>
                                        <Input size="lg" onChangeText={(text) => setDealerCode(text)} variant="unstyled" placeholder={t("Dealer Code") + " *"} />
                                    </View>
                                </View>
                            )}
                        </Box>
                    </Box>
                    <Actionsheet isOpen={isPicker} onClose={onPickerClose}>
                        <Actionsheet.Content>
                            <Text color="#666666" fontSize="md" textAlign="center">{t("Select Image Source")}</Text>
                            <Actionsheet.Item onPress={() => openProfilePicker("library")}>{t("Load from Library")}</Actionsheet.Item>
                            <Actionsheet.Item onPress={() => openProfilePicker("camera")}>{t("Use Camera")}</Actionsheet.Item>
                            <Actionsheet.Item onPress={() => openProfilePicker("cancel")}>{t("Cancel")}</Actionsheet.Item>
                        </Actionsheet.Content>
                    </Actionsheet>
                </ScrollView>
                <LinearGradient
                    colors={[darkColor, lightColor]}
                    start={{ x: 0.5, y: 0 }}
                >
                    <HStack paddingY="3" paddingX="6" justifyContent="space-between" alignContent="center">
                        <Button style={[styles.custbtn, { borderColor: '#111111', borderWidth: 2 }]} onPress={() => onCheckSubmit()}>
                            <Text color="#ffffff" fontSize="md" fontWeight="medium">{t("Approve")}</Text>
                        </Button>
                    </HStack>
                </LinearGradient>
            </Box>
            {loading && (
                <View style={styles.spincontainer}>
                    <ActivityIndicator animating={loading} size="large" color={darkColor} />
                </View>
            )}
        </NativeBaseProvider >
    )
}

const styles = StyleSheet.create({
    bgimage: { flex: 1, justifyContent: 'center' },
    inputbox: { backgroundColor: 'rgba(0,0,0,0.06)', borderRadius: 12, width: '100%', overflow: 'hidden', marginVertical: 7 },
    custbtn: { width: '100%', backgroundColor: '#111111', borderRadius: 12, overflow: 'hidden' },
    productbox: { borderRadius: 15, width: '96%', margin: '2%', backgroundColor: '#f6f6f6', padding: 15, borderColor: '#ffffff', borderWidth: 2, elevation: 10, shadowColor: '#666666', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.4, shadowRadius: 10, overflow: 'hidden' },
    spincontainer: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0, 0, 0, 0.8)' },
});

export default ApproveLeadScreen;