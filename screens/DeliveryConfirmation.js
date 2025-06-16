import AsyncStorage from '@react-native-async-storage/async-storage';
import { Actionsheet, Box, Button, HStack, Input, NativeBaseProvider, ScrollView, Stack, Text, Toast, VStack, Pressable, Center } from 'native-base';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, StyleSheet, TouchableOpacity, StatusBar, View, ImageBackground, Keyboard, Linking, Alert } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import { API_KEY, BASE_URL, CONTACT_HIER_ID, ORG_ID, PROGRAM_ID } from '../auth_provider/Config';
import { useTranslation } from 'react-i18next';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import ReactNativeBlobUtil from 'react-native-blob-util';
import OrgTabComponents from '../components/OrgTab';

const DeliveryConfirmationScreen = ({ navigation }) => {

    const { t } = useTranslation();

    const [loading, setLoading] = React.useState(false);
    const [lightColor, setLightColor] = React.useState("#cbf75e");
    const [darkColor, setDarkColor] = React.useState("#2BBB86");
    const [cameraColor, setCameraColor] = React.useState("#f04e23");
    const [logoImage, setLogoImage] = React.useState("");

    const [deliveryStatus, setDeliveryStatus] = React.useState("");
    const [podList, setPODList] = React.useState("");
    const [pageNumber, setPageNumber] = React.useState(1);

    const [totalPage, setTotalPage] = React.useState("");

    const [remarkPop, setRemarkPop] = React.useState(false);

    const [isPicker, setIsPicker] = React.useState(false);
    const [proofImages, setProofImages] = React.useState([]);
    const [remarks, setRemarks] = React.useState("");
    const [itemValue, setItemValue] = React.useState("");

    const [podPop, setPODPop] = React.useState(false);
    const [podDetails, setPODDetails] = React.useState([]);

    const [search, setSearch] = React.useState("");

    const [bigImage, setBigImage] = React.useState("");
    const [imagePop, setImagePop] = React.useState(false);

    const [openCount, setOpenCount] = React.useState("");
    const [deliveryCount, setDeliveryCount] = React.useState("");
    const [pendingCount, setPendingCount] = React.useState("");

    const [memberType, setMemberType] = React.useState("");
    const [selectedORG, setSelectedORG] = React.useState("");

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            setLoading(true);
            setDeliveryStatus("");
            AsyncStorage.getItem('userToken').then(val => {
                if (val != null) {
                    setMemberType(JSON.parse(val).member_type);
                    if (JSON.parse(val).member_type == "CSO") {
                        AsyncStorage.getItem('selectedOrg').then(orgVal => {
                            console.log("orgVal:", orgVal)
                            if (orgVal != null) {
                                setSelectedORG(JSON.parse(orgVal));
                                getAllData(deliveryStatus, JSON.parse(orgVal));
                            } else {
                                setSelectedORG(JSON.parse(val).default_org_selection[0].id);
                                getAllData(deliveryStatus, JSON.parse(val).default_org_selection[0].id);
                            }
                        })
                    } else {
                        setSelectedORG(JSON.parse(val).org_id);
                        getAllData(deliveryStatus, JSON.parse(val).org_id);
                    }
                }
            })
        });
        return unsubscribe;
    }, []);

    const getAllData = (podStatus, forORG) => {
        AsyncStorage.getItem('userToken').then(val => {
            if (val != null) {
                setLogoImage(JSON.parse(val).logo_url);

                setLightColor(JSON.parse(val).info.theme_color.light);
                setDarkColor(JSON.parse(val).info.theme_color.dark);

                let formdata = new FormData();
                formdata.append("APIkey", `${API_KEY}`);
                formdata.append("token", JSON.parse(val).token);
                formdata.append("orgId", JSON.parse(val).org_id);
                formdata.append("orderStatus", podStatus);
                formdata.append("searchText", search);
                formdata.append("page", 1);
                formdata.append("num_of_rows", 15);
                formdata.append("defaultOrgSelection", forORG);
                fetch(`${BASE_URL}/get_pod_data_for_cso`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                    body: formdata
                })
                    .then((response) => response.json())
                    .then((responseJson) => {
                        console.log("get_pod_data_for_cso:", responseJson);
                        if (responseJson.status == 'success') {
                            setLoading(false);
                            setPODList(responseJson.details);
                            setTotalPage(responseJson.total_pages);
                            setOpenCount(responseJson.PODOpenCount);
                            setDeliveryCount(responseJson.PODdeliveryIssueCount);
                            setPendingCount(responseJson.PODPendingForHandoverCount);
                        } else {
                            Toast.show({ description: responseJson.message });
                            setPODList([]);
                            setTotalPage("");
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
                        //console.log("Influencer Error:", error);
                        Toast.show({ description: t("Sorry! Somthing went Wrong. Maybe Network request Failed") });
                    });
            } else {
                setLoading(false);
                AsyncStorage.clear();
                navigation.navigate('Login');
            }
        });
    }

    const loadMore = () => {
        let num = pageNumber + 1;
        setLoading(true);
        AsyncStorage.getItem('userToken').then(val => {
            if (val != null) {
                let formdata = new FormData();
                formdata.append("APIkey", `${API_KEY}`);
                formdata.append("token", JSON.parse(val).token);
                formdata.append("orgId", JSON.parse(val).org_id);
                formdata.append("orderStatus", deliveryStatus);
                formdata.append("searchText", search);
                formdata.append("page", num);
                formdata.append("num_of_rows", 15);
                formdata.append("defaultOrgSelection", selectedORG);
                fetch(`${BASE_URL}/get_pod_data_for_cso`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                    body: formdata
                })
                    .then((response) => response.json())
                    .then((responseJson) => {
                        //console.log("Loadmore Influencer:", responseJson);
                        if (responseJson.details.length != 0) {
                            setLoading(false);
                            let newArrya = podList.concat(responseJson.details);
                            setPODList(newArrya);
                            setPageNumber(num);
                            setTotalPage(responseJson.total_pages);
                            setOpenCount(responseJson.PODOpenCount);
                            setDeliveryCount(responseJson.PODdeliveryIssueCount);
                            setPendingCount(responseJson.PODPendingForHandoverCount);
                        } else {
                            setLoading(false);
                            setPageNumber(1);
                            setTotalPage("");
                        }
                    })
                    .catch((error) => {
                        setLoading(false);
                        //console.log("Loadmore Influencer Error:", error);
                        Toast.show({ description: t("Sorry! Somthing went Wrong. Maybe Network request Failed") });
                    });
            } else {
                setLoading(false);
                AsyncStorage.clear();
                navigation.navigate('Login');
            }
        });
    };

    const onSetFilter = (dataVal) => {
        setLoading(true);
        setDeliveryStatus(dataVal);
        getAllData(dataVal, selectedORG);
    }

    const onPODAction = (optn, dataVal) => {
        AsyncStorage.getItem('userToken').then(val => {
            if (val != null) {
                let formdata = new FormData();
                formdata.append("APIkey", `${API_KEY}`);
                formdata.append("token", JSON.parse(val).token);
                formdata.append("orgId", JSON.parse(val).org_id);
                formdata.append("type", dataVal.pod_order_status == 1 ? 1 : 2);
                formdata.append("action", optn);
                formdata.append("remarks", remarks);
                formdata.append("dopdId", dataVal.id);
                formdata.append("orderId", dataVal.dcm_orders_id);
                formdata.append("orderItemId", dataVal.dcm_order_items_id);
                formdata.append("delivery_proof_image", JSON.stringify(proofImages));
                console.log(JSON.stringify(formdata));
                fetch(`${BASE_URL}/cso_take_action_on_pod`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                    body: formdata
                })
                    .then((response) => response.json())
                    .then((responseJson) => {
                        console.log("cso_take_action_on_pod:", responseJson);
                        if (responseJson.status == 'success') {
                            Toast.show({ description: responseJson.message });
                            getAllData(deliveryStatus, selectedORG);
                            setProofImages([]);
                            setRemarks("");
                        } else {
                            Toast.show({ description: responseJson.message });
                            setLoading(false);
                        }
                    })
                    .catch((error) => {
                        setLoading(false);
                        console.log("cso_take_action_on_pod Error:", error);
                        Toast.show({ description: t("Sorry! Somthing went Wrong. Maybe Network request Failed") });
                    });
            } else {
                setLoading(false);
                AsyncStorage.clear();
                navigation.navigate('Login');
            }
        });
    }

    const onTakeAction = (option, dataVal) => {
        if (option == "No") {
            Alert.alert(
                t("Warning!"),
                t("Want you Reject this Delivery") + "?",
                [
                    {
                        text: t("Cancel"),
                        onPress: () => console.log("Cancel Pressed"),
                        style: "cancel"
                    },
                    {
                        text: t("Confirm"), onPress: () => {
                            setLoading(true);
                            onPODAction("no", dataVal);
                        }
                    }
                ],
                { cancelable: false }
            );
        } else if (option == "Handover") {
            setRemarkPop(true);
            setProofImages([]);
            setRemarks("");
            setItemValue(dataVal);
        } else {
            setLoading(true);
            onPODAction("yes", dataVal);
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
                        if (response.assets != undefined) {
                            let newArrya = proofImages.concat(response.assets[0].base64);
                            setProofImages(newArrya);
                        }
                    }
                },
            )
        }
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
            onPODAction("yes", itemValue);
        }
    }

    const removeImage = (index) => {
        let result = proofImages.filter((item, key) => key != index)
        setProofImages(result);
    }

    const onPODdetails = (item) => {
        setPODPop(true);
        setPODDetails(item);
        console.log(item);
    }

    const onSearch = () => {
        setLoading(true);
        getAllData(deliveryStatus, selectedORG);
    }

    const viewImage = (img) => {
        setBigImage(img);
        setImagePop(true);
    }

    const onCheck = (e) => {
        setLoading(true);
        getAllData(deliveryStatus, e);
        setSelectedORG(e);
        AsyncStorage.setItem('selectedOrg', JSON.stringify(e));
    }

    const onImport = (path) => {
        const fileName = "document";
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
                        <Text color="#111111" fontSize="16" textAlign="center" fontWeight="bold">{t("POD Delivery List")}</Text>
                        <Image source={logoImage ? { uri: logoImage } : require('../assets/images/logo.png')} style={{ width: 60, height: 25, resizeMode: 'contain' }} />
                    </HStack>
                </LinearGradient>
                <ImageBackground source={require('../assets/images/bg.jpg')} imageStyle={{ resizeMode: 'contain', position: 'absolute', bottom: 0, top: '65%', opacity: podList.length < 4 ? 0.6 : 0 }} style={styles.bgimage}>
                    <ScrollView>
                        <LinearGradient
                            colors={[lightColor, darkColor]}
                            style={{ height: 110, position: 'absolute', top: 0, width: '100%', borderBottomEndRadius: 100, borderBottomStartRadius: 100, overflow: 'hidden' }}
                            start={{ x: 0.5, y: 0 }}
                        ></LinearGradient>
                        {memberType == "CSO" && (
                            <OrgTabComponents clickBtn={onCheck} navigation={navigation} component={selectedORG} />
                        )}
                        <Box padding="5">
                            <Box style={[styles.productbox, { paddingHorizontal: 8 }]}>
                                <HStack alignItems="center" justifyContent="space-evenly" flexWrap="wrap">
                                    <LinearGradient
                                        colors={deliveryStatus == "" ? ["#555555", "#000000"] : ["#eeeeee", "#bbbbbb"]}
                                        start={{ x: 0.5, y: 0 }}
                                        style={[styles.custbtn, { width: '23%', marginVertical: 5 }]}
                                    >
                                        <Button size="xs" variant="link" _text={{ color: deliveryStatus == "" ? "#ffffff" : "#111111", fontWeight: 'bold', fontSize: 12 }} onPress={() => onSetFilter("")}>{t("All")}</Button>
                                    </LinearGradient>
                                    <LinearGradient
                                        colors={deliveryStatus == "4" ? ["#555555", "#000000"] : ["#eeeeee", "#bbbbbb"]}
                                        start={{ x: 0.5, y: 0 }}
                                        style={[styles.custbtn, { width: '35%', marginVertical: 2 }]}
                                    >
                                        <Button size="xs" variant="link" _text={{ color: deliveryStatus == "4" ? "#ffffff" : "#111111", fontWeight: 'bold', fontSize: 12 }} onPress={() => onSetFilter("4")}>{t("Handded Over")}</Button>
                                    </LinearGradient>
                                    <LinearGradient
                                        colors={deliveryStatus == "2" ? ["#555555", "#000000"] : ["#eeeeee", "#bbbbbb"]}
                                        start={{ x: 0.5, y: 0 }}
                                        style={[styles.custbtn, { width: '35%', marginVertical: 2 }]}
                                    >
                                        <Button size="xs" variant="link" _text={{ color: deliveryStatus == "2" ? "#ffffff" : "#111111", fontWeight: 'bold', fontSize: 12 }} onPress={() => onSetFilter("2")}>{t("Delivery Issue")}
                                            {deliveryCount != 0 && (
                                                <Text style={{ position: 'absolute', right: -15, top: -5, zIndex: 9, borderRadius: 10, overflow: 'hidden', width: 18, height: 18, fontSize: 10, fontWeight: 'bold', textAlign: 'center', lineHeight: 18 }} color="#ffffff" bg={cameraColor}>{deliveryCount}</Text>
                                            )}
                                        </Button>
                                    </LinearGradient>
                                    <LinearGradient
                                        colors={deliveryStatus == "1" ? ["#555555", "#000000"] : ["#eeeeee", "#bbbbbb"]}
                                        start={{ x: 0.5, y: 0 }}
                                        style={[styles.custbtn, { width: '48%', marginVertical: 2 }]}
                                    >
                                        <Button size="xs" variant="link" _text={{ color: deliveryStatus == "1" ? "#ffffff" : "#111111", fontWeight: 'bold', fontSize: 12 }} onPress={() => onSetFilter("1")}>{t("Delivery Confirmation")}
                                            {openCount != 0 && (
                                                <Text style={{ position: 'absolute', right: -15, top: -5, zIndex: 9, borderRadius: 10, overflow: 'hidden', width: 18, height: 18, fontSize: 10, fontWeight: 'bold', textAlign: 'center', lineHeight: 18 }} color="#ffffff" bg={cameraColor}>{openCount}</Text>
                                            )}
                                        </Button>
                                    </LinearGradient>
                                    <LinearGradient
                                        colors={deliveryStatus == "3" ? ["#555555", "#000000"] : ["#eeeeee", "#bbbbbb"]}
                                        start={{ x: 0.5, y: 0 }}
                                        style={[styles.custbtn, { width: '48%', marginVertical: 2 }]}
                                    >
                                        <Button size="xs" variant="link" _text={{ color: deliveryStatus == "3" ? "#ffffff" : "#111111", fontWeight: 'bold', fontSize: 12 }} onPress={() => onSetFilter("3")}>{t("Pending for Handover")}
                                            {pendingCount != 0 && (
                                                <Text style={{ position: 'absolute', right: -15, top: -5, zIndex: 9, borderRadius: 10, overflow: 'hidden', width: 18, height: 18, fontSize: 10, fontWeight: 'bold', textAlign: 'center', lineHeight: 18 }} color="#ffffff" bg={cameraColor}>{pendingCount}</Text>
                                            )}
                                        </Button>
                                    </LinearGradient>
                                </HStack>
                            </Box>
                            <Box style={[styles.productbox, { paddingHorizontal: 8 }]}>
                                <Text fontSize="xs" mb="3">* Search by Extern ID / Phone / Order ID / Order Item ID</Text>
                                <HStack justifyContent="space-between">
                                    <Stack style={{ width: '72%' }}>
                                        <View style={[styles.inputbox, { borderRadius: 7, marginVertical: 0, backgroundColor: '#ffffff', height: 35 }]}>
                                            <Input size="md" style={{ height: 35 }} onChangeText={(text) => setSearch(text)} variant="unstyled" InputLeftElement={<Icon name="search-outline" size={20} color="#f04e23" style={{ width: 25, marginLeft: 10, textAlign: 'center' }} />} placeholder={t("Search")} />
                                        </View>
                                    </Stack>
                                    <Button size="xs" style={[styles.custbtn, { width: '25%', height: 35, backgroundColor: "#666666" }]} _text={{ color: "#ffffff", fontWeight: 'bold', fontSize: 12 }} onPress={() => onSearch()}>{t("Search")}</Button>
                                </HStack>
                            </Box>
                            {podList.length == 0 && (
                                <Stack space={5} style={[styles.productbox, { height: 350, justifyContent: 'center', alignItems: 'center', padding: 30 }]}>
                                    <Icon name="hourglass-outline" size={80} color="#999999" />
                                    <Text fontSize='lg' fontWeight="bold" textAlign="center" color="#111111">{t("Result Not Found")}</Text>
                                    <Text fontSize='sm' fontWeight="medium" textAlign="center" color="#666666">{t("Whoops... This Information is not available for a moment")}</Text>
                                </Stack>
                            )}
                            {podList.length != 0 && (
                                <VStack>
                                    {podList.map((item, index) =>
                                        <Box key={index} style={styles.productbox}>
                                            <VStack style={{ padding: 5, backgroundColor: '#ffffff', justifyContent: 'center', alignItems: 'center', borderRadius: 10, marginBottom: 10 }}>
                                                <Text fontSize='sm' fontWeight="bold" color="#111111">{item.name} ( {item.id_extern01} )</Text>
                                                <Pressable onPress={() => { Linking.openURL(`tel:${item.number}`) }} style={{ marginTop: 5 }}>
                                                    <HStack space={2}>
                                                        <Stack justifyContent="center" alignItems="center" style={{ backgroundColor: darkColor, width: 18, height: 18, borderRadius: 6 }}><Icon name="call" size={12} color="#ffffff" /></Stack>
                                                        <Text fontSize='xs' fontWeight="medium" color={darkColor}>{item.number}</Text>
                                                    </HStack>
                                                </Pressable>
                                            </VStack>
                                            <HStack space="4">
                                                <Box style={styles.productimage}>
                                                    <Image source={item.product_image ? { uri: item.BaseUrl + item.product_image[0].product_image } : require('../assets/images/noimage.jpg')} style={{ width: 100, height: 90 }} resizeMode='contain' />
                                                </Box>
                                                <VStack style={styles.productdetails}>
                                                    <Text fontSize='sm' fontWeight="bold" mb="1">{item.productName}</Text>
                                                    <HStack space="2" alignItems="center">
                                                        <Text fontSize='xs'>{t("Order Id")}:</Text>
                                                        <Text fontSize='xs' fontWeight="bold"> {item.dcm_orders_id}</Text>
                                                    </HStack>
                                                    <HStack space="2" alignItems="center">
                                                        <Text fontSize='xs'>{t("Order Item Id")}:</Text>
                                                        <Text fontSize='xs' fontWeight="bold"> {item.dcm_order_items_id}</Text>
                                                    </HStack>
                                                    <HStack space="2" alignItems="center">
                                                        <Text fontSize='xs'>{t("Price Point")}:</Text>
                                                        <Text fontSize='xs' fontWeight="bold"> {item.pricePoint}</Text>
                                                    </HStack>
                                                    <HStack space="2" alignItems="center">
                                                        <Text fontSize='xs'>{t("Date")}:</Text>
                                                        <Text fontSize='xs' fontWeight="bold"> {item.orderInDate}</Text>
                                                    </HStack>
                                                </VStack>
                                            </HStack>
                                            <VStack space={1} alignItems="center" justifyContent="space-evenly" bg="#eeeeee" borderRadius="10" overflow="hidden" padding="2" mt="3">
                                                {item.pod_order_status == 1 && (
                                                    <HStack space={1} alignItems="center" justifyContent="space-between">
                                                        <LinearGradient
                                                            colors={[lightColor, darkColor]}
                                                            start={{ x: 0.5, y: 0 }}
                                                            style={[styles.custbtn, { width: '48%', marginHorizontal: 1 }]}
                                                        >
                                                            <Button size="xs" variant="link" onPress={() => onTakeAction("Yes", item)}>
                                                                <Text color="#111111" fontSize="sm" fontWeight="bold">{t("Yes")}</Text>
                                                            </Button>
                                                        </LinearGradient>
                                                        <LinearGradient
                                                            colors={["#821700", "#f04e23"]}
                                                            start={{ x: 0.5, y: 0 }}
                                                            style={[styles.custbtn, { width: '48%', marginHorizontal: 1 }]}
                                                        >
                                                            <Button size="xs" variant="link" onPress={() => onTakeAction("No", item)}>
                                                                <Text color="#ffffff" fontSize="sm" fontWeight="bold">{t("No")}</Text>
                                                            </Button>
                                                        </LinearGradient>
                                                    </HStack>
                                                )}
                                                {item.pod_order_status == 3 && (
                                                    <LinearGradient
                                                        colors={[lightColor, darkColor]}
                                                        start={{ x: 0.5, y: 0 }}
                                                        style={[styles.custbtn, { width: '100%', marginTop: 0 }]}
                                                    >
                                                        <Button size="xs" variant="link" onPress={() => onTakeAction("Handover", item)}>
                                                            <Text color="#111111" fontSize="sm" fontWeight="bold">{t("Handover")}</Text>
                                                        </Button>
                                                    </LinearGradient>
                                                )}
                                                <LinearGradient
                                                    colors={["#666666", "#222222"]}
                                                    start={{ x: 0.5, y: 0 }}
                                                    style={[styles.custbtn, { width: '100%', marginTop: 3 }]}
                                                >
                                                    <Button size="xs" variant="link" _text={{ color: "#ffffff", fontWeight: 'bold', fontSize: 13 }} onPress={() => onPODdetails(item)}>{t("POD Details")}</Button>
                                                </LinearGradient>
                                            </VStack>
                                        </Box>
                                    )}
                                </VStack>
                            )}
                            {pageNumber != totalPage && podList.length != 0 && (
                                <HStack paddingY="3" paddingX="6" justifyContent="center">
                                    <Button variant="outline" size={'xs'} rounded={30} onPress={() => loadMore()}>
                                        <Text color="#bbbbbb">{t("Load More")}</Text>
                                    </Button>
                                </HStack>
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
            {podPop && (
                <VStack flex={1} style={{ backgroundColor: "rgba(0,0,0,0.85)", position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center', padding: 20 }}>
                    <Box style={styles.productbox}>
                        <ScrollView style={{ maxHeight: 630 }}>
                            <Button style={{ alignSelf: 'flex-end' }} size="lg" variant="link" onPress={() => setPODPop(false)}><Icon name="close" size={30} color="red" /></Button>
                            <Box padding="0" mt="2">
                                <VStack bg="#eeeeee" space={2} padding="4" mb={3} borderRadius={12}>
                                    <HStack justifyContent="space-between" alignItems="center">
                                        <Text color="#444444">{t("Order Number")}:</Text>
                                        <Text color="#111111" fontSize='lg' textAlign="center" fontWeight="bold" textTransform="capitalize">{podDetails.dcm_orders_id}</Text>
                                    </HStack>
                                    <HStack justifyContent="space-between" alignItems="center">
                                        <Text color="#444444" style={{ width: 100 }}>{t("Order Item Id")}:</Text>
                                        <Text color="#111111" fontSize='sm' textAlign="right" fontWeight="medium" textTransform="capitalize">{podDetails.dcm_order_items_id}</Text>
                                    </HStack>
                                </VStack>
                                {podDetails.pod_file_path != "" && (
                                    <Box style={styles.productbox}>
                                        {podDetails.pod_file_type == "image" && (
                                            <Image source={{ uri: podDetails.pod_file_path }} style={{ width: '100%', height: 160 }} resizeMode='contain' />
                                        )}
                                        {podDetails.pod_file_type == "document" && (
                                            <VStack alignItems={'center'}>
                                                <Image source={require('../assets/images/document-icon.png')} style={{ width: '100%', height: 80, marginBottom: 15 }} resizeMode='contain' />
                                                <LinearGradient
                                                    colors={["#10764F", "#2BBB86"]}
                                                    start={{ x: 0.5, y: 0 }}
                                                    style={styles.optionbtn}
                                                >
                                                    <Button size="xs" variant="link" _text={{ color: "#ffffff", fontWeight: 'bold', fontSize: 13 }} onPress={() => onImport(podDetails.pod_file_path)}>{t("Download")}</Button>
                                                </LinearGradient>
                                            </VStack>
                                        )}
                                        {podDetails.pod_file_type == "audio" && (
                                            <VStack alignItems={'center'}>
                                                <Image source={require('../assets/images/video-icon.png')} style={{ width: '100%', height: 80, marginBottom: 15 }} resizeMode='contain' />
                                                <LinearGradient
                                                    colors={["#10764F", "#2BBB86"]}
                                                    start={{ x: 0.5, y: 0 }}
                                                    style={styles.optionbtn}
                                                >
                                                    <Button size="xs" variant="link" _text={{ color: "#ffffff", fontWeight: 'bold', fontSize: 13 }} onPress={() => { Linking.openURL(podDetails.pod_file_path) }}>{t("Play Audio")}</Button>
                                                </LinearGradient>
                                            </VStack>
                                        )}
                                        {podDetails.pod_file_remarks != "" && (
                                            <VStack bg="#eeeeee" space={2} padding="3" mt="4" borderRadius={12}>
                                                <HStack justifyContent="space-between" alignItems="center">
                                                    <Text color="#444444" style={{ width: 100 }}>{t("Remarks")}:</Text>
                                                    <Text color="#111111" fontSize='sm' textAlign="right" fontWeight="medium" textTransform="capitalize">{podDetails.pod_file_remarks}</Text>
                                                </HStack>
                                            </VStack>
                                        )}
                                    </Box>
                                )}
                                <VStack space={3}>
                                    <VStack bg="#eeeeee" space={2} padding="4" marginY="4" borderRadius={12}>
                                        <HStack justifyContent="space-between" alignItems="center">
                                            <Text color="#444444" style={{ width: 100 }}>{t("AWB Number")}:</Text>
                                            <Text color="#111111" fontSize='sm' textAlign="right" fontWeight="medium" textTransform="capitalize">{podDetails.awbNo}</Text>
                                        </HStack>
                                        <HStack justifyContent="space-between" alignItems="center">
                                            <Text color="#444444" style={{ width: 100 }}>{t("Courier Name")}:</Text>
                                            <Text color="#111111" fontSize='sm' textAlign="right" fontWeight="medium" textTransform="capitalize">{podDetails.courierName}</Text>
                                        </HStack>
                                    </VStack>
                                    {podDetails.member_pod_file_path != "" && (
                                        <Stack borderWidth={2} borderColor={"#dddddd"} space={2} padding="4" marginY="4" borderRadius={12}>
                                            <Box style={{ zIndex: 9, marginTop: -30 }}>
                                                <Text color="#666666" bg="#f6f6f6" paddingX="5" alignSelf="center" textAlign="center" fontSize="15" fontWeight="medium">{t("By Contractor")}</Text>
                                            </Box>
                                            <View>
                                                <Text color="#444444">{t("POD Images")}:</Text>
                                                <HStack justifyContent="flex-start" flexWrap={'wrap'}>
                                                    {podDetails.member_pod_file_path.map((item, index) =>
                                                        <TouchableOpacity onPress={() => viewImage(item)} key={index} style={[styles.inputbox, { width: '30%', height: 60, marginHorizontal: '1.5%' }]}>
                                                            <Image source={{ uri: item }} alt="image" resizeMode='cover' style={{ width: '100%', height: 60 }} />
                                                        </TouchableOpacity>
                                                    )}
                                                </HStack>
                                                {podDetails.member_pod_file_remarks != "" && (
                                                    <VStack bg="#eeeeee" space={2} padding="3" mt="4" borderRadius={12}>
                                                        <HStack justifyContent="space-between" alignItems="center">
                                                            <Text color="#444444" style={{ width: 100 }}>{t("Remarks")}:</Text>
                                                            <Text color="#111111" fontSize='sm' textAlign="right" fontWeight="medium" textTransform="capitalize">{podDetails.member_pod_file_remarks}</Text>
                                                        </HStack>
                                                    </VStack>
                                                )}
                                            </View>
                                        </Stack>
                                    )}
                                </VStack>
                            </Box>
                        </ScrollView>
                    </Box>
                </VStack>
            )}
            {imagePop && (
                <VStack flex={1} style={{ backgroundColor: "rgba(0,0,0,0.85)", position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center', padding: 30, zIndex: 99 }}>
                    <Box style={styles.productbox}>
                        <Button style={{ alignSelf: 'flex-end' }} size="lg" variant="link" onPress={() => setImagePop(false)}><Icon name="close" size={30} color="red" /></Button>
                        <Box padding="2">
                            <Image source={{ uri: bigImage }} style={{ width: '100%', height: 250 }} resizeMode='contain' />
                        </Box>
                    </Box>
                </VStack>
            )}
        </NativeBaseProvider>
    )
}

const styles = StyleSheet.create({
    bgimage: { flex: 1, justifyContent: 'center' },
    productbox: { borderRadius: 15, width: '96%', margin: '2%', backgroundColor: '#f6f6f6', padding: 15, borderColor: '#ffffff', borderWidth: 2, elevation: 10, shadowColor: '#666666', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.4, shadowRadius: 10, overflow: 'hidden' },
    inputbox: { backgroundColor: 'rgba(0,0,0,0.06)', borderRadius: 12, width: '100%', overflow: 'hidden', marginVertical: 7 },
    custbtn: { width: '100%', backgroundColor: '#111111', borderRadius: 12, overflow: 'hidden' },
    optionbtn: { backgroundColor: 'none', width: '46%', borderRadius: 8, overflow: 'hidden' },
    spincontainer: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0, 0, 0, 0.8)' },
    productimage: { borderColor: '#dddddd', backgroundColor: '#ffffff', borderWidth: 1, borderRadius: 10, width: '38%', height: 100, justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
    productdetails: { width: '58%' },
});

export default DeliveryConfirmationScreen;