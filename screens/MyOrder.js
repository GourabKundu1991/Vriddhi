import AsyncStorage from '@react-native-async-storage/async-storage';
import { Box, HStack, NativeBaseProvider, Text, VStack, Toast, Button, Stack, Actionsheet, Pressable, Input, Select } from 'native-base';
import React, { useEffect } from 'react';
import Icon from 'react-native-vector-icons/Ionicons';
import { ActivityIndicator, Image, ImageBackground, ScrollView, StatusBar, StyleSheet, TouchableOpacity, View } from 'react-native';
import { API_KEY, BASE_URL, CONTACT_HIER_ID, ORG_ID, PROGRAM_ID } from '../auth_provider/Config';
import LinearGradient from 'react-native-linear-gradient';
import { useTranslation } from 'react-i18next';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';

const MyOrderScreen = ({ navigation }) => {

    const { t } = useTranslation();

    const [loading, setLoading] = React.useState(false);
    const [lightColor, setLightColor] = React.useState("#cbf75e");
    const [darkColor, setDarkColor] = React.useState("#2BBB86");
    const [cameraColor, setCameraColor] = React.useState("#f04e23");
    const [logoImage, setLogoImage] = React.useState("");
    const [dataFound, setDataFound] = React.useState("");

    const [allOrders, setAllOrders] = React.useState([]);

    const [remarkPop, setRemarkPop] = React.useState(false);

    const [isPicker, setIsPicker] = React.useState(false);
    const [proofImages, setProofImages] = React.useState([]);
    const [remarks, setRemarks] = React.useState("");
    const [itemValue, setItemValue] = React.useState("");

    const [filterStatus, setFilterStatus] = React.useState(1);
    const [allOldOrders, setAllOldOrders] = React.useState([]);

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            setLoading(true);
            getAllData();
        });
        return unsubscribe;
    }, []);

    const onSetFilter = (dataVal) => {
        setLoading(true);
        setFilterStatus(dataVal);
        if (dataVal == 1) {
            getAllData();
        } else if (dataVal == 2) {
            getArchivedData();
        }
    }

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
                fetch(`${BASE_URL}/myorders`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                    body: formdata
                })
                    .then((response) => response.json())
                    .then((responseJson) => {
                        console.log("Order:", responseJson);
                        if (responseJson.status == 'success') {
                            setLoading(false);
                            setAllOrders(responseJson.order_list);
                            if (responseJson.order_list.length != 0) {
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
                        //console.log("Order Error:", error);
                        Toast.show({ description: t("Sorry! Somthing went Wrong. Maybe Network request Failed") });
                    });
            } else {
                setLoading(false);
                AsyncStorage.clear();
                navigation.navigate('Login');
            }
        });
    }

    const getArchivedData = () => {
        AsyncStorage.getItem('userToken').then(val => {
            if (val != null) {
                let formdata = new FormData();
                formdata.append("APIkey", `${API_KEY}`);
                formdata.append("token", JSON.parse(val).token);
                formdata.append("orgId", JSON.parse(val).org_id);
                fetch(`${BASE_URL}/archived_orders`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                    body: formdata
                })
                    .then((response) => response.json())
                    .then((responseJson) => {
                        console.log("Old Order:", responseJson);
                        if (responseJson.status == 'success') {
                            setLoading(false);
                            setAllOldOrders(responseJson.order_list);
                            if (responseJson.order_list.length != 0) {
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
                        //console.log("Order Error:", error);
                        Toast.show({ description: t("Sorry! Somthing went Wrong. Maybe Network request Failed") });
                    });
            } else {
                setLoading(false);
                AsyncStorage.clear();
                navigation.navigate('Login');
            }
        });
    }

    const onTakeAction = (type, dataVal) => {
        setProofImages([]);
        setRemarks("");
        if (type == 'no') {
            setRemarkPop(true);
            setItemValue(dataVal);
        } else {
            setLoading(true);
            onPODAction(type, dataVal);
        }

    }

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
                        let newArrya = proofImages.concat(response.assets[0].base64);
                        setProofImages(newArrya);
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
                        let newArrya = proofImages.concat(response.assets[0].base64);
                        setProofImages(newArrya);
                    }
                },
            )
        }
    }

    const removeImage = (index) => {
        let result = proofImages.filter((item, key) => key != index)
        setProofImages(result);
    }

    const onCancel = () => {
        setRemarkPop(false);
        setProofImages([]);
        setRemarks("");
    }

    const onSubmit = () => {
        if (proofImages.length < 2) {
            Toast.show({ description: t("Please upload atleast 2 images of product") });
        } else if (remarks == "") {
            Toast.show({ description: t("Please enter some remarks.") });
        } else {
            setRemarkPop(false);
            setLoading(true);
            onPODAction('no', itemValue);
        }
    }

    const onPODAction = (action, dataVal) => {
        AsyncStorage.getItem('userToken').then(val => {
            if (val != null) {
                let formdata = new FormData();
                formdata.append("APIkey", `${API_KEY}`);
                formdata.append("token", JSON.parse(val).token);
                formdata.append("orgId", JSON.parse(val).org_id);
                formdata.append("action", action);
                formdata.append("remarks", remarks);
                formdata.append("dopdId", dataVal.dopdId);
                formdata.append("orderId", dataVal.order_id);
                formdata.append("orderItemId", dataVal.orderItemId);
                formdata.append("accept_proof_image", JSON.stringify(proofImages));
                console.log(formdata);
                fetch(`${BASE_URL}/accept_delivery`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                    body: formdata
                })
                    .then((response) => response.json())
                    .then((responseJson) => {
                        //console.log("accept_delivery:", responseJson);
                        if (responseJson.status == 'success') {
                            Toast.show({ description: responseJson.message });
                            getAllData();
                            setProofImages([]);
                            setRemarks("");
                        } else {
                            Toast.show({ description: responseJson.message });
                            setLoading(false);
                        }
                    })
                    .catch((error) => {
                        setLoading(false);
                        //console.log("accept_delivery Error:", error);
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
                        <Text color="#111111" fontSize="16" textAlign="center" fontWeight="bold" textTransform="capitalize">{t("My Order")}</Text>
                        <Image source={logoImage ? { uri: logoImage } : require('../assets/images/logo.png')} style={{ width: 60, height: 25, resizeMode: 'contain' }} />
                    </HStack>
                </LinearGradient>
                <ImageBackground source={require('../assets/images/bg.jpg')} imageStyle={{ resizeMode: 'contain', position: 'absolute', bottom: 0, top: '65%', opacity: allOrders.length < 3 ? 0.6 : 0 }} style={styles.bgimage}>
                    <ScrollView>
                        <LinearGradient
                            colors={[lightColor, darkColor]}
                            style={{ height: 80, position: 'absolute', top: 0, width: '100%', borderBottomEndRadius: 100, borderBottomStartRadius: 100, overflow: 'hidden' }}
                            start={{ x: 0.5, y: 0 }}
                        ></LinearGradient>
                        <Box padding="5">
                            <Box style={[styles.productbox, { paddingHorizontal: 8 }]}>
                                <HStack alignItems="center" justifyContent="space-evenly">
                                    <LinearGradient
                                        colors={filterStatus == "1" ? ["#555555", "#000000"] : ["#eeeeee", "#bbbbbb"]}
                                        start={{ x: 0.5, y: 0 }}
                                        style={[styles.custbtn, { width: '45%' }]}
                                    >
                                        <Button size="xs" variant="link" _text={{ color: filterStatus == "1" ? "#ffffff" : "#111111", fontWeight: 'bold', fontSize: 12 }} onPress={() => onSetFilter("1")}>{t("Combo Orders")}</Button>
                                    </LinearGradient>
                                    <LinearGradient
                                        colors={filterStatus == "2" ? ["#555555", "#000000"] : ["#eeeeee", "#bbbbbb"]}
                                        start={{ x: 0.5, y: 0 }}
                                        style={[styles.custbtn, { width: '45%' }]}
                                    >
                                        <Button size="xs" variant="link" _text={{ color: filterStatus == "2" ? "#ffffff" : "#111111", fontWeight: 'bold', fontSize: 12 }} onPress={() => onSetFilter("2")}>{t("Archived Orders")}</Button>
                                    </LinearGradient>
                                </HStack>
                            </Box>
                            {dataFound == "notfound" && (
                                <Stack space={5} style={[styles.productbox, { height: 350, justifyContent: 'center', alignItems: 'center', padding: 30 }]}>
                                    <Icon name="hourglass-outline" size={80} color="#999999" />
                                    <Text fontSize='lg' fontWeight="bold" textAlign="center" color="#111111">{t("Result Not Found")}</Text>
                                    <Text fontSize='sm' fontWeight="medium" textAlign="center" color="#666666">{t("Whoops... This Information is not available for a moment")}</Text>
                                </Stack>
                            )}
                            {dataFound == "found" && (
                                filterStatus == 1 ?
                                    <VStack>
                                        {allOrders.map((item, index) =>
                                            <Box key={index} style={styles.productbox}>
                                                <HStack space="4">
                                                    <Box style={styles.productimage}>
                                                        <Image source={item.order_image ? { uri: item.BaseUrl + item.order_image } : require('../assets/images/noimage.jpg')} style={{ width: 100, height: 90 }} resizeMode='contain' />
                                                    </Box>
                                                    <VStack style={styles.productdetails}>
                                                        <Text fontSize='sm' fontWeight="bold" mb="2">{item.combo_prod_name}</Text>
                                                        <HStack space="2" alignItems="center">
                                                            <Text fontSize='xs'>{t("Order Id")}:</Text>
                                                            <Text fontSize='xs' fontWeight="bold"> {item.order_id}</Text>
                                                        </HStack>
                                                        <HStack space="2" alignItems="center">
                                                            <Text fontSize='xs'>{t("Date")}:</Text>
                                                            <Text fontSize='xs' fontWeight="bold"> {item.orderDate}</Text>
                                                        </HStack>
                                                    </VStack>
                                                </HStack>
                                                <HStack space={1} alignItems="center" justifyContent="space-evenly" bg="#eeeeee" borderRadius="10" overflow="hidden" padding="2" mt="3">
                                                    <LinearGradient
                                                        colors={["#666666", "#222222"]}
                                                        start={{ x: 0.5, y: 0 }}
                                                        style={[styles.custbtn, { width: '100%', marginTop: 0 }]}
                                                    >
                                                        <Button size="xs" variant="link" _text={{ color: "#ffffff", fontWeight: 'bold', fontSize: 13 }} onPress={() => navigation.navigate("OrderDetails", { orderDetails: item })}>{t("Details")}</Button>
                                                    </LinearGradient>
                                                </HStack>
                                                {item.canAccept == true && (
                                                    <HStack space={1} alignItems="center" justifyContent="space-evenly" bg="#eeeeee" borderRadius="10" overflow="hidden" padding="2" mt="3">
                                                        <LinearGradient
                                                            colors={["#821700", "#f04e23"]}
                                                            start={{ x: 0.5, y: 0 }}
                                                            style={styles.optionbtn}
                                                        >
                                                            <Button size="xs" variant="link" _text={{ color: "#ffffff", fontWeight: 'bold', fontSize: 13 }} onPress={() => onTakeAction('no', item)}>{t("Reject")}</Button>
                                                        </LinearGradient>
                                                        <LinearGradient
                                                            colors={["#10764F", "#2BBB86"]}
                                                            start={{ x: 0.5, y: 0 }}
                                                            style={styles.optionbtn}
                                                        >
                                                            <Button size="xs" variant="link" _text={{ color: "#ffffff", fontWeight: 'bold', fontSize: 13 }} onPress={() => onTakeAction('yes', item)}>{t("Accept")}</Button>
                                                        </LinearGradient>
                                                    </HStack>
                                                )}
                                            </Box>
                                        )}
                                    </VStack>
                                    :
                                    <VStack>
                                        {allOldOrders.map((item, index) =>
                                            <Box key={index} style={styles.productbox}>
                                            <HStack space="4">
                                                <Box style={styles.productimage}>
                                                    <Image source={item.product_image ? { uri: item.BaseUrl + item.product_image[0].product_image } : require('../assets/images/noimage.jpg')} style={{ width: 100, height: 90 }} resizeMode='contain' />
                                                </Box>
                                                <VStack style={styles.productdetails}>
                                                    <Text fontSize='sm' fontWeight="bold" mb="2">{item.productName}</Text>
                                                    <HStack space="2" alignItems="center">
                                                        <Text fontSize='xs'>{t("Order Id")}:</Text>
                                                        <Text fontSize='xs' fontWeight="bold"> {item.orderId}</Text>
                                                    </HStack>
                                                    <HStack space="2" alignItems="center">
                                                        <Text fontSize='xs'>{t("Order Item Id")}:</Text>
                                                        <Text fontSize='xs' fontWeight="bold"> {item.orderItemId}</Text>
                                                    </HStack>
                                                    <HStack space="2" alignItems="center">
                                                        <Text fontSize='xs'>{t("Price Point")}:</Text>
                                                        <Text fontSize='xs' fontWeight="bold"> {item.pricePoint}</Text>
                                                    </HStack>
                                                    <HStack space="2" alignItems="center">
                                                        <Text fontSize='xs'>{t("Date")}:</Text>
                                                        <Text fontSize='xs' fontWeight="bold"> {item.orderInDate}</Text>
                                                    </HStack>
                                                    <HStack space="2" alignItems="center" mt="1" flexWrap="wrap">
                                                        <Text fontSize='xs'>{t("Status")}:</Text>
                                                        <Text fontSize='xs' fontWeight="bold">{item.status}</Text>
                                                    </HStack>
                                                </VStack>
                                            </HStack>
                                            {/* <HStack space={1} alignItems="center" justifyContent="space-evenly" bg="#eeeeee" borderRadius="10" overflow="hidden" padding="2" mt="3">
                                                <LinearGradient
                                                    colors={["#666666", "#222222"]}
                                                    start={{ x: 0.5, y: 0 }}
                                                    style={[styles.custbtn, { width: '100%', marginTop: 0 }]}
                                                >
                                                    <Button size="xs" variant="link" _text={{ color: "#ffffff", fontWeight: 'bold', fontSize: 13 }} onPress={() => navigation.navigate("OrderDetails", { orderId: item.orderId, itemId: item.orderItemId })}>{t("Details")}</Button>
                                                </LinearGradient>
                                            </HStack> */}
                                            {/* {item.canAccept == true && (
                                                <HStack space={1} alignItems="center" justifyContent="space-evenly" bg="#eeeeee" borderRadius="10" overflow="hidden" padding="2" mt="3">
                                                    <LinearGradient
                                                        colors={["#821700", "#f04e23"]}
                                                        start={{ x: 0.5, y: 0 }}
                                                        style={styles.optionbtn}
                                                    >
                                                        <Button size="xs" variant="link" _text={{ color: "#ffffff", fontWeight: 'bold', fontSize: 13 }} onPress={() => onTakeAction('no', item)}>{t("Reject")}</Button>
                                                    </LinearGradient>
                                                    <LinearGradient
                                                        colors={["#10764F", "#2BBB86"]}
                                                        start={{ x: 0.5, y: 0 }}
                                                        style={styles.optionbtn}
                                                    >
                                                        <Button size="xs" variant="link" _text={{ color: "#ffffff", fontWeight: 'bold', fontSize: 13 }} onPress={() => onTakeAction('yes', item)}>{t("Accept")}</Button>
                                                    </LinearGradient>
                                                </HStack>
                                            )} */}
                                        </Box>
                                        )}
                                    </VStack>

                            )}
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
                </ImageBackground>
            </Box>
            {loading && (
                <View style={styles.spincontainer}>
                    <ActivityIndicator animating={loading} size="large" color={darkColor} />
                </View>
            )}
            {remarkPop && (
                <VStack flex={1} style={{ backgroundColor: "rgba(0,0,0,0.85)", position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center', padding: 30 }}>
                    <Box style={styles.productbox}>
                        <Text color={darkColor} fontSize="16" fontWeight="bold" textAlign="center" mb="4" pb="3" borderColor="#bbbbbb" borderBottomWidth={1}>{t("Product Feedback")}</Text>
                        <HStack alignItems="center" mt="3" space={0}>
                            <Icon name="attach-outline" size={22} color="#666666" />
                            <Text color="#666666" fontSize="md" textTransform="capitalize">{t("Attach Product Images")} *</Text>
                        </HStack>
                        <HStack justifyContent="flex-start" flexWrap={'wrap'}>
                            {proofImages.map((item, index) =>
                                <View key={index} style={[styles.inputbox, { width: '30%', height: 60, marginHorizontal: '1.5%' }]}>
                                    <Image source={{ uri: 'data:image/jpeg;base64,' + item }} alt="image" resizeMode='cover' style={{ width: '100%', height: 60 }} />
                                    <Pressable onPress={() => removeImage(index)} bg={cameraColor} position="absolute" bottom="1" left="1" width="25" height="25" justifyContent="center" alignItems="center" borderRadius="30" overflow="hidden">
                                        <Icon name="close" size={16} color="#ffffff" />
                                    </Pressable>
                                </View>
                            )}
                            <View style={[styles.inputbox, { width: '30%', height: 60, marginHorizontal: '1.5%', overflow: 'hidden' }]}>
                                <Pressable onPress={() => onPickerOpen()} bg={darkColor} width="100%" height="100%" justifyContent="center" alignItems="center" overflow="hidden">
                                    <Icon name="camera" size={30} color="#ffffff" />
                                </Pressable>
                            </View>
                        </HStack>
                        <HStack alignItems="center" mt="4" space={0}>
                            <Icon name="document-text-outline" size={20} color="#666666" />
                            <Text color="#666666" fontSize="md" textTransform="capitalize">{t(" Remarks")} *</Text>
                        </HStack>
                        <View style={styles.inputbox}>
                            <Input size="lg" value={remarks} multiline={true} style={{ height: 80 }} onChangeText={(text) => setRemarks(text)} variant="unstyled" textAlignVertical='top' />
                        </View>
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
                                <Button size="xs" variant="link" _text={{ color: "#ffffff", fontWeight: 'bold', fontSize: 13 }} onPress={() => onSubmit()}>{t("Submit")}</Button>
                            </LinearGradient>
                        </HStack>
                    </Box>
                </VStack>
            )}
        </NativeBaseProvider>
    );
};

const styles = StyleSheet.create({
    bgimage: { flex: 1, justifyContent: 'center' },
    optionbtn: { backgroundColor: 'none', width: '46%', borderRadius: 8, overflow: 'hidden' },
    inputbox: { backgroundColor: 'rgba(0,0,0,0.06)', borderRadius: 12, width: '100%', overflow: 'hidden', marginVertical: 7 },
    custbtn: { backgroundColor: 'none', width: 80, borderRadius: 8, marginTop: 10, overflow: 'hidden' },
    productbox: { borderRadius: 15, width: '96%', margin: '2%', backgroundColor: '#f6f6f6', padding: 15, borderColor: '#ffffff', borderWidth: 2, elevation: 10, shadowColor: '#666666', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.4, shadowRadius: 10, overflow: 'hidden' },
    productimage: { borderColor: '#dddddd', backgroundColor: '#ffffff', borderWidth: 1, borderRadius: 10, width: '38%', height: 100, justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
    productdetails: { width: '58%' },
    spincontainer: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0, 0, 0, 0.8)' },
});

export default MyOrderScreen;
