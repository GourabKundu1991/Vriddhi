import AsyncStorage from '@react-native-async-storage/async-storage';
import { Box, Button, HStack, NativeBaseProvider, Text, Toast, VStack } from 'native-base';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, TouchableOpacity, StatusBar, View, useWindowDimensions, Alert } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import RenderHTML from 'react-native-render-html';
import Icon from 'react-native-vector-icons/Ionicons';
import { API_KEY, BASE_URL, CONTACT_HIER_ID, ORG_ID, PROGRAM_ID } from '../auth_provider/Config';
import { useTranslation } from 'react-i18next';

const ProductDetailsScreen = ({ navigation, route }) => {

    const { t } = useTranslation();

    const { width } = useWindowDimensions();

    const [loading, setLoading] = React.useState(false);
    const [lightColor, setLightColor] = React.useState("#cbf75e");
    const [darkColor, setDarkColor] = React.useState("#2BBB86");
    const [notiColor, setNotiColor] = React.useState("#f04e23");
    const [logoImage, setLogoImage] = React.useState("");

    const [userType, setUserType] = React.useState("");

    const [details, setDetails] = useState([]);
    const [allProducts, setAllProducts] = useState([]);
    const [inCart, setInCart] = React.useState("");

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            setLoading(true);
            getAllData();
        });
        return unsubscribe;
    }, [])

    const getAllData = () => {
        AsyncStorage.getItem('userToken').then(val => {
            if (val != null) {
                setLogoImage(JSON.parse(val).logo_url);
                setUserType(JSON.parse(val).member_type);

                setLightColor(JSON.parse(val).info.theme_color.light);
                setDarkColor(JSON.parse(val).info.theme_color.dark);

            } else {
                setLoading(false);
                AsyncStorage.clear();
                navigation.navigate('Login');
            }
        });
        setDetails(route.params.details);
        setAllProducts(route.params.details.product_list);
        //setImages(route.params.details.productImage);
        //countCart();
        setLoading(false);
    }

    const addToCart = (type) => {
        setLoading(true);
        AsyncStorage.getItem('userToken').then(val => {
            if (val != null) {
                let formdata = new FormData();
                formdata.append("APIkey", `${API_KEY}`);
                formdata.append("token", JSON.parse(val).token);
                formdata.append("orgId", JSON.parse(val).org_id);
                formdata.append("prod_id", details.productId);
                formdata.append("price", details.productOfferPrice);
                formdata.append("prod_name", details.productName);
                formdata.append("price_in_points", details.pricePoints);
                formdata.append("quantity", 1);
                fetch(`${BASE_URL}/addcart`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                    body: formdata
                })
                    .then((response) => response.json())
                    .then((responseJson) => {
                        //console.log("Add Cart:", responseJson);
                        if (responseJson.status == 'success') {
                            countCart();
                            Toast.show({ description: responseJson.message });
                            setTimeout(function () {
                                if (type == "BuyNow") {
                                    navigation.navigate('Cart');
                                }
                            }, 100);
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
                        //console.log("Add Cart Error:", error);
                        Toast.show({ description: t("Sorry! Somthing went Wrong. Maybe Network request Failed") });
                    });
            } else {
                setLoading(false);
                AsyncStorage.clear();
                navigation.navigate('Login');
            }
        });
    }

    const countCart = () => {
        AsyncStorage.getItem('userToken').then(val => {
            if (val != null) {
                let formdata = new FormData();
                formdata.append("token", JSON.parse(val).token);
                formdata.append("APIkey", `${API_KEY}`);
                fetch(`${BASE_URL}/cart_count`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                    body: formdata
                })
                    .then((response) => response.json())
                    .then((responseJson) => {
                        //console.log("Cart:", responseJson);
                        if (responseJson.status == 'success') {
                            setLoading(false);
                            setInCart(responseJson.cart_count);
                        } else {
                            Toast.show({ description: responseJson.message });
                            setLoading(false);
                        }
                    })
                    .catch((error) => {
                        setLoading(false);
                        //console.log("Cart Error:", error);
                        Toast.show({ description: t("Sorry! Somthing went Wrong. Maybe Network request Failed") });
                    });
            } else {
                setLoading(false);
                AsyncStorage.clear();
                navigation.navigate('Login');
            }
        });
    }

    const goAddress = () => {
        navigation.navigate('Address', { cartId: details.combo_prod_id });
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
                        <TouchableOpacity style={{ width: 62 }} onPress={() => navigation.goBack()}>
                            <Icon name="chevron-back" size={26} color="#111111" />
                        </TouchableOpacity>
                        <Text color="#111111" fontSize="16" textAlign="center" fontWeight="bold" textTransform="capitalize">{t("Product Details")}</Text>
                        <HStack space={2} style={{ width: 62 }}></HStack>
                        {/* <TouchableOpacity onPress={() => navigation.push('Cart')} style={{ position: 'relative' }}>
                            <Icon name="cart" size={26} color="#111111" />
                            {inCart != 0 && (<Text style={[styles.noti, { backgroundColor: notiColor }]}>{inCart}</Text>)}
                        </TouchableOpacity> */}
                    </HStack>
                </LinearGradient>
                <ScrollView>
                    <LinearGradient
                        colors={[lightColor, darkColor]}
                        style={{ height: 150, position: 'absolute', top: 0, width: '100%', borderBottomEndRadius: 100, borderBottomStartRadius: 100, overflow: 'hidden' }}
                        start={{ x: 0.5, y: 0 }}
                    ></LinearGradient>
                    <Box padding="6">
                        <Box style={styles.productbox}>
                            <Image source={details.combo_prod_image_baseurl ? { uri: details.combo_prod_image_baseurl + details.combo_prod_image } : require('../assets/images/noimage.jpg')} style={{ width: '100%', height: 200 }} resizeMode='contain' />
                        </Box>
                        <VStack space={3}>
                            <Text color="#111111" fontSize='lg' textAlign="center" fontWeight="medium" textTransform="capitalize">{details.combo_prod_name}</Text>
                            <VStack bg="#eeeeee" space={2} padding="4" marginY="4" borderRadius={12}>
                                <HStack justifyContent="space-between" alignItems="center">
                                    <Text color="#444444">{t("Product Code")}:</Text>
                                    <Text color="#111111" style={{ width: 200 }} fontSize='sm' textAlign="right" fontWeight="bold" textTransform="capitalize">{details.combo_prod_code}</Text>
                                </HStack>
                                <VStack>
                                    <Text color="#444444">{t("Description")}:</Text>
                                    <RenderHTML contentWidth={width} baseStyle={{ color: '#111111', fontSize: 14, fontWeight: 'bold' }} source={{ html: details.combo_prod_description }} />
                                </VStack>
                            </VStack>
                        </VStack>
                        <Box borderBottomWidth={1} borderColor={'#999999'} paddingY={2} marginY={2} marginBottom={5}>
                            <Text color="#111111" fontSize='lg' textAlign="center" fontWeight="medium" textTransform="capitalize">{t("All Products")}</Text>
                        </Box>
                        <VStack>
                            {allProducts.map((item, index) =>
                                <Box key={index} style={styles.productbox}>
                                    <HStack space="4" justifyContent={'space-between'}>
                                        <Box style={[styles.productimage, {width: '28%', borderWidth: 1}]}>
                                            <Image source={{ uri: item.baseUrl + item.productImage[0].product_image }} style={{ width: '100%', height: 90 }} resizeMode='cover' />
                                        </Box>
                                        <VStack style={[styles.productdetails, {width: '68%'}]}>
                                            <Text fontSize='sm' fontWeight="bold" mb="2">{item.productName}</Text>
                                            <HStack space="2" alignItems="center">
                                                <Text fontSize='xs'>{t("Product Code")}:</Text>
                                                <Text fontSize='xs' fontWeight="bold"> {item.productCode}</Text>
                                            </HStack>
                                            <HStack space="2" alignItems="center" mt="1" flexWrap="wrap">
                                                <Text fontSize='xs'>{t("Description")}:</Text>
                                                <RenderHTML contentWidth={width} baseStyle={{ color: '#111111', fontSize: 14, fontWeight: 'bold' }} source={{ html: item.productDesc }} />
                                            </HStack>
                                        </VStack>
                                    </HStack>
                                </Box>
                            )}
                        </VStack>
                    </Box>
                </ScrollView>
                {userType != 'CSO' && (
                    <LinearGradient
                        colors={[darkColor, lightColor]}
                        start={{ x: 0.5, y: 0 }}
                    >
                        <HStack paddingY="3" paddingX="6" justifyContent="space-between">
                            {/* <Button style={styles.outlineBtn} onPress={() => addToCart("AddCart")}>
                                <Text color="#111111" fontSize="md" fontWeight="medium">{t("Add to Cart")}</Text>
                            </Button> */}
                            <Button style={[styles.solidBtn, {width: '100%'}]} onPress={() => goAddress()}>
                                <Text color="#ffffff" fontSize="md" fontWeight="medium">{t("Redeem Now")}</Text>
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
    noti: { color: '#ffffff', width: 18, height: 18, borderRadius: 20, position: 'absolute', top: -5, right: -3, fontSize: 11, lineHeight: 18, paddingTop: 1, textAlign: 'center' },
    productbox: { borderRadius: 15, borderColor: '#cccccc', backgroundColor: '#ffffff', marginBottom: 30, borderWidth: 5, padding: 15, marginHorizontal: 5 },
    solidBtn: { width: '48%', borderColor: '#111111', borderWidth: 2, backgroundColor: '#111111', borderRadius: 10 },
    outlineBtn: { width: '48%', borderColor: '#111111', borderWidth: 2, backgroundColor: 'none', borderRadius: 10 },
    spincontainer: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0, 0, 0, 0.8)' },
});

export default ProductDetailsScreen;
