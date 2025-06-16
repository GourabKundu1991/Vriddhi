import AsyncStorage from '@react-native-async-storage/async-storage';
import { Box, Button, HStack, Input, NativeBaseProvider, ScrollView, Stack, Text, Toast, VStack } from 'native-base';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, StyleSheet, TouchableOpacity, StatusBar, View, ImageBackground, Pressable, Linking } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import { API_KEY, BASE_URL, CONTACT_HIER_ID, ORG_ID, PROGRAM_ID } from '../auth_provider/Config';
import { useTranslation } from 'react-i18next';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import moment from 'moment';
import ReactNativeBlobUtil from 'react-native-blob-util';


const MemberDetailsScreen = ({ navigation, route }) => {

    const { t } = useTranslation();

    const [loading, setLoading] = React.useState(false);
    const [lightColor, setLightColor] = React.useState("#cbf75e");
    const [darkColor, setDarkColor] = React.useState("#2BBB86");
    const [logoImage, setLogoImage] = React.useState("");
    const [pageTitle, setPageTitle] = React.useState("");

    const [saleList, setSaleList] = React.useState([]);
    const [orderList, setOrderList] = React.useState([]);
    const [pointList, setPointList] = React.useState([]);
    const [TDSPointList, setTDSPointList] = React.useState([]);
    const [memberName, setMemberName] = React.useState("");
    const [memberType, setMemberType] = React.useState("");
    const [dealerName, setDealerName] = React.useState("");
    const [dealerCode, setDealerCode] = React.useState("");
    const [memberPhone, setMemberPhone] = React.useState("");
    const [currentBalance, setCurrentBalance] = React.useState("");
    const [memberCode, setmemberCode] = React.useState("");

    const [dataFound, setDataFound] = React.useState("");
    const [pop, setPop] = React.useState(false);
    const [startDate, setStartDate] = React.useState("");
    const [endDate, setEndDate] = React.useState("");
    const [isDatePickerVisible, setDatePickerVisibility] = React.useState(false);
    const [dateType, setDateType] = React.useState("");

    const showDatePicker = (val) => {
        setDatePickerVisibility(true);
        setDateType(val);
    };

    const hideDatePicker = () => {
        setDatePickerVisibility(false);
    };

    const handleConfirm = (date) => {
        hideDatePicker();
        if (dateType == "startdate") {
            setStartDate(date);
        } else {
            setEndDate(date);
        }
    };

    useEffect(() => {
        setLoading(true);
        getAllData(route.params.pagetitle);
        setPageTitle(route.params.pagetitle);
    }, [])

    const getAllData = (type) => {
        AsyncStorage.getItem('userToken').then(val => {
            if (val != null) {
                setLogoImage(JSON.parse(val).logo_url);

                setLightColor(JSON.parse(val).info.theme_color.light);
                setDarkColor(JSON.parse(val).info.theme_color.dark);

                let formdata = new FormData();
                formdata.append("APIkey", `${API_KEY}`);
                formdata.append("token", JSON.parse(val).token);
                formdata.append("orgId", JSON.parse(val).org_id);
                formdata.append("memberId", route.params.id);
                formdata.append("pageNumber", 1);
                formdata.append("altOrgId", route.params.altId);
                console.log(formdata);
                if (type == "Lifting History") {
                    fetch(`${BASE_URL}/childMemberSales`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'multipart/form-data',
                        },
                        body: formdata
                    })
                        .then((response) => response.json())
                        .then((responseJson) => {
                            //console.log("lifting:", responseJson);
                            if (responseJson.status == 'success') {
                                setSaleList(responseJson.trnasc_list);
                                setLoading(false);
                                setDataFound("found");
                            } else {
                                Toast.show({ description: responseJson.message });
                                setSaleList([]);
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
                            //console.log("lifting Error:", error);
                            Toast.show({ description: t("Sorry! Somthing went Wrong. Maybe Network request Failed") });
                        });
                } else if (type == "Order History") {
                    fetch(`${BASE_URL}/childMemberOrders`, {
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
                                setOrderList(responseJson.order_list);
                                setLoading(false);
                                setDataFound("found");
                            } else {
                                Toast.show({ description: responseJson.message });
                                setOrderList([]);
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
                } else if (type == "Point History") {
                    fetch(`${BASE_URL}/member_details`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'multipart/form-data',
                        },
                        body: formdata
                    })
                        .then((response) => response.json())
                        .then((responseJson) => {
                            console.log("Point:", responseJson);
                            if (responseJson.status == 'success') {
                                setPointList(responseJson.trnasc_list);
                                setTDSPointList(responseJson.tds_trnasc_list);
                                setMemberName(responseJson.member_name);
                                setDealerName(responseJson.dealer_company_name);
                                setDealerCode(responseJson.member_dealer_code);
                                setMemberPhone(responseJson.member_ph_number);
                                setCurrentBalance(responseJson.current_balance);
                                setmemberCode(responseJson.member_code);
                                setMemberType(responseJson.influencer_member_type);
                                setLoading(false);
                                setDataFound("found");
                            } else {
                                Toast.show({ description: responseJson.message });
                                setPointList([]);
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
                            //console.log("Point Error:", error);
                            Toast.show({ description: t("Sorry! Somthing went Wrong. Maybe Network request Failed") });
                        });
                }
            } else {
                setLoading(false);
                AsyncStorage.clear();
                navigation.navigate('Login');
            }
        });
    }

    const openForDownload = () => {
        setPop(true);
    }
    const onCancel = () => {
        setPop(false);
        setStartDate("");
        setEndDate("");
    }

    const onDownload = () => {
        let oneYear = Math.floor((endDate - startDate) / (1000 * 60 * 60 * 24));
        if (startDate == "") {
            Toast.show({ description: t("Please select Start Date") });
        } else if (endDate == "") {
            Toast.show({ description: t("Please select End Date") });
        } else if (oneYear > 365) {
            Toast.show({ description: t("You can download Maximum 1 year data") });
        } else {
            setLoading(true);
            AsyncStorage.getItem('userToken').then(val => {
                if (val != null) {
                    let formdata = new FormData();
                    formdata.append("APIkey", `${API_KEY}`);
                    formdata.append("token", JSON.parse(val).token);
                    formdata.append("orgId", JSON.parse(val).org_id);
                    formdata.append("startDate", moment(startDate).format("YYYY-MM-DD"));
                    formdata.append("endDate", moment(endDate).format("YYYY-MM-DD"));
                    fetch(`${BASE_URL}/reward_points_pdf_download`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'multipart/form-data',
                        },
                        body: formdata
                    })
                        .then((response) => response.json())
                        .then((responseJson) => {
                            //console.log("PDF:", responseJson);
                            if (responseJson.status == 'success') {
                                onImport(responseJson.file_path);
                                onCancel();
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
                            //console.log("PDF Error:", error);
                            Toast.show({ description: t("Sorry! Somthing went Wrong. Maybe Network request Failed") });
                        });
                } else {
                    setLoading(false);
                    AsyncStorage.clear();
                    navigation.navigate('Login');
                }
            });
        }
    };

    const onImport = (path) => {
        const fileName = "Point_Statement_" + moment(startDate).format("DD-MMMM-YYYY") + "_to_" + moment(endDate).format("DD-MMMM-YYYY");
        let dirs = ReactNativeBlobUtil.fs.dirs;
        ReactNativeBlobUtil.config({
            fileCache: true,
            appendExt: 'pdf',
            path: `${dirs.DocumentDir}/${fileName}`,
            addAndroidDownloads: {
                useDownloadManager: true,
                notification: true,
                title: fileName,
                description: 'File downloaded by download manager.',
                mime: 'application/pdf',
            },
        })
            .fetch('GET', path)
            .then((res) => {
                setLoading(false);
                // in iOS, we want to save our files by opening up the saveToFiles bottom sheet action.
                // whereas in android, the download manager is handling the download for us.
                if (Platform.OS === 'ios') {
                    const filePath = res.path();
                    let options = {
                        type: 'application/pdf',
                        url: filePath,
                        saveToFiles: true,
                    };
                    Share.open(options)
                        .then((resp) => console.log(resp))
                        .catch((err) => console.log(err));
                }
            })
            .catch((err) => console.log('BLOB ERROR -> ', err));
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
                        <TouchableOpacity onPress={() => navigation.goBack()} style={{ width: 60 }}>
                            <Icon name="chevron-back" size={26} color="#111111" />
                        </TouchableOpacity>
                        <Text color="#111111" fontSize="16" textAlign="center" fontWeight="bold" textTransform="capitalize">{pageTitle}</Text>
                        <Image source={logoImage ? { uri: logoImage } : require('../assets/images/logo.png')} style={{ width: 60, height: 25, resizeMode: 'contain' }} />
                    </HStack>
                </LinearGradient>
                {pageTitle == "Lifting History" && (
                    <ImageBackground source={require('../assets/images/bg.jpg')} imageStyle={{ resizeMode: 'contain', position: 'absolute', bottom: 0, top: '65%', opacity: saleList.length < 3 ? 0.6 : 0 }} style={styles.bgimage}>
                        <ScrollView>
                            <LinearGradient
                                colors={[lightColor, darkColor]}
                                style={{ height: 150, position: 'absolute', top: 0, width: '100%', borderBottomEndRadius: 100, borderBottomStartRadius: 100, overflow: 'hidden' }}
                                start={{ x: 0.5, y: 0 }}
                            ></LinearGradient>
                            {dataFound == "notfound" && (
                                <VStack flex={1} padding="6" alignItems="center">
                                    <Stack space={5} style={[styles.productbox, { height: 350, justifyContent: 'center', alignItems: 'center', padding: 30 }]}>
                                        <Icon name="hourglass-outline" size={80} color="#999999" />
                                        <Text fontSize='lg' fontWeight="bold" textAlign="center" color="#111111">{t("Result Not Found")}</Text>
                                        <Text fontSize='sm' fontWeight="medium" textAlign="center" color="#666666">{t("Whoops... This Information is not available for a moment")}</Text>
                                    </Stack>
                                </VStack>
                            )}
                            {dataFound == "found" && (
                                <Box padding="5">
                                    <VStack>
                                        {saleList.map((item, index) =>
                                            <VStack style={styles.productbox} key={index}>
                                                <HStack paddingY="2" borderColor="#dddddd" borderBottomWidth="1" justifyContent="space-between" alignItems="center">
                                                    <Text fontSize='xs' fontWeight="bold" color="#666666">{t("Transaction ID")}:</Text>
                                                    <Text fontSize='sm' fontWeight="bold" color="#111111">#{item.id}</Text>
                                                </HStack>
                                                <HStack paddingY="2" borderColor="#dddddd" borderBottomWidth="1" justifyContent="space-between" alignItems="center">
                                                    <Text fontSize='xs' fontWeight="bold" color="#666666">{t("Product")}:</Text>
                                                    <Text fontSize='sm' fontWeight="bold" color="#111111">#{item.product_name}</Text>
                                                </HStack>
                                                <HStack paddingY="2" borderColor="#dddddd" borderBottomWidth="1" justifyContent="space-between" alignItems="center">
                                                    <Text fontSize='xs' fontWeight="bold" color="#666666">{t("Quantity")}:</Text>
                                                    <Text fontSize='sm' fontWeight="bold" color="#111111">{item.tonnage_sold}</Text>
                                                </HStack>
                                                <HStack paddingY="2" justifyContent="space-between" alignItems="center">
                                                    <Text fontSize='xs' fontWeight="bold" color="#666666">{t("Date")}:</Text>
                                                    <Text fontSize='sm' fontWeight="bold" color="#111111">{item.sale_date}</Text>
                                                </HStack>
                                            </VStack>
                                        )}
                                    </VStack>
                                </Box>
                            )}
                        </ScrollView>
                    </ImageBackground>
                )}
                {pageTitle == "Order History" && (
                    <ImageBackground source={require('../assets/images/bg.jpg')} imageStyle={{ resizeMode: 'contain', position: 'absolute', bottom: 0, top: '65%', opacity: orderList.length < 4 ? 0.6 : 0 }} style={styles.bgimage}>
                        <ScrollView>
                            <LinearGradient
                                colors={[lightColor, darkColor]}
                                style={{ height: 120, position: 'absolute', top: 0, width: '100%', borderBottomEndRadius: 100, borderBottomStartRadius: 100, overflow: 'hidden' }}
                                start={{ x: 0.5, y: 0 }}
                            ></LinearGradient>
                            {dataFound == "notfound" && (
                                <VStack flex={1} padding="6" alignItems="center">
                                    <Stack space={5} style={[styles.productbox, { height: 350, justifyContent: 'center', alignItems: 'center', padding: 30 }]}>
                                        <Icon name="hourglass-outline" size={80} color="#999999" />
                                        <Text fontSize='lg' fontWeight="bold" textAlign="center" color="#111111">{t("Result Not Found")}</Text>
                                        <Text fontSize='sm' fontWeight="medium" textAlign="center" color="#666666">{t("Whoops... This Information is not available for a moment")}</Text>
                                    </Stack>
                                </VStack>
                            )}
                            {dataFound == "found" && (
                                <Box padding="5">
                                    <VStack>
                                        {orderList.map((item, index) =>
                                            <Box key={index} style={styles.productbox}>
                                                <HStack space="4">
                                                    <Box style={styles.productimage}>
                                                        <Image source={item.product_image ? { uri: item.BaseUrl + item.product_image } : require('../assets/images/noimage.jpg')} style={{ width: 100, height: 90 }} resizeMode='contain' />
                                                    </Box>
                                                    <VStack style={styles.productdetails}>
                                                        <Text fontSize='sm' fontWeight="bold" mb="2">{item.productName}</Text>
                                                        <HStack space="2" alignItems="center">
                                                            <Text fontSize='xs'>{t("Order ID")}:</Text>
                                                            <Text fontSize='md' fontWeight="bold"> {item.orderId}</Text>
                                                        </HStack>
                                                        <HStack space="2" alignItems="center">
                                                            <Text fontSize='xs'>{t("Order Item ID")}:</Text>
                                                            <Text fontSize='md' fontWeight="bold"> {item.orderItemId}</Text>
                                                        </HStack>
                                                        <HStack space="2" alignItems="center">
                                                            <Text fontSize='xs'>{t("Date")}:</Text>
                                                            <Text fontSize='xs' fontWeight="medium"> {item.orderDate}</Text>
                                                        </HStack>
                                                        <HStack space="2" alignItems="center" mt="1">
                                                            <Text fontSize='xs'>{t("Status")}:</Text>
                                                            <Text fontSize='sm' fontWeight="bold">{item.status}</Text>
                                                        </HStack>
                                                    </VStack>
                                                </HStack>
                                            </Box>
                                        )}
                                    </VStack>
                                </Box>
                            )}
                        </ScrollView>
                    </ImageBackground>
                )}
                {pageTitle == "Point History" && (
                    <ScrollView>
                        <LinearGradient
                            colors={[lightColor, darkColor]}
                            style={{ height: 150, position: 'absolute', top: 0, width: '100%', borderBottomEndRadius: 100, borderBottomStartRadius: 100, overflow: 'hidden' }}
                            start={{ x: 0.5, y: 0 }}
                        ></LinearGradient>
                        {dataFound == "notfound" && (
                            <VStack flex={1} padding="6" alignItems="center">
                                <Stack space={5} style={[styles.productbox, { height: 350, justifyContent: 'center', alignItems: 'center', padding: 30 }]}>
                                    <Icon name="hourglass-outline" size={80} color="#999999" />
                                    <Text fontSize='lg' fontWeight="bold" textAlign="center" color="#111111">{t("Result Not Found")}</Text>
                                    <Text fontSize='sm' fontWeight="medium" textAlign="center" color="#666666">{t("Whoops... This Information is not available for a moment")}</Text>
                                </Stack>
                            </VStack>
                        )}
                        {dataFound == "found" && (
                            <Box padding="5">
                                <VStack>
                                    <VStack style={styles.productbox} padding="15">
                                        <HStack paddingY="2" borderColor="#dddddd" borderBottomWidth="1" justifyContent="space-between" alignItems="center">
                                            <Text fontSize='xs' fontWeight="bold" color="#666666" w={'40%'}>{t("Member Name")}:</Text>
                                            <Text fontSize='sm' fontWeight="bold" color="#111111" w={'55%'} textAlign="right">{memberName}</Text>
                                        </HStack>
                                        <HStack paddingY="2" borderColor="#dddddd" borderBottomWidth="1" justifyContent="space-between" alignItems="center">
                                            <Text fontSize='xs' fontWeight="bold" color="#666666" w={'40%'}>{t("Member Code")}:</Text>
                                            <Text fontSize='sm' fontWeight="bold" color="#111111" w={'55%'} textAlign="right">{memberCode}</Text>
                                        </HStack>
                                        {memberType != "" && (
                                            <HStack paddingY="2" borderColor="#dddddd" borderBottomWidth="1" justifyContent="space-between" alignItems="center">
                                                <Text fontSize='xs' fontWeight="bold" color="#666666" w={'40%'}>{t("Member Type")}:</Text>
                                                <Text fontSize='sm' fontWeight="bold" color="#111111" w={'55%'} textAlign="right">{memberType}</Text>
                                            </HStack>
                                        )}
                                        <HStack paddingY="2" borderColor="#dddddd" borderBottomWidth="1" justifyContent="space-between" alignItems="center">
                                            <Text fontSize='xs' fontWeight="bold" color="#666666" w={'40%'}>{t("Dealer Firm Name")}:</Text>
                                            <Text fontSize='sm' fontWeight="bold" color="#111111" w={'55%'} textAlign="right">{dealerName}</Text>
                                        </HStack>
                                        <HStack paddingY="2" borderColor="#dddddd" borderBottomWidth="1" justifyContent="space-between" alignItems="center">
                                            <Text fontSize='xs' fontWeight="bold" color="#666666" w={'40%'}>{t("Dealer Code")}:</Text>
                                            <Text fontSize='sm' fontWeight="bold" color="#111111" w={'55%'} textAlign="right">{dealerCode}</Text>
                                        </HStack>
                                        <HStack paddingY="2" borderColor="#dddddd" borderBottomWidth="1" justifyContent="space-between" alignItems="center">
                                            <Text fontSize='xs' fontWeight="bold" color="#666666" w={'40%'}>{t("Mobile")}:</Text>
                                            <Pressable w={'55%'} onPress={() => { Linking.openURL(`tel:${memberPhone}`) }}><Text fontSize='sm' fontWeight="bold" color={darkColor} textAlign="right">{memberPhone}</Text></Pressable>
                                        </HStack>
                                        <HStack paddingY="2" justifyContent="space-between" alignItems="center">
                                            <Text fontSize='xs' fontWeight="bold" color="#666666" w={'40%'}>{t("Available Points")}:</Text>
                                            <Text fontSize='sm' fontWeight="bold" color="#111111" w={'55%'} textAlign="right">{currentBalance}</Text>
                                        </HStack>
                                    </VStack>
                                    {pointList.length != 0 && (
                                        <Box style={styles.productbox} mt={4} mb={0}>
                                            <LinearGradient
                                                colors={["#999999", "#000000"]}
                                                start={{ x: 0.5, y: 0 }}
                                                height={40}
                                            >
                                                <Button size="sm" variant="link" _text={{ color: "#ffffff", fontWeight: 'bold', fontSize: 13 }} onPress={() => openForDownload()}>{t("Download Statement")}</Button>
                                            </LinearGradient>
                                        </Box>
                                    )}
                                    <Box style={[styles.productbox, { padding: 0 }]} mt="5">
                                        <LinearGradient
                                            colors={[lightColor, darkColor]}
                                            start={{ x: 0.5, y: 0 }}
                                            style={{ padding: 10 }}
                                        >
                                            <Text color="#111111" fontSize="14" textAlign="center" fontWeight="bold">{t("Point Statement")}</Text>
                                        </LinearGradient>
                                        {pointList.length == 0 ?
                                            <HStack padding="10" justifyContent="center">
                                                <Text fontSize='sm' color="#888888">----- {t("No Data Available")} -----</Text>
                                            </HStack>
                                            :
                                            <ScrollView style={{ maxHeight: 350 }} nestedScrollEnabled={true}>
                                                <VStack padding="4" space="3">
                                                    {pointList.map((item, index) =>
                                                        <Box key={index} borderWidth="1" borderColor="#aaaaaa" borderStyle="dashed" borderRadius="10" overflow="hidden">
                                                            <HStack alignItems="center" bg="#ffffff" borderTopRadius="10">
                                                                <VStack padding="4">
                                                                    {item.transaction_type == "Credit" ?
                                                                        <Text bg="#f04e23" style={styles.note}>C</Text>
                                                                        :
                                                                        <Text bg="#2BBB86" style={styles.note}>D</Text>
                                                                    }
                                                                </VStack>
                                                                <VStack padding="2" w="30%">
                                                                    <Text fontSize='xs' color="#666666">{t("Points")}:</Text>
                                                                    <Text fontSize='sm' color="#111111" fontWeight="medium">{item.reward_points}</Text>
                                                                </VStack>
                                                                <VStack padding="2" w="50%">
                                                                    <Text fontSize='xs' color="#666666">{t("Type")}:</Text>
                                                                    <Text fontSize='sm' color="#111111" fontWeight="medium">{item.transaction_type}</Text>
                                                                </VStack>
                                                            </HStack>
                                                            <HStack alignItems="center">
                                                                <VStack padding="2" w="40%">
                                                                    <Text fontSize='xs' color="#666666">{t("Description")}:</Text>
                                                                    <Text fontSize='sm' color="#111111" fontWeight="medium">{item.transaction_desc}</Text>
                                                                </VStack>
                                                                <VStack padding="2">
                                                                    <Text fontSize='xs' color="#666666">{t("Date")}:</Text>
                                                                    {item.transaction_type == "Credit" ?
                                                                        <Text fontSize='sm' color="#111111" fontWeight="medium">{item.till_date}</Text>
                                                                        :
                                                                        <Text fontSize='sm' color="#111111" fontWeight="medium">{item.created_at}</Text>
                                                                    }
                                                                </VStack>
                                                            </HStack>
                                                            {item.comment != "" && (
                                                                <HStack alignItems="center" bg="#eeeeee" borderBottomRadius="10">
                                                                    <VStack padding="2">
                                                                        <Text fontSize='xs' color="#666666">{t("Narration")}:</Text>
                                                                        <Text fontSize='sm' color="#111111" fontWeight="medium">{item.comment}</Text>
                                                                    </VStack>
                                                                </HStack>
                                                            )}
                                                        </Box>
                                                    )}
                                                </VStack>
                                            </ScrollView>
                                        }
                                    </Box>
                                    <Box style={[styles.productbox, { padding: 0 }]}>
                                        <LinearGradient
                                            colors={[lightColor, darkColor]}
                                            start={{ x: 0.5, y: 0 }}
                                            style={{ padding: 10 }}
                                        >
                                            <Text color="#111111" fontSize="14" textAlign="center" fontWeight="bold">{t("TDS Point Statement")}</Text>
                                        </LinearGradient>
                                        {TDSPointList.length == 0 ?
                                            <HStack padding="10" justifyContent="center">
                                                <Text fontSize='sm' color="#888888">----- {t("No Data Available")} -----</Text>
                                            </HStack>
                                            :
                                            <ScrollView style={{ maxHeight: 350 }} nestedScrollEnabled={true}>
                                                <VStack padding="4" space="3">
                                                    {TDSPointList.map((item, index) =>
                                                        <Box key={index} borderWidth="1" borderColor="#aaaaaa" borderStyle="dashed" borderRadius="10" overflow="hidden">
                                                            <HStack justifyContent="space-evenly" alignItems="center" bg="#ffffff" borderTopRadius="10">
                                                                <VStack padding="2" w="33%">
                                                                    <Text fontSize='xs' color="#666666">{t("Date")}:</Text>
                                                                    <Text fontSize='sm' color="#111111" fontWeight="medium">{item.created_at}</Text>
                                                                </VStack>
                                                                <VStack padding="2" w="33%">
                                                                    <Text fontSize='xs' color="#666666">{t("Type")}:</Text>
                                                                    <Text fontSize='sm' color="#111111" fontWeight="medium">{item.type}</Text>
                                                                </VStack>
                                                                <VStack padding="2" w="33%">
                                                                    <Text fontSize='xs' color="#666666">{t("Points")}:</Text>
                                                                    <Text fontSize='sm' color="#111111" fontWeight="medium">{item.debited_points}</Text>
                                                                </VStack>
                                                            </HStack>
                                                            <HStack alignItems="center">
                                                                <VStack padding="2">
                                                                    <Text fontSize='xs' color="#666666">{t("Description")}:</Text>
                                                                    <Text fontSize='sm' color="#111111" fontWeight="medium">{item.comment}</Text>
                                                                </VStack>
                                                            </HStack>
                                                        </Box>
                                                    )}
                                                </VStack>
                                            </ScrollView>
                                        }
                                    </Box>
                                </VStack>
                            </Box>
                        )}
                    </ScrollView>
                )}
            </Box>
            {pop && (
                <VStack flex={1} style={{ backgroundColor: "rgba(0,0,0,0.85)", position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center', padding: 30 }}>
                    <Box style={styles.productbox} padding={3}>
                        <Stack space={5} alignItems="center">
                            <Text color="#444444" fontSize="md" fontWeight="bold">{t("Select Statement Date")}</Text>
                            <Pressable style={styles.inputbox} onPress={() => showDatePicker("startdate")}>
                                <HStack paddingY={Platform.OS == "ios" ? "1.5" : "2.5"}>
                                    <Icon name="calendar-outline" size={20} color="#f04e23" style={{ width: 25, marginLeft: 10, marginRight: 10, textAlign: 'center' }} />
                                    <Text color={startDate != "" ? "#111111" : "#999999"} fontSize="md">{startDate != "" ? moment(startDate).format("DD MMMM, YYYY") : t("Start Date") + " *"}</Text>
                                </HStack>
                            </Pressable>
                            <Pressable style={styles.inputbox} onPress={() => showDatePicker("enddate")}>
                                <HStack paddingY={Platform.OS == "ios" ? "1.5" : "2.5"}>
                                    <Icon name="calendar-outline" size={20} color="#f04e23" style={{ width: 25, marginLeft: 10, marginRight: 10, textAlign: 'center' }} />
                                    <Text color={endDate != "" ? "#111111" : "#999999"} fontSize="md">{endDate != "" ? moment(endDate).format("DD MMMM, YYYY") : t("End Date") + " *"}</Text>
                                </HStack>
                            </Pressable>
                            <DateTimePickerModal
                                isVisible={isDatePickerVisible}
                                mode="date"
                                onConfirm={handleConfirm}
                                onCancel={hideDatePicker}
                                maximumDate={new Date()}
                            />
                        </Stack>
                        <HStack space={1} alignItems="center" justifyContent="space-evenly" bg="#eeeeee" borderRadius="10" overflow="hidden" padding="2" mt="3">
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
                                <Button size="xs" variant="link" _text={{ color: "#ffffff", fontWeight: 'bold', fontSize: 13 }} onPress={() => onDownload()}>{t("Download")}</Button>
                            </LinearGradient>
                        </HStack>
                    </Box>
                </VStack>
            )}
            {loading && (
                <View style={styles.spincontainer}>
                    <ActivityIndicator animating={loading} size="large" color={darkColor} />
                </View>
            )}
        </NativeBaseProvider>
    )
}

const styles = StyleSheet.create({
    productdetails: { width: '70%' },
    bgimage: { flex: 1, justifyContent: 'center' },
    inputbox: { backgroundColor: 'rgba(0,0,0,0.06)', borderRadius: 12, width: '100%', overflow: 'hidden', marginVertical: 0 },
    optionbtn: { backgroundColor: 'none', width: '46%', borderRadius: 8, overflow: 'hidden' },
    custbtn: { backgroundColor: 'none', width: 80, borderRadius: 10 },
    note: { color: '#ffffff', width: 20, height: 20, borderRadius: 10, overflow: 'hidden', fontWeight: 'bold', fontSize: 16, lineHeight: 19, textAlign: 'center' },
    productbox: { borderRadius: 15, width: '96%', margin: '2%', padding: 15, backgroundColor: '#f6f6f6', borderColor: '#ffffff', borderWidth: 2, elevation: 10, shadowColor: '#666666', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.4, shadowRadius: 10, overflow: 'hidden' },
    spincontainer: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0, 0, 0, 0.8)' },
});

export default MemberDetailsScreen;
