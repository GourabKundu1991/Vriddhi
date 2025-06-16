import AsyncStorage from '@react-native-async-storage/async-storage';
import { Box, HStack, NativeBaseProvider, Text, VStack, Toast, Button, Stack } from 'native-base';
import React, { useEffect } from 'react';
import Icon from 'react-native-vector-icons/Ionicons';
import { ActivityIndicator, Image, ScrollView, StatusBar, StyleSheet, TouchableOpacity, View, Alert, ImageBackground } from 'react-native';
import { API_KEY, BASE_URL, CONTACT_HIER_ID, ORG_ID, PROGRAM_ID } from '../auth_provider/Config';
import LinearGradient from 'react-native-linear-gradient';
import { useTranslation } from 'react-i18next';

const CartScreen = ({ navigation }) => {

    const { t } = useTranslation();

    const [loading, setLoading] = React.useState(false);
    const [lightColor, setLightColor] = React.useState("#cbf75e");
    const [darkColor, setDarkColor] = React.useState("#2BBB86");
    const [logoImage, setLogoImage] = React.useState("");
    const [dataFound, setDataFound] = React.useState("");

    const [allCart, setAllCart] = React.useState([]);
    const [controls, setControls] = React.useState("");

    const [successOrder, setSuccessOrder] = React.useState(false);

    const [isPending, setIsPending] = React.useState(false);
    const [isKYC, setIsKYC] = React.useState(false);

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
                fetch(`${BASE_URL}/mycart`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                    body: formdata
                })
                    .then((response) => response.json())
                    .then((responseJson) => {
                        console.log("My Cart:", responseJson);
                        if (responseJson.status == 'success') {
                            setLoading(false);
                            setAllCart(responseJson.row_items);
                            setControls(responseJson.control);
                            setDataFound("found");
                            if (responseJson.is_approved == 2) {
                                setIsKYC(true);
                            } else if (responseJson.is_approved == 0) {
                                setIsPending(true);
                            }
                        } else {
                            Toast.show({ description: responseJson.message });
                            setAllCart([]);
                            setDataFound("notfound");
                            setControls("");
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
                        //console.log("My Cart Error:", error);
                        Toast.show({ description: t("Sorry! Somthing went Wrong. Maybe Network request Failed") });
                    });
            } else {
                setLoading(false);
                AsyncStorage.clear();
                navigation.navigate('Login');
            }
        });
    }

    const updateKYC = () => {
        navigation.replace('UpdateKYC');
    }

    const updateQty = (qty, cartId, productId) => {
        AsyncStorage.getItem('userToken').then(val => {
            if (val != null) {
                let formdata = new FormData();
                formdata.append("APIkey", `${API_KEY}`);
                formdata.append("token", JSON.parse(val).token);
                formdata.append("orgId", JSON.parse(val).org_id);
                formdata.append("cart_id", cartId);
                formdata.append("product_id", productId);
                formdata.append("quantity", qty);
                fetch(`${BASE_URL}/save_quantity`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                    body: formdata
                })
                    .then((response) => response.json())
                    .then((responseJson) => {
                        //console.log("update Cart:", responseJson);
                        if (responseJson.status == 'success') {
                            Toast.show({ description: responseJson.message });
                            setLoading(true);
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
                        //console.log("Update Cart Error:", error);
                        Toast.show({ description: t("Sorry! Somthing went Wrong. Maybe Network request Failed") });
                    });
            } else {
                setLoading(false);
                AsyncStorage.clear();
                navigation.navigate('Login');
            }
        });
    }

    const removeCart = (cartId, productId) => {
        Alert.alert(
            t("Warning"),
            t("Do you want to Remove Item from cart") + "?",
            [
                { text: t("Cancel"), onPress: () => { return null } },
                {
                    text: t("Yes"), onPress: () => {
                        AsyncStorage.getItem('userToken').then(val => {
                            if (val != null) {
                                let formdata = new FormData();
                                formdata.append("APIkey", `${API_KEY}`);
                                formdata.append("token", JSON.parse(val).token);
                                formdata.append("orgId", JSON.parse(val).org_id);
                                formdata.append("cart_id", cartId);
                                formdata.append("product_id", productId);
                                fetch(`${BASE_URL}/removecart`, {
                                    method: 'POST',
                                    headers: {
                                        'Content-Type': 'multipart/form-data',
                                    },
                                    body: formdata
                                })
                                    .then((response) => response.json())
                                    .then((responseJson) => {
                                        //console.log("Remove Cart:", responseJson);
                                        if (responseJson.status == 'success') {
                                            setLoading(true);
                                            getAllData();
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
                                        //console.log("Remove Cart Error:", error);
                                        Toast.show({ description: t("Sorry! Somthing went Wrong. Maybe Network request Failed") });
                                    });
                            } else {
                                setLoading(false);
                                AsyncStorage.clear();
                                navigation.navigate('Login');
                            }
                        });
                    }
                },
            ],
            { cancelable: false }
        )
    }

    const goAddress = () => {
        if (controls.is_voucher == 1) {
            navigation.navigate('Address', { cartId: controls.cart_id });
        } else {
            setLoading(true);
            AsyncStorage.getItem('userToken').then(val => {
                if (val != null) {
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
                                onPlaceOrder(controls.cart_id, responseJson.address.permanent_address.add_id);
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
    }

    const onPlaceOrder = (cartId, addressId) => {
        AsyncStorage.getItem('userToken').then(val => {
            if (val != null) {
                let formdata = new FormData();
                formdata.append("APIkey", `${API_KEY}`);
                formdata.append("token", JSON.parse(val).token);
                formdata.append("orgId", JSON.parse(val).org_id);
                formdata.append("cartId", cartId);
                formdata.append("address_id", addressId);
                formdata.append("referece_address_table", 'dcm_addresses');
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
                        <Text color="#111111" fontSize="16" textAlign="center" fontWeight="bold" textTransform="capitalize">{t("Cart")}</Text>
                        <Image source={logoImage ? { uri: logoImage } : require('../assets/images/logo.png')} style={{ width: 60, height: 25, resizeMode: 'contain' }} />
                    </HStack>
                </LinearGradient>
                <ImageBackground source={require('../assets/images/bg.jpg')} imageStyle={{ resizeMode: 'contain', position: 'absolute', bottom: 0, top: '65%', opacity: allCart.length < 3 ? 0.6 : 0 }} style={styles.bgimage}>
                    <ScrollView>
                        <LinearGradient
                            colors={[lightColor, darkColor]}
                            style={{ height: 120, position: 'absolute', top: 0, width: '100%', borderBottomEndRadius: 100, borderBottomStartRadius: 100, overflow: 'hidden' }}
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
                                    {allCart.map((item, index) =>
                                        <Box key={index} style={styles.productbox}>
                                            <HStack space="4">
                                                <Box style={styles.productimage}>
                                                    <Image source={item.productImage ? { uri: item.baseUrl + item.productImage[0].product_image } : require('../assets/images/noimage.jpg')} style={{ width: 100, height: 90 }} resizeMode='contain' />
                                                </Box>
                                                <VStack style={styles.productdetails} space="1">
                                                    <Text fontSize='sm' fontWeight="bold">{item.productName}</Text>
                                                    <Text marginY="1" fontWeight="bold" fontSize='lg' color={darkColor}>{item.pricePoints} {t("points")}</Text>
                                                    <HStack space={1} alignItems="center" justifyContent="space-between">
                                                        <HStack space={1} style={{ alignItems: 'center' }}>
                                                            <TouchableOpacity onPress={() => updateQty(Number(item.quantity) - 1, item.cart_id, item.product_id)}>
                                                                <Icon name="remove-circle" size={26} color="#111111" />
                                                            </TouchableOpacity>
                                                            <Text style={{ width: 50, textAlign: 'center', backgroundColor: '#cccccc', borderRadius: 15, overflow: 'hidden' }} fontSize='md' fontWeight="medium">{item.quantity}</Text>
                                                            <TouchableOpacity onPress={() => updateQty(Number(item.quantity) + 1, item.cart_id, item.product_id)}>
                                                                <Icon name="add-circle" size={26} color="#111111" />
                                                            </TouchableOpacity>
                                                        </HStack>
                                                        <TouchableOpacity onPress={() => removeCart(item.cart_id, item.product_id)}>
                                                            <Icon name="trash" size={22} color="#f04e23" />
                                                        </TouchableOpacity>
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
                {controls != "" && (
                    <LinearGradient
                        colors={[darkColor, lightColor]}
                        start={{ x: 0.5, y: 0 }}
                    >
                        <HStack paddingY="3" paddingX="6" justifyContent="space-between" alignContent="center">
                            <VStack>
                                <Text color="#444444" fontSize="xs" fontWeight="medium">{t("Grand Total")}:</Text>
                                <HStack space={1} alignItems="center">
                                    <Text color="#111111" fontSize="xl" fontWeight="bold">{controls.grandtotal_in_point}</Text>
                                    <Text color="#111111" fontSize="sm" fontWeight="bold">{t("Points")}</Text>
                                </HStack>
                            </VStack>
                            <Button style={styles.solidBtn} onPress={() => goAddress()}>
                                <Text color="#ffffff" fontSize="md" fontWeight="medium">{t("Checkout")}</Text>
                            </Button>
                        </HStack>
                    </LinearGradient>
                )}
            </Box>
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
            {isPending && (
                <View style={styles.spincontainer}>
                    <LinearGradient
                        colors={[lightColor, darkColor]}
                        start={{ x: 0.5, y: 0 }}
                        style={{ width: 300, borderRadius: 15, overflow: 'hidden' }}
                    >
                        <VStack space={1} w="100%" paddingX="5" paddingY="10" alignItems="center" justifyContent="center">
                            <Icon name="hourglass-outline" size={100} color="#111111"></Icon>
                            <Text mt={8} mb={5} fontSize="2xl" fontWeight="bold" color="#111111">{t("Pending")} !</Text>
                            <Text textAlign="center" fontSize="sm" fontWeight="medium" color="#111111" mb={3}>{t("Your EKYC is in Pending Mode. Please waiting for approval")}.</Text>
                            <Button size="sm" style={{ backgroundColor: '#111111', width: 100, borderRadius: 10, overflow: 'hidden' }} onPress={() => navigation.goBack()} marginY={4}>
                                <Text color="#ffffff" fontSize="sm" fontWeight="medium">{t("Go Back")}</Text>
                            </Button>
                        </VStack>
                    </LinearGradient>
                </View>
            )}
            {isKYC && (
                <View style={styles.spincontainer}>
                    <LinearGradient
                        colors={[lightColor, darkColor]}
                        start={{ x: 0.5, y: 0 }}
                        style={{ width: 300, borderRadius: 15, overflow: 'hidden' }}
                    >
                        <VStack space={1} w="100%" paddingX="5" paddingY="10" alignItems="center" justifyContent="center">
                            <Icon name="hourglass-outline" size={100} color="#111111"></Icon>
                            <Text mt={8} mb={5} fontSize="2xl" fontWeight="bold" color="#111111">{t("Warning")} !</Text>
                            <Text textAlign="center" fontSize="sm" fontWeight="medium" color="#111111" mb={3}>{t("Your E-KYC Rejected / Not verified. Please click on Continue to update.")}.</Text>
                            <Button size="sm" style={{ backgroundColor: '#111111', width: 100, borderRadius: 10, overflow: 'hidden' }} onPress={() => updateKYC()} marginY={4}>
                                <Text color="#ffffff" fontSize="sm" fontWeight="medium">{t("Update")}</Text>
                            </Button>
                        </VStack>
                    </LinearGradient>
                </View>
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
    solidBtn: { width: '48%', borderColor: '#111111', borderWidth: 2, backgroundColor: '#111111', borderRadius: 10, overflow: 'hidden' },
    productbox: { borderRadius: 15, width: '96%', margin: '2%', backgroundColor: '#f6f6f6', padding: 15, borderColor: '#ffffff', borderWidth: 2, elevation: 10, shadowColor: '#666666', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.4, shadowRadius: 10, overflow: 'hidden' },
    productimage: { borderColor: '#dddddd', backgroundColor: '#ffffff', borderWidth: 1, borderRadius: 10, width: '38%', height: 90, justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
    productdetails: { width: '58%' },
    spincontainer: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0, 0, 0, 0.8)' },
});

export default CartScreen;
