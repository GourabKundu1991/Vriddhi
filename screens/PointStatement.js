import AsyncStorage from '@react-native-async-storage/async-storage';
import { Box, HStack, NativeBaseProvider, Text, VStack, Toast, Button, Stack, Input } from 'native-base';
import React, { useEffect } from 'react';
import Icon from 'react-native-vector-icons/Ionicons';
import { ActivityIndicator, Image, ImageBackground, Platform, Pressable, ScrollView, Share, StatusBar, StyleSheet, TouchableOpacity, View } from 'react-native';
import { API_KEY, BASE_URL, CONTACT_HIER_ID, ORG_ID, PROGRAM_ID } from '../auth_provider/Config';
import LinearGradient from 'react-native-linear-gradient';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import moment from 'moment';
import ReactNativeBlobUtil from 'react-native-blob-util';
import { useTranslation } from 'react-i18next';

const PointStatementScreen = ({ navigation }) => {

    const { t } = useTranslation();

    const [loading, setLoading] = React.useState(false);
    const [lightColor, setLightColor] = React.useState("#cbf75e");
    const [darkColor, setDarkColor] = React.useState("#2BBB86");
    const [logoImage, setLogoImage] = React.useState("");

    const [allPoints, setAllPoints] = React.useState([]);
    const [allTDSPoints, setAllTDSPoints] = React.useState([]);

    const [currentPoints, setCurrentPoints] = React.useState("");

    const [pop, setPop] = React.useState(false);
    const [startDate, setStartDate] = React.useState("");
    const [endDate, setEndDate] = React.useState("");
    const [isDatePickerVisible, setDatePickerVisibility] = React.useState(false);
    const [dateType, setDateType] = React.useState("");

    const [pageNumber, setPageNumber] = React.useState(1);
    const [isLoadMore, setIsLoadMore] = React.useState(true);

    const [pageNumberTDS, setPageNumberTDS] = React.useState(1);
    const [isLoadMoreTDS, setIsLoadMoreTDS] = React.useState(true);

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
                formdata.append("pageNumber", 1);
                fetch(`${BASE_URL}/pointstatements`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                    body: formdata
                })
                    .then((response) => response.json())
                    .then((responseJson) => {
                        console.log("Point Statements:", responseJson);
                        if (responseJson.status == 'success') {
                            setAllPoints(responseJson.trnasc_list);
                            setCurrentPoints(responseJson.current_balance);
                            fetch(`${BASE_URL}/tds_points_statement`, {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'multipart/form-data',
                                },
                                body: formdata
                            })
                                .then((response) => response.json())
                                .then((responseJson) => {
                                    console.log("TDS Point Statements:", responseJson);
                                    if (responseJson.status == 'success') {
                                        setLoading(false);
                                        setAllTDSPoints(responseJson.trnasc_list);
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
                                    //console.log("TDS Point Statements Error:", error);
                                    Toast.show({ description: t("Sorry! Somthing went Wrong. Maybe Network request Failed") });
                                });
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
                        //console.log("Point Statements Error:", error);
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
                formdata.append("pageNumber", num);
                fetch(`${BASE_URL}/pointstatements`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                    body: formdata
                })
                    .then((response) => response.json())
                    .then((responseJson) => {
                        console.log("Point Statements:", responseJson);
                        if (responseJson.status == 'success') {
                            setLoading(false);
                            let newArrya = allPoints.concat(responseJson.trnasc_list);
                            setAllPoints(newArrya);
                            setPageNumber(num);
                        } else {
                            setLoading(false);
                            setIsLoadMore(false);
                            setPageNumber(1);
                        }
                    })
                    .catch((error) => {
                        setLoading(false);
                        //console.log("Point Statements Error:", error);
                        Toast.show({ description: t("Sorry! Somthing went Wrong. Maybe Network request Failed") });
                    });
            } else {
                setLoading(false);
                AsyncStorage.clear();
                navigation.navigate('Login');
            }
        });
    };

    const loadMoreTDS = () => {
        let num = pageNumberTDS + 1;
        setLoading(true);
        AsyncStorage.getItem('userToken').then(val => {
            if (val != null) {
                let formdata = new FormData();
                formdata.append("APIkey", `${API_KEY}`);
                formdata.append("token", JSON.parse(val).token);
                formdata.append("orgId", JSON.parse(val).org_id);
                formdata.append("pageNumber", num);
                fetch(`${BASE_URL}/tds_points_statement`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                    body: formdata
                })
                    .then((response) => response.json())
                    .then((responseJson) => {
                        console.log("TDS Point Statements:", responseJson);
                        if (responseJson.status == 'success') {
                            setLoading(false);
                            let newArrya = allTDSPoints.concat(responseJson.trnasc_list);
                            setAllTDSPoints(newArrya);
                            setPageNumberTDS(num);
                        } else {
                            setLoading(false);
                            setIsLoadMoreTDS(false);
                            setPageNumberTDS(1);
                        }
                    })
                    .catch((error) => {
                        setLoading(false);
                        //console.log("TDS Point Statements Error:", error);
                        Toast.show({ description: t("Sorry! Somthing went Wrong. Maybe Network request Failed") });
                    });
            } else {
                setLoading(false);
                AsyncStorage.clear();
                navigation.navigate('Login');
            }
        });
    };

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
                        <Text color="#111111" fontSize="16" textAlign="center" fontWeight="bold" textTransform="capitalize">{t("Point Statement")}</Text>
                        <Image source={logoImage ? { uri: logoImage } : require('../assets/images/logo.png')} style={{ width: 60, height: 25, resizeMode: 'contain' }} />
                    </HStack>
                </LinearGradient>
                <ImageBackground source={require('../assets/images/bg.jpg')} imageStyle={{ resizeMode: 'contain', position: 'absolute', bottom: 0, top: '65%', opacity: allPoints.length == 0 && allTDSPoints.length == 0 ? 0.6 : 0 }} style={styles.bgimage}>
                    <ScrollView>
                        <LinearGradient
                            colors={[lightColor, darkColor]}
                            style={{ height: 110, position: 'absolute', top: 0, width: '100%', borderBottomEndRadius: 100, borderBottomStartRadius: 100, overflow: 'hidden' }}
                            start={{ x: 0.5, y: 0 }}
                        ></LinearGradient>
                        <Box padding="5">
                            <VStack>
                                <Box style={styles.productbox}>
                                    <VStack alignItems="center" w="100%" space={4} padding={5}>
                                        <Stack borderWidth={1} borderColor="#444444" borderStyle="dashed" borderRadius={15} w="100%" padding="1" overflow="hidden">
                                            <Text color="#444444" fontSize="sm" textAlign="center" fontWeight="medium" textTransform="capitalize">{t("Available Points")}</Text>
                                            <Text color="#111111" fontSize="lg" textAlign="center" fontWeight="bold" textTransform="capitalize">{currentPoints != "" ? currentPoints : 0}</Text>
                                        </Stack>
                                    </VStack>
                                </Box>
                                {allPoints.length != 0 && (
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
                                <Box style={styles.productbox} mt="5">
                                    <LinearGradient
                                        colors={[lightColor, darkColor]}
                                        start={{ x: 0.5, y: 0 }}
                                        style={{ padding: 10 }}
                                    >
                                        <Text color="#111111" fontSize="14" textAlign="center" fontWeight="bold">{t("Point Statement")}</Text>
                                    </LinearGradient>
                                    {allPoints.length == 0 ?
                                        <HStack padding="10" justifyContent="center">
                                            <Text fontSize='sm' color="#888888">----- {t("No Data Available")} -----</Text>
                                        </HStack>
                                        :
                                        <ScrollView style={{ maxHeight: 380 }} nestedScrollEnabled={true}>
                                            <VStack padding="4" space="3">
                                                {allPoints.map((item, index) =>
                                                    <Box key={index} borderWidth="1" borderColor="#aaaaaa" borderStyle="dashed" borderRadius="10" overflow="hidden">
                                                        <HStack justifyContent="space-evenly" alignItems="center" bg="#ffffff" borderTopRadius="10">
                                                            <VStack padding="2" w="33%">
                                                                {item.transaction_type == "Credit" ?
                                                                    <Text bg="#f04e23" style={styles.note}>C</Text>
                                                                    :
                                                                    <Text bg="#2BBB86" style={styles.note}>D</Text>
                                                                }
                                                            </VStack>
                                                            <VStack padding="2" w="33%">
                                                                <Text fontSize='xs' color="#666666">{t("Points")}:</Text>
                                                                <Text fontSize='sm' color="#111111" fontWeight="medium">{item.reward_points}</Text>
                                                            </VStack>
                                                            <VStack padding="2" w="33%">
                                                                {item.subtype == "Redemption" ?
                                                                    <LinearGradient
                                                                        colors={["#999999", "#000000"]}
                                                                        start={{ x: 0.5, y: 0 }}
                                                                        style={{ borderRadius: 6, overflow: 'hidden' }}
                                                                    >
                                                                        <Button size="sm" variant="link" _text={{ color: "#ffffff", fontWeight: 'bold', fontSize: 12 }} onPress={() => navigation.navigate("OrderDetails", { orderId: item.order_id, itemId: item.order_item_id })}>{t("Details")}</Button>
                                                                    </LinearGradient>
                                                                    :
                                                                    <View>
                                                                        <Text fontSize='xs' color="#666666">{t("Sub Type")}:</Text>
                                                                        <Text fontSize='sm' color="#111111" fontWeight="medium">{item.subtype}</Text>
                                                                    </View>
                                                                }
                                                            </VStack>
                                                        </HStack>
                                                        <HStack alignItems="center">
                                                            <VStack padding="2" w="33%">
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
                                            {isLoadMore && allPoints.length > 7 && (
                                                <HStack pb="3" paddingX="6" justifyContent="center">
                                                    <Button variant="outline" size={'xs'} rounded={30} onPress={() => loadMore()}>
                                                        <Text color="#bbbbbb">{t("Load More")}</Text>
                                                    </Button>
                                                </HStack>
                                            )}
                                        </ScrollView>
                                    }
                                </Box>
                                <Box style={styles.productbox}>
                                    <LinearGradient
                                        colors={[lightColor, darkColor]}
                                        start={{ x: 0.5, y: 0 }}
                                        style={{ padding: 10 }}
                                    >
                                        <Text color="#111111" fontSize="14" textAlign="center" fontWeight="bold">{t("TDS Point Statement")}</Text>
                                    </LinearGradient>
                                    {allTDSPoints.length == 0 ?
                                        <HStack padding="10" justifyContent="center">
                                            <Text fontSize='sm' color="#888888">----- {t("No Data Available")} -----</Text>
                                        </HStack>
                                        :
                                        <ScrollView style={{ maxHeight: 380 }} nestedScrollEnabled={true}>
                                            <VStack padding="4" space="3">
                                                {allTDSPoints.map((item, index) =>
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
                                            {isLoadMoreTDS && allTDSPoints.length > 7 && (
                                                <HStack pb="3" paddingX="6" justifyContent="center">
                                                    <Button variant="outline" size={'xs'} rounded={30} onPress={() => loadMoreTDS()}>
                                                        <Text color="#bbbbbb">{t("Load More")}</Text>
                                                    </Button>
                                                </HStack>
                                            )}
                                        </ScrollView>
                                    }
                                </Box>
                            </VStack>
                        </Box>
                    </ScrollView>
                </ImageBackground>
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
    );
};

const styles = StyleSheet.create({
    bgimage: { flex: 1, justifyContent: 'center' },
    inputbox: { backgroundColor: 'rgba(0,0,0,0.06)', borderRadius: 12, width: '100%', overflow: 'hidden', marginVertical: 0 },
    optionbtn: { backgroundColor: 'none', width: '46%', borderRadius: 8, overflow: 'hidden' },
    custbtn: { backgroundColor: 'none', width: 80, borderRadius: 10 },
    note: { color: '#ffffff', width: 20, height: 20, borderRadius: 10, overflow: 'hidden', fontWeight: 'bold', fontSize: 16, lineHeight: 19, textAlign: 'center' },
    productbox: { borderRadius: 15, width: '96%', margin: '2%', backgroundColor: '#f6f6f6', borderColor: '#ffffff', borderWidth: 2, elevation: 10, shadowColor: '#666666', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.4, shadowRadius: 10, overflow: 'hidden' },
    spincontainer: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0, 0, 0, 0.8)' },
});

export default PointStatementScreen;
