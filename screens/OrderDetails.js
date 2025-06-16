import AsyncStorage from '@react-native-async-storage/async-storage';
import { Box, Button, HStack, NativeBaseProvider, Stack, Text, Toast, VStack } from 'native-base';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, TouchableOpacity, StatusBar, View, Alert } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import { API_KEY, BASE_URL, CONTACT_HIER_ID, ORG_ID, PROGRAM_ID } from '../auth_provider/Config';
import { useTranslation } from 'react-i18next';

const OrderDetailsScreen = ({ navigation, route }) => {

    const { t } = useTranslation();

    const [loading, setLoading] = React.useState(false);
    const [lightColor, setLightColor] = React.useState("#cbf75e");
    const [darkColor, setDarkColor] = React.useState("#2BBB86");
    const [logoImage, setLogoImage] = React.useState("");

    const [details, setDetails] = useState("");
    const [images, setImages] = useState([]);

    const [allProducts, setAllProducts] = useState([]);

    useEffect(() => {
        setDetails(route.params.orderDetails);
        setAllProducts(route.params.orderDetails.order_item);
        console.log("*******************: ", JSON.stringify(route.params.orderDetails.order_item));
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
                formdata.append("orderId", route.params.orderId);
                formdata.append("orderItemId", "");
                console.log(formdata);
                fetch(`${BASE_URL}/myorders`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                    body: formdata
                })
                    .then((response) => response.json())
                    .then((responseJson) => {
                        console.log("Order Details:", responseJson);
                        if (responseJson.status == 'success') {
                            setLoading(false);
                            /* setDetails(responseJson.order_list[0]);
                            setImages(responseJson.order_list[0].product_image); */
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
                        //console.log("Order Details Error:", error);
                        Toast.show({ description: t("Sorry! Somthing went Wrong. Maybe Network request Failed") });
                    });
            } else {
                setLoading(false);
                AsyncStorage.clear();
                navigation.navigate('Login');
            }
        });
    }

    const cancelOrder = () => {
        Alert.alert(
            t("Warning"),
            t("Do you want to Cancel this Order") + "?",
            [
                { text: 'No', onPress: () => { return null } },
                {
                    text: 'Yes', onPress: () => {
                        setLoading(true);
                        AsyncStorage.getItem('userToken').then(val => {
                            if (val != null) {
                                let formdata = new FormData();
                                formdata.append("APIkey", `${API_KEY}`);
                                formdata.append("token", JSON.parse(val).token);
                                formdata.append("orgId", JSON.parse(val).org_id);
                                formdata.append("orderId", details.order_id);
                                formdata.append("itemId", "");
                                formdata.append("status", "Cancelled");
                                console.log(formdata);
                                fetch(`${BASE_URL}/cancel_order`, {
                                    method: 'POST',
                                    headers: {
                                        'Content-Type': 'multipart/form-data',
                                    },
                                    body: formdata
                                })
                                    .then((response) => response.json())
                                    .then((responseJson) => {
                                        console.log("Cancel Order:", responseJson);
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
                                        console.log("Remove Cart Error:", error);
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
                        <Text color="#111111" fontSize="16" textAlign="center" fontWeight="bold" textTransform="capitalize">{t("Order Details")}</Text>
                        <Image source={logoImage ? { uri: logoImage } : require('../assets/images/logo.png')} style={{ width: 60, height: 25, resizeMode: 'contain' }} />
                    </HStack>
                </LinearGradient>
                <Box flex={1}>
                    <ScrollView>
                        <LinearGradient
                            colors={[lightColor, darkColor]}
                            style={{ height: 80, position: 'absolute', top: 0, width: '100%', borderBottomEndRadius: 100, borderBottomStartRadius: 100, overflow: 'hidden' }}
                            start={{ x: 0.5, y: 0 }}
                        ></LinearGradient>
                        <Box padding="6">
                            <VStack bg="#eeeeee" space={2} padding="4" mb={6} borderRadius={12}>
                                <Box backgroundColor={"#ffffff"} paddingY={2} marginBottom={2}>
                                    <Text color="#111111" fontSize='lg' textAlign="center" fontWeight="bold" textTransform="capitalize">{details.combo_prod_name}</Text>
                                </Box>
                                <HStack justifyContent="space-between" alignItems="center">
                                    <Text color="#444444">{t("Order Number")}:</Text>
                                    <Text color="#111111" fontSize='xl' textAlign="center" fontWeight="bold" textTransform="capitalize">{details.order_id}</Text>
                                </HStack>
                                <HStack justifyContent="space-between" alignItems="center">
                                    <Text color="#444444">{t("Order Date")}:</Text>
                                    <Text color="#111111" style={{ width: 200 }} fontSize='sm' textAlign="right" fontWeight="medium" textTransform="capitalize">{details.orderDate}</Text>
                                </HStack>
                            </VStack>
                            <VStack space={3}>
                                {/* <VStack bg="#eeeeee" space={2} padding="4" marginY="4" borderRadius={12}>
                                    {details.status != "Open" && details.status != "Cancelled" && (
                                        <Stack space={2}>
                                            <HStack justifyContent="space-between" alignItems="center">
                                                <Text color="#444444">{t("AWB Number")}:</Text>
                                                <Text color="#111111" style={{ width: 200 }} fontSize='md' textAlign="right" fontWeight="medium" textTransform="capitalize">{details.awbNo}</Text>
                                            </HStack>
                                            <HStack justifyContent="space-between" alignItems="center">
                                                <Text color="#444444">{t("Courier Name")}:</Text>
                                                <Text color="#111111" style={{ width: 200 }} fontSize='md' textAlign="right" fontWeight="medium" textTransform="capitalize">{details.courierName}</Text>
                                            </HStack>
                                        </Stack>
                                    )}
                                </VStack> */}
                                <VStack bg="#eeeeee" space={2} padding="4" marginBottom="2" borderRadius={12}>
                                    <HStack justifyContent="space-between" alignItems="center">
                                        <Text color="#444444">{t("Address")}:</Text>
                                        <Text color="#111111" style={{ width: 200 }} fontSize='md' textAlign="right" fontWeight="medium" textTransform="capitalize">{details.address}</Text>
                                    </HStack>
                                    <HStack justifyContent="space-between" alignItems="center">
                                        <Text color="#444444">{t("State")}:</Text>
                                        <Text color="#111111" style={{ width: 200 }} fontSize='md' textAlign="right" fontWeight="medium" textTransform="capitalize">{details.state_name}</Text>
                                    </HStack>
                                    <HStack justifyContent="space-between" alignItems="center">
                                        <Text color="#444444">{t("City")}:</Text>
                                        <Text color="#111111" style={{ width: 200 }} fontSize='md' textAlign="right" fontWeight="medium" textTransform="capitalize">{details.city_name}</Text>
                                    </HStack>
                                    <HStack justifyContent="space-between" alignItems="center">
                                        <Text color="#444444">{t("Post Code")}:</Text>
                                        <Text color="#111111" style={{ width: 200 }} fontSize='md' textAlign="right" fontWeight="medium" textTransform="capitalize">{details.post_code}</Text>
                                    </HStack>
                                </VStack>
                                <Box borderBottomWidth={1} borderColor={'#999999'} paddingY={2} marginBottom={5}>
                                    <Text color="#111111" fontSize='lg' textAlign="center" fontWeight="medium" textTransform="capitalize">{("All Products")}</Text>
                                </Box>
                                <VStack>
                                    {allProducts.map((item, index) =>
                                        <Box key={index} style={styles.productbox}>
                                            <HStack space="4" justifyContent={'space-between'}>
                                                <Box style={[styles.productimage, { width: '28%', borderWidth: 1 }]}>
                                                    <Image source={{ uri: item.BaseUrl + item.product_image[0].product_image }} style={{ width: '100%', height: 90 }} resizeMode='cover' />
                                                </Box>
                                                <VStack style={[styles.productdetails, { width: '68%' }]}>
                                                    <Text fontSize='sm' fontWeight="bold" mb="2">{item.productName}</Text>
                                                    <HStack space="2" alignItems="center">
                                                        <Text fontSize='xs'>{t("Product Code")}:</Text>
                                                        <Text fontSize='xs' fontWeight="bold"> {item.productCode}</Text>
                                                    </HStack>
                                                    <HStack space="2" alignItems="center">
                                                        <Text fontSize='xs'>{t("Oerder Item Id")}:</Text>
                                                        <Text fontSize='xs' fontWeight="bold"> {item.orderItemId}</Text>
                                                    </HStack>
                                                    <HStack space="2" alignItems="center" mt="1" flexWrap="wrap">
                                                        <Text fontSize='xs'>{t("Status")}:</Text>
                                                        <Text fontSize='xs' fontWeight="bold">{item.status}</Text>
                                                    </HStack>
                                                </VStack>
                                            </HStack>
                                        </Box>
                                    )}
                                </VStack>
                            </VStack>
                            {details.hsn_code == 'egv' && details.canCancel == 1 && (
                                <Button variant="outline" mt={5} borderRadius={12} borderColor={darkColor} onPress={() => navigation.navigate('GiftVouchers')}>
                                    <Text color={darkColor} fontSize="md" fontWeight="medium">{t("Gift Vouchers")}</Text>
                                </Button>
                            )}
                        </Box>
                    </ScrollView>
                </Box>
                <LinearGradient
                    colors={[darkColor, lightColor]}
                    start={{ x: 0.5, y: 0 }}
                >
                    <HStack paddingY="3" paddingX="6" justifyContent="space-between">
                        {/* <VStack justifyContent="center">
                            <Text color="#111111" fontSize="xs" fontWeight="medium">{t("Total Points")}:</Text>
                            <HStack space={1} alignItems="center">
                                <Text color="#111111" fontSize="xl" fontWeight="bold">{details.totalPoints}</Text>
                                <Text color="#111111" fontSize="sm" fontWeight="bold">{t("Points")}</Text>
                            </HStack>
                        </VStack> */}
                        <Button style={[styles.solidBtn, { width: '100%' }]} onPress={() => cancelOrder()} isDisabled={details.canCancel == 0}>
                            <Text color="#ffffff" fontSize="md" fontWeight="medium">{t("Cancel Order")}</Text>
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
    noti: { color: '#ffffff', width: 18, height: 18, borderRadius: 20, position: 'absolute', top: -5, right: -3, fontSize: 11, lineHeight: 18, paddingTop: 1, textAlign: 'center' },
    productbox: { borderRadius: 15, borderColor: '#cccccc', backgroundColor: '#ffffff', marginBottom: 30, borderWidth: 5, padding: 15, marginHorizontal: 5 },
    solidBtn: { width: '48%', borderColor: '#111111', borderWidth: 2, backgroundColor: '#111111', borderRadius: 10 },
    spincontainer: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0, 0, 0, 0.8)' },
});

export default OrderDetailsScreen;
