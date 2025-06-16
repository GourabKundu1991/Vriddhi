import AsyncStorage from '@react-native-async-storage/async-storage';
import { Box, Button, HStack, Input, NativeBaseProvider, Radio, ScrollView, Select, Stack, Text, Toast, VStack } from 'native-base';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, StyleSheet, TouchableOpacity, StatusBar, View, ImageBackground, Alert } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import { API_KEY, BASE_URL, CONTACT_HIER_ID, ORG_ID, PROGRAM_ID } from '../auth_provider/Config';
import moment from 'moment';
import { useTranslation } from 'react-i18next';
import OrgTabComponents from '../components/OrgTab';

const CSOSaleConfirmListScreen = ({ navigation }) => {

    const { t } = useTranslation();

    const [loading, setLoading] = React.useState(false);
    const [lightColor, setLightColor] = React.useState("#cbf75e");
    const [darkColor, setDarkColor] = React.useState("#2BBB86");
    const [logoImage, setLogoImage] = React.useState("");
    const [dataFound, setDataFound] = React.useState("");

    const [monthYear, setMonthYear] = useState("");

    const [liftingList, setLiftingList] = React.useState("");

    const [pop, setPop] = React.useState(false);

    const [contactId, setContactId] = React.useState("");
    const [productId, setProductId] = React.useState("");
    const [saleDate, setSaleDate] = React.useState("");
    const [searchTerm, setSearchTerm] = React.useState("");
    const [dealerList, setDealerList] = React.useState([]);
    const [claimedQty, setClaimedQty] = React.useState("");
    const [newQty, setNewQty] = React.useState("");
    const [dealerId, setDealerId] = React.useState("");
    const [saleId, setSaleId] = React.useState("");

    const [windowList, setWindowList] = React.useState([]);

    const [liftingOrgId, setLiftingOrgId] = React.useState("");

    const [memberType, setMemberType] = React.useState("");
    const [selectedORG, setSelectedORG] = React.useState("");

    const [pageNumber, setPageNumber] = React.useState(1);
    const [totalPage, setTotalPage] = React.useState(0);

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            setLoading(true);
            getWindowMonth();
        });
        return unsubscribe;
    }, []);

    const getWindowMonth = () => {
        AsyncStorage.getItem('userToken').then(val => {
            if (val != null) {
                setLogoImage(JSON.parse(val).logo_url);

                setLightColor(JSON.parse(val).info.theme_color.light);
                setDarkColor(JSON.parse(val).info.theme_color.dark);

                let formdata = new FormData();
                formdata.append("APIkey", `${API_KEY}`);
                formdata.append("token", JSON.parse(val).token);
                formdata.append("orgId", JSON.parse(val).org_id);
                fetch(`${BASE_URL}/get_register_window_month`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                    body: formdata
                })
                    .then((response) => response.json())
                    .then((responseJson) => {
                        //console.log("Window:", responseJson);
                        if (responseJson.status == 'success') {
                            setWindowList(responseJson.month_year);
                            setMonthYear(responseJson.month_year[0].month + "-" + responseJson.month_year[0].year);
                            setMemberType(JSON.parse(val).member_type);
                            if (JSON.parse(val).member_type == "CSO") {
                                AsyncStorage.getItem('selectedOrg').then(orgVal => {
                                    console.log("orgVal:", orgVal)
                                    if (orgVal != null) {
                                        setSelectedORG(JSON.parse(orgVal));
                                        getAllData(responseJson.month_year[0].month + "-" + responseJson.month_year[0].year, JSON.parse(orgVal));
                                    } else {
                                        setSelectedORG(JSON.parse(val).default_org_selection[0].id);
                                        getAllData(responseJson.month_year[0].month + "-" + responseJson.month_year[0].year, JSON.parse(val).default_org_selection[0].id);
                                    }
                                })
                            } else {
                                setSelectedORG(JSON.parse(val).org_id);
                                getAllData(responseJson.month_year[0].month + "-" + responseJson.month_year[0].year, JSON.parse(val).org_id);
                            }
                        } else {
                            Toast.show({ description: responseJson.message });
                            setWindowList([]);
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
                        //console.log("Window Error:", error);
                        Toast.show({ description: t("Sorry! Somthing went Wrong. Maybe Network request Failed") });
                    });
            } else {
                setLoading(false);
                AsyncStorage.clear();
                navigation.navigate('Login');
            }
        });
    }

    const getAllData = (monthyearData, forORG) => {
        AsyncStorage.getItem('userToken').then(val => {
            if (val != null) {
                let formdata = new FormData();
                formdata.append("APIkey", `${API_KEY}`);
                formdata.append("token", JSON.parse(val).token);
                formdata.append("orgId", JSON.parse(val).org_id);
                formdata.append("target_for", monthyearData);
                formdata.append("defaultOrgSelection", forORG);
                formdata.append("pageNumber", 1);
                console.log(formdata);
                fetch(`${BASE_URL}/registered_sale_confirm_cso`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                    body: formdata
                })
                    .then((response) => response.json())
                    .then((responseJson) => {
                        console.log("CSO Lifting:", responseJson);
                        setTotalPage(responseJson.load_more_button);
                        if (responseJson.status == 'success') {
                            setLiftingList(responseJson.trnasc_list);
                            setDataFound("found");
                            setLoading(false);
                        } else {
                            Toast.show({ description: responseJson.message });
                            setLiftingList([]);
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
                        console.log("CSO Lifting Error:", error);
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
        setPageNumber(num);
        setLoading(true);
        AsyncStorage.getItem('userToken').then(val => {
            if (val != null) {
                let formdata = new FormData();
                formdata.append("APIkey", `${API_KEY}`);
                formdata.append("token", JSON.parse(val).token);
                formdata.append("orgId", JSON.parse(val).org_id);
                formdata.append("target_for", monthYear);
                formdata.append("defaultOrgSelection", selectedORG);
                formdata.append("pageNumber", num);
                console.log(formdata);
                fetch(`${BASE_URL}/registered_sale_confirm_cso`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                    body: formdata
                })
                    .then((response) => response.json())
                    .then((responseJson) => {
                        console.log("CSO Lifting:", responseJson);
                        setTotalPage(responseJson.load_more_button);
                        if (responseJson.status == 'success') {
                            let newArrya = liftingList.concat(responseJson.trnasc_list);
                            setLiftingList(newArrya);
                            setLoading(false);
                        } else {
                            //Toast.show({ description: responseJson.message });
                            setLoading(false);
                        }
                    })
                    .catch((error) => {
                        setLoading(false);
                        //console.log("Loadmore List Error:", error);
                        Toast.show({ description: t("Sorry! Somthing went Wrong. Maybe Network request Failed") });
                    });
            } else {
                setLoading(false);
                AsyncStorage.clear();
                navigation.navigate('Login');
            }
        });
    };

    const onSelectWindow = (data) => {
        setMonthYear(data);
        setLoading(true);
        getAllData(data, selectedORG);
    }

    const updateStatus = (type, dataValue) => {
        if (type == 0) {
            Alert.alert(
                t("Warning") + "!",
                t("Are you sure to want to reject") + "?",
                [
                    {
                        text: t("Cancel"),
                        onPress: () => console.log("Cancel Pressed"),
                        style: "cancel"
                    },
                    {
                        text: t("Yes"), onPress: () => {
                            onAction(type, dataValue.claimed_quantity, dataValue.dcm_sale_id);
                        }
                    }
                ],
                { cancelable: false }
            );
        } else {
            setSaleId(dataValue.dcm_sale_id);
            setClaimedQty(dataValue.claimed_quantity);
            setNewQty(dataValue.claimed_quantity);
            setPop(true);
            setContactId(dataValue.dcm_contacts_id);
            setProductId(dataValue.dcm_product_master_id);
            setSaleDate(dataValue.sale_date);
            setLiftingOrgId(dataValue.lifting_org_id);
        }
    }

    const getFilteredDealer = () => {
        if (searchTerm.trim() == "") {
            Toast.show({ description: t("Please enter some Dealer Data") });
        } else {
            setLoading(true);
            AsyncStorage.getItem('userToken').then(val => {
                setLogoImage(JSON.parse(val).logo_url);
                if (val != null) {
                    let formdata = new FormData();
                    formdata.append("APIkey", `${API_KEY}`);
                    formdata.append("token", JSON.parse(val).token);
                    formdata.append("orgId", JSON.parse(val).org_id);
                    formdata.append("key", searchTerm);
                    formdata.append("contractor", contactId);
                    formdata.append("product", productId);
                    formdata.append("window_month", moment(saleDate).format('MM'));
                    formdata.append("window_year", moment(saleDate).format('YYYY'));
                    formdata.append("liftingOrgId", liftingOrgId);
                    console.log(formdata);
                    fetch(`${BASE_URL}/get_filtered_dealer`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'multipart/form-data',
                        },
                        body: formdata
                    })
                        .then((response) => response.json())
                        .then((responseJson) => {
                            //console.log("Dealer:", responseJson);
                            if (responseJson.status == 'success') {
                                setLoading(false);
                                setDealerList(responseJson.trnasc_list);
                                if (responseJson.trnasc_list.length == 0) {
                                    Toast.show({ description: t("No Dealer Found") + "..." });
                                }
                                setDataFound("found");
                            } else {
                                Toast.show({ description: responseJson.message });
                                setDealerList([]);
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

    const onCancel = () => {
        setPop(false);
        setDealerId("");
        setDealerList([]);
        setSearchTerm("");
        setLiftingOrgId("");
    }

    const onSubmit = () => {
        if (newQty == "") {
            Toast.show({ description: t("Please enter Claimed Quantity") });
        } else if (newQty > claimedQty) {
            Toast.show({ description: t("Claimed Quantity not accept more than") + " " + claimedQty });
        } else if (dealerId == "") {
            Toast.show({ description: t("Please select Dealer") });
        } else {
            setPop(false);
            setDealerId("");
            setDealerList([]);
            setSearchTerm("");
            onAction(1, newQty, saleId);
        }
    }

    const onAction = (type, quantity, saleId) => {
        setLoading(true);
        AsyncStorage.getItem('userToken').then(val => {
            setLogoImage(JSON.parse(val).logo_url);
            if (val != null) {
                let formdata = new FormData();
                formdata.append("APIkey", `${API_KEY}`);
                formdata.append("token", JSON.parse(val).token);
                formdata.append("orgId", JSON.parse(val).org_id);
                formdata.append("dcm_sale_id", saleId);
                formdata.append("action_type", type);
                formdata.append("quantity", quantity);
                formdata.append("dealer_id", dealerId);
                fetch(`${BASE_URL}/register_sale_data_action`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                    body: formdata
                })
                    .then((response) => response.json())
                    .then((responseJson) => {
                        //console.log("Action:", responseJson);
                        if (responseJson.status == 'success') {
                            setLoading(false);
                            Toast.show({ description: responseJson.message });
                            getAllData(monthYear, selectedORG);
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
                        //console.log("Action Error:", error);
                        Toast.show({ description: t("Sorry! Somthing went Wrong. Maybe Network request Failed") });
                    });
            } else {
                setLoading(false);
                AsyncStorage.clear();
                navigation.navigate('Login');
            }
        });
    }

    const onCheck = (e) => {
        setLoading(true);
        getAllData(monthYear, e);
        setSelectedORG(e);
        AsyncStorage.setItem('selectedOrg', JSON.stringify(e));
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
                        <Text color="#111111" fontSize="16" textAlign="center" fontWeight="bold">{t("Registered Liftings")}</Text>
                        <Image source={logoImage ? { uri: logoImage } : require('../assets/images/logo.png')} style={{ width: 60, height: 25, resizeMode: 'contain' }} />
                    </HStack>
                </LinearGradient>
                <ImageBackground source={require('../assets/images/bg.jpg')} imageStyle={{ resizeMode: 'contain', position: 'absolute', bottom: 0, top: '65%', opacity: liftingList.length < 1 ? 0.6 : 0 }} style={styles.bgimage}>
                    <ScrollView>
                        <LinearGradient
                            colors={[lightColor, darkColor]}
                            style={{ height: 100, position: 'absolute', top: 0, width: '100%', borderBottomEndRadius: 100, borderBottomStartRadius: 100, overflow: 'hidden' }}
                            start={{ x: 0.5, y: 0 }}
                        ></LinearGradient>
                        {memberType == "CSO" && (
                            <OrgTabComponents clickBtn={onCheck} navigation={navigation} component={selectedORG} />
                        )}
                        <Box padding="5">
                            <Box style={styles.productbox}>
                                <Stack mb="4" pb="3" borderBottomWidth={1} borderColor="#bbbbbb">
                                    <Text color="#000000" fontSize="14" fontWeight="medium" textAlign="center">{t("Window Month & Year")}</Text>
                                </Stack>
                                <HStack justifyContent="space-between" bg="#444444" style={{ padding: 10, borderRadius: 14, overflow: 'hidden' }}>
                                    <View style={[styles.inputbox, { borderRadius: 7, marginVertical: 0, backgroundColor: '#ffffff' }]}>
                                        <Select style={{ height: 35 }} variant="underlined" size="md" placeholder={t("Month - Year")}
                                            InputLeftElement={<Icon name="calendar-outline" size={20} color="#666666" style={{ width: 25, marginLeft: 10, marginRight: 10, textAlign: 'center' }} />}
                                            selectedValue={monthYear}
                                            onValueChange={value => onSelectWindow(value)}
                                            _selectedItem={{
                                                backgroundColor: '#eeeeee',
                                                endIcon: <Icon name="checkmark-circle" size={22} color="#2BBB86" style={{ right: 0, position: 'absolute' }} />
                                            }}>
                                            {windowList.map((item, index) =>
                                                <Select.Item key={index} label={item.month_text + ", " + item.year} value={item.month + "-" + item.year} />
                                            )}
                                        </Select>
                                    </View>
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
                                <VStack>
                                    {liftingList.map((item, index) =>
                                        <VStack key={index} style={styles.productbox}>
                                            <HStack paddingY="2" borderColor="#dddddd" borderBottomWidth="1" justifyContent="space-between" alignItems="center">
                                                <Text fontSize='xs' fontWeight="bold" color="#666666">{t("Engineer Name")}:</Text>
                                                <Text fontSize='sm' fontWeight="bold" color="#111111" style={{ width: 200, textAlign: 'right' }}>{item.eng_contacts_name}</Text>
                                            </HStack>
                                            <HStack paddingY="2" borderColor="#dddddd" borderBottomWidth="1" justifyContent="space-between" alignItems="center">
                                                <Text fontSize='xs' fontWeight="bold" color="#666666">{t("Customer Name")}:</Text>
                                                <Text fontSize='sm' fontWeight="bold" color="#111111" style={{ width: 200, textAlign: 'right' }}>{item.project_contact_person}</Text>
                                            </HStack>
                                            <HStack paddingY="2" borderColor="#dddddd" borderBottomWidth="1" justifyContent="space-between" alignItems="center">
                                                <Text fontSize='xs' fontWeight="bold" color="#666666">{t("Phone")}:</Text>
                                                <Text fontSize='sm' fontWeight="bold" color="#111111">{item.project_contact_phone_number}</Text>
                                            </HStack>
                                            {item.address !== "" && (
                                                <HStack paddingY="2" borderColor="#dddddd" borderBottomWidth="1" justifyContent="space-between" alignItems="center">
                                                    <Text fontSize='xs' fontWeight="bold" color="#666666">{t("Address")}:</Text>
                                                    <Text fontSize='sm' fontWeight="bold" color="#111111" style={{ width: 200, textAlign: 'right' }}>{item.address}</Text>
                                                </HStack>
                                            )}
                                            <HStack paddingY="2" borderColor="#dddddd" borderBottomWidth="1" justifyContent="space-between" alignItems="center">
                                                <Text fontSize='xs' fontWeight="bold" color="#666666">{t("State")}:</Text>
                                                <Text fontSize='sm' fontWeight="bold" color="#111111">{item.state_name}</Text>
                                            </HStack>
                                            <HStack paddingY="2" borderColor="#dddddd" borderBottomWidth="1" justifyContent="space-between" alignItems="center">
                                                <Text fontSize='xs' fontWeight="bold" color="#666666">{t("District")}:</Text>
                                                <Text fontSize='sm' fontWeight="bold" color="#111111">{item.dist_name}</Text>
                                            </HStack>
                                            {item.pin_code !== "" && (
                                                <HStack paddingY="2" borderColor="#dddddd" borderBottomWidth="1" justifyContent="space-between" alignItems="center">
                                                    <Text fontSize='xs' fontWeight="bold" color="#666666">{t("Pincode")}:</Text>
                                                    <Text fontSize='sm' fontWeight="bold" color="#111111">{item.pin_code}</Text>
                                                </HStack>
                                            )}
                                            <HStack paddingY="2" borderColor="#dddddd" borderBottomWidth="1" justifyContent="space-between" alignItems="center">
                                                <Text fontSize='xs' fontWeight="bold" color="#666666">{t("Product")}:</Text>
                                                <Text fontSize='sm' fontWeight="bold" color="#111111">{item.product_name}</Text>
                                            </HStack>
                                            <HStack paddingY="2" borderColor="#dddddd" borderBottomWidth="1" justifyContent="space-between" alignItems="center">
                                                <Text fontSize='xs' fontWeight="bold" color="#666666">{t("Date")}:</Text>
                                                <Text fontSize='sm' fontWeight="bold" color="#111111">{item.sale_date}</Text>
                                            </HStack>
                                            <HStack paddingY="2" justifyContent="space-between" alignItems="center">
                                                <Text fontSize='xs' fontWeight="bold" color="#666666">{t("Registered Quantity")}:</Text>
                                                <Text fontSize='sm' fontWeight="bold" color="#111111">{item.claimed_quantity}</Text>
                                            </HStack>
                                            <HStack space={1} alignItems="center" justifyContent="space-evenly" bg="#e6e6e6" borderRadius="10" overflow="hidden" padding="2" mt="4">
                                                <LinearGradient
                                                    colors={["#821700", "#f04e23"]}
                                                    start={{ x: 0.5, y: 0 }}
                                                    style={styles.optionbtn}
                                                >
                                                    <Button size="xs" variant="link" _text={{ color: "#ffffff", fontWeight: 'bold', fontSize: 13 }} onPress={() => updateStatus(0, item)}>{t("Reject")}</Button>
                                                </LinearGradient>
                                                <LinearGradient
                                                    colors={["#10764F", "#2BBB86"]}
                                                    start={{ x: 0.5, y: 0 }}
                                                    style={styles.optionbtn}
                                                >
                                                    <Button size="xs" variant="link" _text={{ color: "#ffffff", fontWeight: 'bold', fontSize: 13 }} onPress={() => updateStatus(1, item)}>{t("Confirm")}</Button>
                                                </LinearGradient>
                                            </HStack>
                                        </VStack>
                                    )}
                                </VStack>
                            )}
                            {totalPage == 1 && (
                                <HStack paddingY="3" paddingX="6" justifyContent="center">
                                    <Button variant="outline" size={'xs'} rounded={30} onPress={() => loadMore()}>
                                        <Text color="#bbbbbb">{t("Load More")}</Text>
                                    </Button>
                                </HStack>
                            )}
                        </Box>
                    </ScrollView>
                </ImageBackground>
            </Box>
            {pop && (
                <VStack flex={1} style={{ backgroundColor: "rgba(0,0,0,0.85)", position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center', padding: 30 }}>
                    <Box style={styles.productbox}>
                        <Text color="#666666" fontSize="md">{t("Claimed Quantity")} *</Text>
                        <View style={styles.inputbox}>
                            <Input size="lg" style={{ paddingLeft: 15 }} value={newQty.toString()} onChangeText={(text) => setNewQty(text)} keyboardType='number-pad' variant="unstyled" />
                        </View>
                        <Text color="#666666" fontSize="md" mt="2">{t("Search Dealer by Id/Phone")} *</Text>
                        <HStack mb="5" justifyContent="space-between">
                            <View style={[styles.inputbox, { width: '70%' }]}>
                                <Input size="lg" onChangeText={(text) => setSearchTerm(text)} variant="unstyled" InputLeftElement={<Icon name="search-outline" size={20} color="#666666" style={{ width: 25, marginLeft: 10, textAlign: 'center' }} />} placeholder={t("Search Dealer") + " *"} />
                            </View>
                            <Button size="xs" style={[styles.custbtn, { width: '25%', marginVertical: 7, backgroundColor: "#777777" }]} onPress={() => getFilteredDealer()}>
                                <Text color="#ffffff" fontSize="sm" fontWeight="medium">{t("Search")}</Text>
                            </Button>
                        </HStack>
                        {dealerList.length != 0 && (
                            <View>
                                <Text color="#666666" fontSize="md" textAlign="center">{t("Please Select Dealer")}</Text>
                                <View style={[styles.inputbox, { paddingHorizontal: 15 }]}>
                                    <Radio.Group name="myRadioGroup" accessibilityLabel="favorite number" value={dealerId} onChange={value => {
                                        setDealerId(value);
                                    }}>
                                        {dealerList.map((item, index) =>
                                            <Radio key={index} colorScheme="black" value={item.id}>
                                                <VStack marginY={3}>
                                                    <Text color="#111111" fontSize="md" fontWeight="bold">{item.dealer_firm_name}</Text>
                                                </VStack>
                                            </Radio>
                                        )}
                                    </Radio.Group>
                                </View>
                            </View>
                        )}
                        <HStack space={1} alignItems="center" justifyContent="space-evenly" bg="#eeeeee" borderRadius="10" overflow="hidden" padding="2" mt="4">
                            <LinearGradient
                                colors={["#821700", "#f04e23"]}
                                start={{ x: 0.5, y: 0 }}
                                style={styles.optionbtn}
                            >
                                <Button size="xs" variant="link" _text={{ color: "#ffffff", fontWeight: 'bold', fontSize: 13 }} onPress={() => onCancel()}>{t("Cancel")}</Button>
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
    inputbox: { backgroundColor: 'rgba(0,0,0,0.06)', borderRadius: 10, width: '100%', overflow: 'hidden', marginVertical: 7 },
    custbtn: { width: '100%', backgroundColor: '#111111', borderRadius: 8, overflow: 'hidden' },
    optionbtn: { backgroundColor: 'none', width: '46%', borderRadius: 8, overflow: 'hidden' },
    spincontainer: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0, 0, 0, 0.8)' },
});

export default CSOSaleConfirmListScreen;
