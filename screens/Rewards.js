import AsyncStorage from '@react-native-async-storage/async-storage';
import { Box, HStack, NativeBaseProvider, Text, VStack, Toast, Stack, Actionsheet, useDisclose, Select, Button, Slider } from 'native-base';
import React, { useCallback, useEffect } from 'react';
import Icon from 'react-native-vector-icons/Ionicons';
import { ActivityIndicator, FlatList, Image, ImageBackground, ScrollView, StatusBar, StyleSheet, TouchableOpacity, View } from 'react-native';
import { API_KEY, BASE_URL, CONTACT_HIER_ID, ORG_ID, PROGRAM_ID } from '../auth_provider/Config';
import LinearGradient from 'react-native-linear-gradient';
import RangeSlider from 'react-native-range-slider-expo/src/RangeSlider';
import { useTranslation } from 'react-i18next';

const RewardScreen = ({ navigation, route }) => {

    const { t } = useTranslation();

    const [loading, setLoading] = React.useState(false);
    const [lightColor, setLightColor] = React.useState("#cbf75e");
    const [darkColor, setDarkColor] = React.useState("#2BBB86");
    const [notiColor, setNotiColor] = React.useState("#f04e23");
    const [logoImage, setLogoImage] = React.useState("");
    const [dataFound, setDataFound] = React.useState("");

    const [msgFound, setMsgFound] = React.useState(false);

    const [pageNumber, setPageNumber] = React.useState(1);
    const [isLoadMore, setIsLoadMore] = React.useState(true);
    const [allProducts, setAllProducts] = React.useState([]);
    const [inCart, setInCart] = React.useState("");
    const [allCategory, setAllCategory] = React.useState([]);

    const [cateId, setCateId] = React.useState("");
    const [sortBy, setSortBy] = React.useState("DESC");

    const { isOpen, onOpen, onClose } = useDisclose();
    const [pointRange, setPointRange] = React.useState("");
    const [fromValue, setFromValue] = React.useState("");
    const [toValue, setToValue] = React.useState("");

    const [msgValue, setMsgValue] = React.useState("");
    const [msgTitle, setMsgTitle] = React.useState("");
    const [slabRange, setslabRange] = React.useState("");


    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            setLoading(true);
            {
                route.params && (
                    setCateId(route.params.cateId)
                )
            };
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
                formdata.append("pageNumber", 1);
                formdata.append("min", fromValue);
                formdata.append("max", toValue);
                formdata.append("filter", 1);
                formdata.append("sortBy", sortBy);
                formdata.append("categoryId", route.params ? route.params.cateId : cateId);
                fetch(`${BASE_URL}/catalog`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                    body: formdata
                })
                    .then((response) => response.json())
                    .then((responseJson) => {
                        console.log("Rewards:", JSON.stringify(responseJson));
                        setMsgValue(responseJson.message);
                        if (responseJson.status == 'success') {
                            setLoading(false);
                            //countCart();
                            setAllProducts(responseJson.products);
                            setAllCategory(responseJson.categories);
                            setPointRange(responseJson.minMax);
                            setDataFound("found");
                            setMsgFound(true);
                            setslabRange(responseJson.slab_range);
                            setMsgTitle(responseJson.msg_title);
                            if (fromValue == "") {
                                setFromValue(responseJson.minMax.min);
                            }
                            if (toValue == "") {
                                setToValue(responseJson.minMax.max);
                            }
                        } else {
                            Toast.show({ description: responseJson.message });
                            setAllProducts([]);
                            setMsgFound(false);
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
                        //console.log("Rewards Error:", error);
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

    const onApply = () => {
        setLoading(true);
        onClose();
        getAllData();
    }

    const onClear = useCallback(() => {
        setLoading(true);
        onClose();
        setCateId("");
        setSortBy("DESC");
        setPageNumber(1);
        setIsLoadMore(true);
        setFromValue(pointRange.min);
        setToValue(pointRange.max);
        setTimeout(function () {
            getAllData();
        }, 1000);
    }, [],
    );

    const renderProduct = ({ item, index }) => {
        return (
            <VStack key={index} style={styles.productbox}>
                <TouchableOpacity onPress={() => navigation.navigate("ProductDetails", { details: item })}>
                    <Box style={styles.productimage}>
                        <Image source={{ uri: item.combo_prod_image_baseurl + item.combo_prod_image }} style={{ width: 100, height: 90 }} resizeMode='contain' />
                    </Box>
                    <Text fontWeight="bold" fontSize='md' color={darkColor} mb="2">{item.combo_prod_name}</Text>
                    <Text fontSize='xs'>{t("Combo of")} {item.product_list.length} {t("Products")}</Text>
                </TouchableOpacity>
            </VStack>
        );
    }

    const loadMore = () => {
        let num = pageNumber + 1;
        console.log(num);
        setLoading(true);
        AsyncStorage.getItem('userToken').then(val => {
            if (val != null) {
                let formdata = new FormData();
                formdata.append("APIkey", `${API_KEY}`);
                formdata.append("token", JSON.parse(val).token);
                formdata.append("orgId", JSON.parse(val).org_id);
                formdata.append("pageNumber", num);
                formdata.append("min", fromValue);
                formdata.append("max", toValue);
                formdata.append("filter", 1);
                formdata.append("sortBy", sortBy);
                formdata.append("categoryId", route.params ? route.params.cateId : cateId);
                fetch(`${BASE_URL}/catalog`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                    body: formdata
                })
                    .then((response) => response.json())
                    .then((responseJson) => {
                        if (responseJson.status == 'success') {
                            setLoading(false);
                            let newArrya = allProducts.concat(responseJson.products);
                            setAllProducts(newArrya);
                            setPageNumber(num);
                        } else {
                            setLoading(false);
                            setIsLoadMore(false);
                            setPageNumber(1);
                        }
                    })
                    .catch((error) => {
                        setLoading(false);
                        //console.log("Rewards Error:", error);
                        Toast.show({ description: t("Sorry! Somthing went Wrong. Maybe Network request Failed") });
                    });
            } else {
                setLoading(false);
                AsyncStorage.clear();
                navigation.navigate('Login');
            }
        });
    };

    return (
        <NativeBaseProvider>
            <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
            <Box flex={1} bg="white">
                <LinearGradient
                    colors={["#ffffff", lightColor]}
                    start={{ x: 0.5, y: 0 }}
                >
                    <HStack justifyContent="space-between" alignItems="center" paddingX="4" paddingY="3" space={2}>
                        <TouchableOpacity onPress={() => navigation.goBack()} style={{ width: 62 }}>
                            <Icon name="chevron-back" size={26} color="#111111" />
                        </TouchableOpacity>
                        <Text color="#111111" fontSize="16" textAlign="center" fontWeight="bold" textTransform="capitalize">{t("Rewards")}</Text>
                        <HStack space={2} style={{ width: 62 }}>
                            {/* <TouchableOpacity onPress={onOpen} style={{ position: 'relative' }}>
                                <Icon name="options" size={26} color="#111111" />
                            </TouchableOpacity> */}
                            {/* <TouchableOpacity onPress={() => navigation.push('Cart')} style={{ position: 'relative' }}>
                                <Icon name="cart" size={26} color="#111111" />
                                {inCart != 0 && (<Text style={[styles.noti, { backgroundColor: notiColor }]}>{inCart}</Text>)}
                            </TouchableOpacity> */}
                        </HStack>
                    </HStack>
                </LinearGradient>
                <ImageBackground source={require('../assets/images/bg.jpg')} imageStyle={{ resizeMode: 'contain', position: 'absolute', bottom: 0, top: '65%', opacity: allProducts.length < 5 ? 0.6 : 0 }} style={styles.bgimage}>
                    <ScrollView>
                        <LinearGradient
                            colors={[lightColor, darkColor]}
                            style={{ height: 80, position: 'absolute', top: 0, width: '100%', borderBottomEndRadius: 100, borderBottomStartRadius: 100, overflow: 'hidden' }}
                            start={{ x: 0.5, y: 0 }}
                        ></LinearGradient>
                        <Box padding="5">
                            {dataFound == "notfound" && (
                                <Stack space={5} style={[styles.productbox, { height: 350, width: '100%', marginHorizontal: 0, justifyContent: 'center', alignItems: 'center', padding: 30 }]}>
                                    <Icon name="hourglass-outline" size={80} color="#999999" />
                                    <Text fontSize='xl' fontWeight="bold" textAlign="center" color={'red.700'}>{msgValue}</Text>
                                </Stack>
                            )}
                            {dataFound == "found" && (
                                <Stack>
                                    <HStack flexWrap="wrap">
                                        <FlatList
                                            scrollEnabled={false}
                                            data={allProducts}
                                            renderItem={renderProduct}
                                            numColumns={2}
                                        />
                                    </HStack>
                                </Stack>
                            )}
                            {isLoadMore && allProducts.length > 19 && (
                                <HStack paddingY="3" paddingX="6" justifyContent="center">
                                    <Button variant="outline" size={'xs'} rounded={30} onPress={() => loadMore()}>
                                        <Text color="#bbbbbb">{t("Load More")}</Text>
                                    </Button>
                                </HStack>
                            )}
                        </Box>
                    </ScrollView>
                </ImageBackground>
                <Actionsheet isOpen={isOpen} onClose={onClose}>
                    <Actionsheet.Content>
                        <ScrollView style={{ width: '100%', paddingHorizontal: 15 }}>
                            <View style={styles.inputbox}>
                                <Select variant="underlined" size="md" placeholder={t("Select Category")} w="100%"
                                    InputLeftElement={<Icon name="funnel-outline" size={20} color="#666666" style={{ width: 25, marginLeft: 10, marginRight: 10, textAlign: 'center' }} />}
                                    selectedValue={cateId}
                                    onValueChange={value => setCateId(value)}
                                    _selectedItem={{
                                        backgroundColor: '#eeeeee',
                                        endIcon: <Icon name="checkmark-circle" size={22} color="#2BBB86" style={{ right: 0, position: 'absolute' }} />
                                    }}>
                                    {allCategory.map((item, index) =>
                                        <Select.Item key={index} label={item.categoryName} value={item.categoryId} />
                                    )}
                                </Select>
                            </View>
                            <View style={styles.inputbox}>
                                <Select variant="underlined" size="md" placeholder={t("Select Points Filter")} w="100%"
                                    InputLeftElement={<Icon name="cash-outline" size={20} color="#666666" style={{ width: 25, marginLeft: 10, marginRight: 10, textAlign: 'center' }} />}
                                    selectedValue={sortBy}
                                    onValueChange={value => setSortBy(value)}
                                    _selectedItem={{
                                        backgroundColor: '#eeeeee',
                                        endIcon: <Icon name="checkmark-circle" size={22} color="#2BBB86" style={{ right: 0, position: 'absolute' }} />
                                    }}>
                                    <Select.Item label="High to Low" value="DESC" />
                                    <Select.Item label="Low to High" value="ASC" />
                                </Select>
                            </View>
                            <Text textAlign="center" mt="5" fontWeight="bold">{t("Points Range")} ({fromValue} - {toValue})</Text>
                            <HStack justifyContent="space-between" alignItems="center">
                                <RangeSlider min={pointRange.min} max={pointRange.max} step={500}
                                    fromValueOnChange={value => setFromValue(value)}
                                    toValueOnChange={value => setToValue(value)}
                                    initialFromValue={fromValue}
                                    initialToValue={toValue}
                                    fromKnobColor={'#111111'}
                                    toKnobColor={'#111111'}
                                    knobSize={25}
                                    barHeight={8}
                                    showValueLabels={false}
                                    valueLabelsBackgroundColor='#444444'
                                    inRangeBarColor={darkColor}
                                />
                            </HStack>
                        </ScrollView>
                        <HStack paddingY="3" paddingX="6" mt={5} space={3} justifyContent="space-between">
                            <Button style={styles.outlineBtn} onPress={() => onClear()}>
                                <Text color="#111111" fontSize="md" fontWeight="medium">{t("Reset")}</Text>
                            </Button>
                            <Button style={styles.solidBtn} onPress={() => onApply()}>
                                <Text color="#ffffff" fontSize="md" fontWeight="medium">{t("Apply")}</Text>
                            </Button>
                        </HStack>
                    </Actionsheet.Content>
                </Actionsheet>
            </Box>
            {msgFound && (
                <View style={styles.spincontainer}>
                    <LinearGradient
                        colors={[lightColor, darkColor]}
                        start={{ x: 0.5, y: 0 }}
                        style={{ width: 300, borderRadius: 15, overflow: 'hidden' }}
                    >
                        <VStack space={1} w="100%" paddingX="5" paddingY="10" alignItems="center" justifyContent="center">
                            <Icon name="ribbon" size={100} color="#111111"></Icon>
                            <Text mt={5} marginBottom={5} fontSize="xl" fontWeight="bold" color="#111111">{msgTitle}</Text>
                            <Text marginBottom={1} fontSize="sm" fontWeight={'bold'} color={"#333333"}>----: {t("Slab Range")} :----</Text>
                            <Stack mb={5} height={50} justifyContent={'center'} alignItems={'center'} background={'black'} width={'80%'} borderRadius={30} overflow={'hidden'}>
                                <Text fontSize="lg" fontWeight="bold" color={lightColor}>{slabRange}</Text>
                            </Stack>
                            <Text textAlign="center" fontSize="sm" fontWeight="medium" color="#111111" mb={3}>{msgValue}</Text>
                            <HStack justifyContent="space-evenly" width="100%">
                                <Button size="sm" variant="outline" style={{ borderColor: '#111111', width: 110, borderRadius: 10, overflow: 'hidden' }} onPress={() => setMsgFound(false)} marginY={4}>
                                    <Text color="#111111" fontSize="sm" fontWeight="bold">{t("Continue")}</Text>
                                </Button>
                            </HStack>
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
    solidBtn: { width: '48%', borderColor: '#111111', borderWidth: 2, backgroundColor: '#111111', borderRadius: 10 },
    outlineBtn: { width: '48%', borderColor: '#111111', borderWidth: 2, backgroundColor: 'none', borderRadius: 10 },
    inputbox: { backgroundColor: 'rgba(0,0,0,0.06)', borderRadius: 12, width: '100%', overflow: 'hidden', marginVertical: 7 },
    noti: { color: '#ffffff', width: 18, height: 18, borderRadius: 20, position: 'absolute', top: -5, right: -3, fontSize: 11, lineHeight: 18, paddingTop: 1, textAlign: 'center', overflow: 'hidden' },
    productbox: { borderRadius: 15, width: '44%', marginHorizontal: '3%', marginBottom: '6%', backgroundColor: '#f6f6f6', padding: 15, borderColor: '#ffffff', borderWidth: 2, elevation: 10, shadowColor: '#666666', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.4, shadowRadius: 10, overflow: 'hidden' },
    productimage: { borderColor: '#dddddd', backgroundColor: '#ffffff', marginBottom: 10, borderWidth: 1, borderRadius: 10, width: '100%', height: 90, justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
    spincontainer: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0, 0, 0, 0.8)' },
});

export default RewardScreen;