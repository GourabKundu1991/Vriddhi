import AsyncStorage from '@react-native-async-storage/async-storage';
import { Actionsheet, Box, Button, HStack, Input, NativeBaseProvider, ScrollView, Text, Toast, VStack } from 'native-base';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Image, StyleSheet, TouchableOpacity, StatusBar, View, ImageBackground, Pressable, Linking, Alert } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import { API_KEY, BASE_URL } from '../auth_provider/Config';

const MemberListOptionScreen = ({ navigation, route }) => {

    const { t } = useTranslation();

    const [loading, setLoading] = React.useState(false);
    const [lightColor, setLightColor] = React.useState("#cbf75e");
    const [darkColor, setDarkColor] = React.useState("#2BBB86");
    const [logoImage, setLogoImage] = React.useState("");
    const [cameraColor, setCameraColor] = React.useState("#f04e23");

    const [memberName, setMemberName] = React.useState("");
    const [userType, setUserType] = React.useState("");
    const [dealerName, setDealerName] = React.useState("");
    const [dealerCode, setDealerCode] = React.useState("");
    const [memberPhone, setMemberPhone] = React.useState("");
    const [currentBalance, setCurrentBalance] = React.useState("");
    const [memberCode, setmemberCode] = React.useState("");
    const [kycStatus, setKycStatus] = React.useState("");

    const [memberContactId, setmemberContactId] = React.useState("");

    const [filterStatus, setFilterStatus] = React.useState("");
    const [orgList, setOrgList] = React.useState([]);

    const [dealerPop, setDealerPop] = React.useState(false);
    const [otp, setOtp] = React.useState('');
    const [verifyContactId, setVerifyContactId] = React.useState('');

    const [searchDealer, setSearchDealer] = React.useState("");
    const [isDealerOpen, setIsDealerOpen] = React.useState(false);
    const [dealerTypr, setDealerType] = React.useState("");

    const [dealerList, setDealerList] = React.useState([]);

    const [primaryDealer, setPrimaryDealer] = React.useState("");
    const [secondDealer, setSecondDealer] = React.useState("");
    const [thirdDealer, setThirdDealer] = React.useState("");

    const [csrfToken, setCSRFToken] = React.useState("");

    const [altOrgId, setAltOrgId] = React.useState("");
    const [influencerContactId, setInfluencerContactId] = React.useState("");

    const [currentOrg, setCurrentOrg] = React.useState("");
    const [altOrg, setAltOrg] = React.useState("");

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            setLoading(true);
            AsyncStorage.getItem('userToken').then(val => {
                if (val != null) {
                    setFilterStatus(JSON.parse(val).org_id);
                    getAllData(JSON.parse(val).org_id);
                }
            })
        });
        return unsubscribe;
    }, []);

    const getAllData = (orgID) => {
        AsyncStorage.getItem('userToken').then(val => {
            if (val != null) {
                setLogoImage(JSON.parse(val).logo_url);

                setLightColor(JSON.parse(val).info.theme_color.light);
                setDarkColor(JSON.parse(val).info.theme_color.dark);

                let formdata = new FormData();
                formdata.append("APIkey", `${API_KEY}`);
                formdata.append("token", JSON.parse(val).token);
                formdata.append("orgId", JSON.parse(val).org_id);
                formdata.append("altOrgId", orgID);
                formdata.append("memberId", route.params.id);
                formdata.append("pageNumber", 1);
                console.log(formdata);
                fetch(`${BASE_URL}/member_details`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                    body: formdata
                })
                    .then((response) => response.json())
                    .then((responseJson) => {
                        console.log("member_details:", responseJson);
                        if (responseJson.status == 'success') {
                            setMemberName(responseJson.member_name);
                            setDealerName(responseJson.dealer_company_name);
                            setDealerCode(responseJson.member_dealer_code);
                            setMemberPhone(responseJson.member_ph_number);
                            setCurrentBalance(responseJson.current_balance);
                            setmemberCode(responseJson.member_code);
                            setmemberContactId(responseJson.member_contacts_id);
                            setUserType(responseJson.influencer_member_type);
                            setLoading(false);
                            setOrgList(responseJson.selected_org);
                            setKycStatus(responseJson.member_ekyc_status);
                            setCurrentOrg(responseJson.member_org);
                            setAltOrg(responseJson.alternate_member_org);
                            fetch(`${BASE_URL}/get_csrf_token`, {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'multipart/form-data',
                                },
                                body: formdata
                            })
                                .then((response) => response.json())
                                .then((responseJsonData) => {
                                    console.log("CSRF Token:", responseJsonData.account_hash);
                                    if (responseJsonData.status == 'success') {
                                        setLoading(false);
                                        setCSRFToken(responseJsonData.account_hash);
                                    } else {
                                        Toast.show({ description: responseJsonData.message });
                                        setTimeout(function () {
                                            setLoading(false);
                                            if (responseJsonData.msg_code == "msg_1000") {
                                                AsyncStorage.clear();
                                                navigation.navigate('Login');
                                            }
                                        }, 1000);
                                    }
                                })
                                .catch((error) => {
                                    setLoading(false);
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
                        //console.log("member_details Error:", error);
                        Toast.show({ description: t("Sorry! Somthing went Wrong. Maybe Network request Failed") });
                    });
            } else {
                setLoading(false);
                AsyncStorage.clear();
                navigation.navigate('Login');
            }
        });
    }

    const onSetFilter = (orgID) => {
        setLoading(true);
        setFilterStatus(orgID);
        getAllData(orgID);
    }

    const onCopy = () => {
        AsyncStorage.getItem('userToken').then(val => {
            if (val != null) {
                let formdata = new FormData();
                formdata.append("APIkey", `${API_KEY}`);
                formdata.append("token", JSON.parse(val).token);
                formdata.append("orgId", JSON.parse(val).org_id);
                formdata.append("contact_id", route.params.id);
                formdata.append("officer_alternate_contacts_id", route.params.contactId);
                console.log(formdata);
                fetch(`${BASE_URL}/copy_member_details_alternate_org`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                    body: formdata
                })
                    .then((response) => response.json())
                    .then((responseJson) => {
                        console.log("copy_member_details_alternate_org:", responseJson);
                        if (responseJson.status == 'success') {
                            setLoading(false);
                            setAltOrgId(responseJson.alternate_org_id);
                            setInfluencerContactId(responseJson.influencerContactId);
                            setDealerPop(true);
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
                        //console.log("copy_member_details_alternate_org Error:", error);
                        Toast.show({ description: t("Sorry! Somthing went Wrong. Maybe Network request Failed") });
                    });
            } else {
                setLoading(false);
                AsyncStorage.clear();
                navigation.navigate('Login');
            }
        });
    }

    const closeDealerPop = () => {
        setDealerPop(false);
        setSearchDealer("");
        setPrimaryDealer("");
        setSecondDealer("");
        setThirdDealer("");
    }

    const onDealerOpen = (val) => {
        setLoading(true);
        setDealerType(val);
        getDealerList();
    }
    const onDealerClose = () => {
        setIsDealerOpen(false);
    }

    const onSelectDealer = (details) => {
        onDealerClose();
        if (dealerTypr == "primary") {
            setPrimaryDealer(details);
        } else if (dealerTypr == "second") {
            setSecondDealer(details);
        } else if (dealerTypr == "thrid") {
            setThirdDealer(details);
        }
    }

    const onDealerCancel = (type) => {
        setSearchDealer("");
        if (type == "primary") {
            setPrimaryDealer("");
            setSecondDealer("");
            setThirdDealer("");
        } else if (type == "second") {
            setSecondDealer("");
            setThirdDealer("");
        } else if (type == "thrid") {
            setThirdDealer("");
        }
    }

    const getDealerList = () => {
        AsyncStorage.getItem('userToken').then(val => {
            if (val != null) {
                let formdata = new FormData();
                formdata.append("APIkey", `${API_KEY}`);
                formdata.append("token", JSON.parse(val).token);
                formdata.append("orgId", JSON.parse(val).org_id);
                formdata.append("contact_str", searchDealer);
                formdata.append("copyMemberId", memberContactId);
                formdata.append("officer_alternate_contacts_id", route.params.contactId);
                console.log(JSON.stringify(formdata));
                fetch(`${BASE_URL}/get_contact_details_by_contact_stream`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                    body: formdata
                })
                    .then((response) => response.json())
                    .then((responseJson) => {
                        console.log("get_contact_details_by_contact_stream:", responseJson);
                        if (responseJson.status == 'success') {
                            setLoading(false);
                            if (responseJson.dealer_list.length == 0) {
                                Toast.show({ description: "Sorry! No Dealer Found" });
                            } else {
                                setDealerList(responseJson.dealer_list);
                                setIsDealerOpen(true);
                            }
                        } else {
                            Toast.show({ description: responseJson.message });
                            setDealerList([]);
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
                        console.log("get_contact_details_by_contact_stream Error:", error);
                        Toast.show({ description: t("Sorry! Somthing went Wrong. Maybe Network request Failed") });
                    });
            } else {
                setLoading(false);
                AsyncStorage.clear();
                navigation.navigate('Login');
            }
        });
    }

    const onSubmit = () => {
        if (primaryDealer == "") {
            Toast.show({ description: t("Please select Primary Dealer") });
        } else {
            Alert.alert(
                t("Warning"),
                t("Do you want to Extend this member to ") + altOrg + "?",
                [
                    {
                        text: t("Cancel"),
                        onPress: () => console.log("Cancel Pressed"),
                        style: "cancel"
                    },
                    {
                        text: t("Yes"), onPress: () => {
                            setLoading(true);
                            AsyncStorage.getItem('userToken').then(val => {
                                if (val != null) {
                                    let formdata = new FormData();
                                    formdata.append("APIkey", `${API_KEY}`);
                                    formdata.append("orgId", JSON.parse(val).org_id);
                                    formdata.append("token", JSON.parse(val).token);
                                    formdata.append("alternate_org_id", altOrgId);
                                    formdata.append("influencerContactId", influencerContactId);
                                    formdata.append("primary_dealer_contact_id", (primaryDealer != "" ? primaryDealer.c_id : ""));
                                    formdata.append("secondary_dealer01_contact_id", (secondDealer != "" ? secondDealer.c_id : ""));
                                    formdata.append("secondary_dealer02_contact_id", (thirdDealer != "" ? thirdDealer.c_id : ""));
                                    formdata.append("officer_alternate_contacts_id", route.params.contactId);
                                    formdata.append("account_hash", csrfToken);
                                    console.log(formdata);
                                    fetch(`${BASE_URL}/store_member_details_with_dealers`, {
                                        method: 'POST',
                                        headers: {
                                            'Content-Type': 'multipart/form-data',
                                        },
                                        body: formdata
                                    })
                                        .then((response) => response.json())
                                        .then((responseJson) => {
                                            console.log("store_member_details_with_dealers:", responseJson);
                                            if (responseJson.status == 'success') {
                                                Toast.show({ description: responseJson.message });
                                                setVerifyContactId(responseJson.verifyContactId);
                                                setDealerPop(false);
                                                setTimeout(function () {
                                                    setLoading(false);
                                                    setPrimaryDealer("");
                                                    setSecondDealer("");
                                                    setThirdDealer("");
                                                    navigation.goBack();
                                                }, 1000);
                                            } else {
                                                Toast.show({ description: responseJson.message });
                                                closeDealerPop();
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
                                            console.log("store_member_details_with_dealers Error:", error);
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
                ],
                { cancelable: false }
            );
        }
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
                        <Text color="#111111" fontSize="16" textAlign="center" fontWeight="bold" textTransform="capitalize">{t("Member Details")}</Text>
                        <Image source={logoImage ? { uri: logoImage } : require('../assets/images/logo.png')} style={{ width: 60, height: 25, resizeMode: 'contain' }} />
                    </HStack>
                </LinearGradient>
                <ScrollView>
                    <LinearGradient
                        colors={[lightColor, darkColor]}
                        style={{ height: 90, position: 'absolute', top: 0, width: '100%', borderBottomEndRadius: 100, borderBottomStartRadius: 100, overflow: 'hidden' }}
                        start={{ x: 0.5, y: 0 }}
                    ></LinearGradient>
                    <Box padding="5">
                        {route.params.forCopy == 1 && (
                            <Box style={[styles.productbox, { paddingHorizontal: 8 }]}>
                                <LinearGradient
                                    colors={["#666666", "#111111"]}
                                    start={{ x: 0.5, y: 0 }}
                                    style={{ height: 35, borderRadius: 10, overflow: 'hidden' }}
                                >
                                    <Button size="xs" variant="link" onPress={() => onCopy()}>
                                        <Text color="#ffffff" fontSize="xs" fontWeight="bold">{t("Extend to ") + altOrg}</Text>
                                    </Button>
                                </LinearGradient>
                            </Box>
                        )}
                        {orgList.length != 0 && (
                            <Box style={[styles.productbox, { paddingHorizontal: 8 }]}>
                                <HStack alignItems="center" justifyContent="space-evenly">
                                    {orgList.map((item, index) =>
                                        <LinearGradient
                                            key={index}
                                            colors={filterStatus == item.id ? ["#555555", "#000000"] : ["#eeeeee", "#bbbbbb"]}
                                            start={{ x: 0.5, y: 0 }}
                                            style={[styles.custbtn, { width: '45%' }]}
                                        >
                                            <Button size="xs" variant="link" _text={{ color: filterStatus == item.id ? "#ffffff" : "#111111", fontWeight: 'bold', fontSize: 12 }} onPress={() => onSetFilter(item.id)}>{item.name}</Button>
                                        </LinearGradient>
                                    )}
                                </HStack>
                            </Box>
                        )}
                        <VStack style={styles.productbox} padding="15">
                            <HStack paddingY="2" borderColor="#dddddd" borderBottomWidth="1" justifyContent="space-between" alignItems="center">
                                <Text fontSize='xs' fontWeight="bold" color="#666666" w={'40%'}>{t("Current Organisation")}:</Text>
                                <Text fontSize='sm' fontWeight="bold" color="#111111" w={'55%'} textAlign="right">{currentOrg}</Text>
                            </HStack>
                            <HStack paddingY="2" borderColor="#dddddd" borderBottomWidth="1" justifyContent="space-between" alignItems="center">
                                <Text fontSize='xs' fontWeight="bold" color="#666666" w={'40%'}>{t("Member Name")}:</Text>
                                <Text fontSize='sm' fontWeight="bold" color="#111111" w={'55%'} textAlign="right">{memberName}</Text>
                            </HStack>
                            <HStack paddingY="2" borderColor="#dddddd" borderBottomWidth="1" justifyContent="space-between" alignItems="center">
                                <Text fontSize='xs' fontWeight="bold" color="#666666" w={'40%'}>{t("Member Code")}:</Text>
                                <Text fontSize='sm' fontWeight="bold" color="#111111" w={'55%'} textAlign="right">{memberCode}</Text>
                            </HStack>
                            {userType != "" && (
                                <HStack paddingY="2" borderColor="#dddddd" borderBottomWidth="1" justifyContent="space-between" alignItems="center">
                                    <Text fontSize='xs' fontWeight="bold" color="#666666" w={'40%'}>{t("Member Type")}:</Text>
                                    <Text fontSize='sm' fontWeight="bold" color="#111111" w={'55%'} textAlign="right">{userType}</Text>
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
                            <HStack paddingY="2" borderColor="#dddddd" borderBottomWidth="1" justifyContent="space-between" alignItems="center">
                                <Text fontSize='xs' fontWeight="bold" color="#666666" w={'40%'}>{t("KYC Status")}:</Text>
                                <Text fontSize='sm' fontWeight="bold" color="#111111" w={'55%'} textAlign="right">{kycStatus}</Text>
                            </HStack>
                            <HStack paddingY="2" justifyContent="space-between" alignItems="center">
                                <Text fontSize='xs' fontWeight="bold" color="#666666" w={'40%'}>{t("Available Points")}:</Text>
                                <Text fontSize='sm' fontWeight="bold" color="#111111" w={'55%'} textAlign="right">{currentBalance}</Text>
                            </HStack>
                        </VStack>
                        <Box style={styles.productbox}>
                            <HStack justifyContent="space-between" alignItems="center">
                                <View style={{ width: '70%' }}>
                                    <Text fontSize='md' fontWeight="bold" color="#111111">{t("Lifting History")}</Text>
                                </View>
                                <LinearGradient
                                    colors={[lightColor, darkColor]}
                                    start={{ x: 0.5, y: 0 }}
                                    style={{ width: '25%', height: 38, borderRadius: 10, overflow: 'hidden' }}
                                >
                                    <Button size="xs" variant="link" onPress={() => navigation.navigate("MemberDetails", { id: route.params.id, pagetitle: t("Lifting History"), altId: filterStatus })}>
                                        <Text color="#111111" fontSize="sm" fontWeight="bold">{t("View")}</Text>
                                    </Button>
                                </LinearGradient>
                            </HStack>
                        </Box>
                        <Box style={styles.productbox}>
                            <HStack justifyContent="space-between" alignItems="center">
                                <View style={{ width: '70%' }}>
                                    <Text fontSize='md' fontWeight="bold" color="#111111">{t("Order History")}</Text>
                                </View>
                                <LinearGradient
                                    colors={[lightColor, darkColor]}
                                    start={{ x: 0.5, y: 0 }}
                                    style={{ width: '25%', height: 38, borderRadius: 10, overflow: 'hidden' }}
                                >
                                    <Button size="xs" variant="link" onPress={() => navigation.navigate("MemberDetails", { id: route.params.id, pagetitle: t("Order History"), altId: filterStatus })}>
                                        <Text color="#111111" fontSize="sm" fontWeight="bold">{t("View")}</Text>
                                    </Button>
                                </LinearGradient>
                            </HStack>
                        </Box>
                        <Box style={styles.productbox}>
                            <HStack justifyContent="space-between" alignItems="center">
                                <View style={{ width: '70%' }}>
                                    <Text fontSize='md' fontWeight="bold" color="#111111">{t("Point History")}</Text>
                                </View>
                                <LinearGradient
                                    colors={[lightColor, darkColor]}
                                    start={{ x: 0.5, y: 0 }}
                                    style={{ width: '25%', height: 38, borderRadius: 10, overflow: 'hidden' }}
                                >
                                    <Button size="xs" variant="link" onPress={() => navigation.navigate("MemberDetails", { id: route.params.id, pagetitle: t("Point History"), altId: filterStatus })}>
                                        <Text color="#111111" fontSize="sm" fontWeight="bold">{t("View")}</Text>
                                    </Button>
                                </LinearGradient>
                            </HStack>
                        </Box>
                    </Box>
                </ScrollView>
            </Box>
            {dealerPop && (
                <View style={styles.spincontainer}>
                    <Box style={[styles.productbox, { width: 330, padding: 0, borderWidth: 0 }]}>
                        <LinearGradient
                            colors={[darkColor, lightColor]}
                            start={{ x: 0.5, y: 0 }}
                            style={{ padding: 8 }}
                        >
                            <HStack justifyContent="center" alignContent="center">
                                <Text mt={2} mb={2} fontSize="md" fontWeight="bold" color="#111111">{t("Dealer Details")}</Text>
                            </HStack>
                        </LinearGradient>
                        <Box paddingX={4} paddingY={6}>
                            {primaryDealer == "" ?
                                <HStack justifyContent="space-between">
                                    <View style={[styles.inputbox, { width: '73%' }]}>
                                        <Input size="lg" onChangeText={(text) => setSearchDealer(text)} variant="unstyled" InputLeftElement={<Icon name="search-outline" size={20} color="#666666" style={{ width: 25, marginLeft: 10, textAlign: 'center' }} />} placeholder={t("Primary Dealer") + " *"} />
                                    </View>
                                    <Button size="xs" style={[styles.custbtn, { width: '25%', marginVertical: 7, backgroundColor: "#777777" }]} onPress={() => onDealerOpen("primary")}>
                                        <Text color="#ffffff" fontSize="md" fontWeight="medium">{t("Search")}</Text>
                                    </Button>
                                </HStack>
                                :
                                <HStack justifyContent="space-between" alignItems="center" mb="3">
                                    <View style={{ width: '80%' }}>
                                        <Text color={darkColor} fontSize="12">{t("Primary Dealer Code")} *</Text>
                                        <Text color="#111111" fontSize="16" fontWeight="bold" >{primaryDealer.shop_name}</Text>
                                    </View>
                                    <Button size="xs" variant="link" onPress={() => onDealerCancel("primary")}>
                                        <Icon name="close-circle-outline" size={30} color={cameraColor} />
                                    </Button>
                                </HStack>
                            }
                            {primaryDealer != "" && secondDealer == "" && (
                                <HStack justifyContent="space-between">
                                    <View style={[styles.inputbox, { width: '73%' }]}>
                                        <Input size="lg" onChangeText={(text) => setSearchDealer(text)} variant="unstyled" InputLeftElement={<Icon name="search-outline" size={20} color="#666666" style={{ width: 25, marginLeft: 10, textAlign: 'center' }} />} placeholder={t("Secondary Dealer 1")} />
                                    </View>
                                    <Button size="xs" style={[styles.custbtn, { width: '25%', height: 42, marginVertical: 7, backgroundColor: "#777777" }]} onPress={() => onDealerOpen("second")}>
                                        <Text color="#ffffff" fontSize="md" fontWeight="medium">{t("Search")}</Text>
                                    </Button>
                                </HStack>
                            )}
                            {secondDealer != "" && (
                                <HStack justifyContent="space-between" alignItems="center" mb="3">
                                    <View style={{ width: '80%' }}>
                                        <Text color={darkColor} fontSize="12">{t("Secondary Dealer 1")}</Text>
                                        <Text color="#111111" fontSize="16" fontWeight="bold" >{secondDealer.shop_name}</Text>
                                    </View>
                                    <Button size="xs" variant="link" onPress={() => onDealerCancel("second")}>
                                        <Icon name="close-circle-outline" size={30} color={cameraColor} />
                                    </Button>
                                </HStack>
                            )}
                            {secondDealer != "" && thirdDealer == "" && (
                                <HStack justifyContent="space-between">
                                    <View style={[styles.inputbox, { width: '73%' }]}>
                                        <Input size="lg" onChangeText={(text) => setSearchDealer(text)} variant="unstyled" InputLeftElement={<Icon name="search-outline" size={20} color="#666666" style={{ width: 25, marginLeft: 10, textAlign: 'center' }} />} placeholder={t("Secondary Dealer 2")} />
                                    </View>
                                    <Button size="xs" style={[styles.custbtn, { width: '25%', height: 42, marginVertical: 7, backgroundColor: "#777777" }]} onPress={() => onDealerOpen("thrid")}>
                                        <Text color="#ffffff" fontSize="md" fontWeight="medium">{t("Search")}</Text>
                                    </Button>
                                </HStack>
                            )}
                            {thirdDealer != "" && (
                                <HStack justifyContent="space-between" alignItems="center">
                                    <View style={{ width: '80%' }}>
                                        <Text color={darkColor} fontSize="12">{t("Secondary Dealer 2")}</Text>
                                        <Text color="#111111" fontSize="16" fontWeight="bold" >{thirdDealer.shop_name}</Text>
                                    </View>
                                    <Button size="xs" variant="link" onPress={() => onDealerCancel("thrid")}>
                                        <Icon name="close-circle-outline" size={30} color={cameraColor} />
                                    </Button>
                                </HStack>
                            )}

                            <HStack justifyContent="space-between" alignContent="center" marginTop={7}>
                                <Button size="xs" variant="outline" style={[styles.custOutlinebtn, { width: '48%', borderColor: '#111111', borderWidth: 1 }]} onPress={() => closeDealerPop()}>
                                    <Text color="#111111" fontSize="sm" fontWeight="medium">{t("Close")}</Text>
                                </Button>
                                <Button style={[styles.custbtn, { width: '48%', backgroundColor: '#111111' }]} onPress={() => onSubmit()}>
                                    <Text color="#ffffff" fontSize="sm" fontWeight="medium">{t("Continue")}</Text>
                                </Button>
                            </HStack>
                        </Box>
                    </Box>
                </View>
            )}
            <Actionsheet isOpen={isDealerOpen} onClose={onDealerClose}>
                <Actionsheet.Content>
                    <ScrollView style={{ width: '100%' }}>
                        {dealerList.map((item, index) =>
                            <Actionsheet.Item onPress={() => onSelectDealer(item)} key={index}>{item.shop_name}</Actionsheet.Item>
                        )}
                    </ScrollView>
                </Actionsheet.Content>
            </Actionsheet>
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
    inputbox: { backgroundColor: 'rgba(0,0,0,0.06)', borderRadius: 12, width: '100%', overflow: 'hidden', marginVertical: 7 },
    custOutlinebtn: { width: '100%', borderRadius: 12, overflow: 'hidden' },
    custbtn: { width: '100%', backgroundColor: '#111111', borderRadius: 12, overflow: 'hidden' },
    spincontainer: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0, 0, 0, 0.8)' },
});

export default MemberListOptionScreen;
