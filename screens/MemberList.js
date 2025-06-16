import AsyncStorage from '@react-native-async-storage/async-storage';
import { Actionsheet, Box, Button, HStack, Input, NativeBaseProvider, ScrollView, Stack, Text, Toast, VStack } from 'native-base';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, StyleSheet, TouchableOpacity, StatusBar, View, ImageBackground, Keyboard, Pressable, Linking } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import { API_KEY, BASE_URL, CONTACT_HIER_ID, ORG_ID, PROGRAM_ID } from '../auth_provider/Config';
import { useTranslation } from 'react-i18next';
import OrgTabComponents from '../components/OrgTab';

const MemberListScreen = ({ navigation }) => {

    const { t } = useTranslation();

    const [loading, setLoading] = React.useState(false);
    const [lightColor, setLightColor] = React.useState("#cbf75e");
    const [darkColor, setDarkColor] = React.useState("#2BBB86");
    const [cameraColor, setCameraColor] = React.useState("#f04e23");
    const [logoImage, setLogoImage] = React.useState("");
    const [dataFound, setDataFound] = React.useState("");

    const [searchTerm, setSearchTerm] = React.useState("");
    const [memberList, setMemberList] = React.useState("");
    const [pageNumber, setPageNumber] = React.useState(1);

    const [afterSearch, setAfterSearch] = React.useState(false);

    const [totalPage, setTotalPage] = React.useState("");
    const [altContactId, setAltContactId] = React.useState([]);

    const [altOrgId, setAltOrgId] = React.useState("");
    const [influencerContactId, setInfluencerContactId] = React.useState("");

    const [dealerPop, setDealerPop] = React.useState(false);
    const [popOTP, setPopOTP] = React.useState(false);
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

    const [memberType, setMemberType] = React.useState("");
    const [selectedORG, setSelectedORG] = React.useState("");

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            setLoading(true);
            AsyncStorage.getItem('userToken').then(val => {
                if (val != null) {
                    setMemberType(JSON.parse(val).member_type);
                    if (JSON.parse(val).member_type == "CSO") {
                        AsyncStorage.getItem('selectedOrg').then(orgVal => {
                            console.log("orgVal:", orgVal)
                            if (orgVal != null) {
                                setSelectedORG(JSON.parse(orgVal));
                                getAllData(JSON.parse(orgVal));
                            } else {
                                setSelectedORG(JSON.parse(val).default_org_selection[0].id);
                                getAllData(JSON.parse(val).default_org_selection[0].id);
                            }
                        })
                    } else {
                        setSelectedORG(JSON.parse(val).org_id);
                        getAllData(JSON.parse(val).org_id);
                    }
                }
            })
        });
        return unsubscribe;
    }, []);

    const getAllData = (forORG) => {
        AsyncStorage.getItem('userToken').then(val => {
            if (val != null) {
                setLogoImage(JSON.parse(val).logo_url);

                setLightColor(JSON.parse(val).info.theme_color.light);
                setDarkColor(JSON.parse(val).info.theme_color.dark);

                let formdata = new FormData();
                formdata.append("APIkey", `${API_KEY}`);
                formdata.append("token", JSON.parse(val).token);
                formdata.append("orgId", JSON.parse(val).org_id);
                formdata.append("search_key", searchTerm);
                formdata.append("page", 1);
                formdata.append("defaultOrgSelection", forORG);
                fetch(`${BASE_URL}/members_list`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                    body: formdata
                })
                    .then((response) => response.json())
                    .then((responseJson) => {
                        console.log("Members:", responseJson);
                        if (responseJson.status == 'success') {
                            setMemberList(responseJson.members_list);
                            setAfterSearch(true);
                            setTotalPage(responseJson.total_pages);
                            setDataFound("found");
                            setAltContactId(responseJson.has_duplicate_account);
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
                            setMemberList([]);
                            setDataFound("notfound");
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
                        //console.log("Members Error:", error);
                        Toast.show({ description: t("Sorry! Somthing went Wrong. Maybe Network request Failed") });
                    });
            } else {
                setLoading(false);
                AsyncStorage.clear();
                navigation.navigate('Login');
            }
        });
    }

    const onSearch = () => {
        Keyboard.dismiss();
        setLoading(true);
        setPageNumber(1);
        getAllData(selectedORG);
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
                formdata.append("search_key", searchTerm);
                formdata.append("page", num);
                formdata.append("defaultOrgSelection", selectedORG);
                fetch(`${BASE_URL}/members_list`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                    body: formdata
                })
                    .then((response) => response.json())
                    .then((responseJson) => {
                        //console.log("Loadmore Member List:", responseJson);
                        if (responseJson.members_list.length != 0) {
                            setLoading(false);
                            let newArrya = memberList.concat(responseJson.members_list);
                            setMemberList(newArrya);
                            setPageNumber(num);
                            setTotalPage(responseJson.total_pages);
                        } else {
                            setLoading(false);
                            setPageNumber(1);
                            setTotalPage("");
                        }
                    })
                    .catch((error) => {
                        setLoading(false);
                        //console.log("Loadmore Member List Error:", error);
                        Toast.show({ description: t("Sorry! Somthing went Wrong. Maybe Network request Failed") });
                    });
            } else {
                setLoading(false);
                AsyncStorage.clear();
                navigation.navigate('Login');
            }
        });
    };


    const onCheck = (e) => {
        setLoading(true);
        getAllData(e);
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
                        <Text color="#111111" fontSize="16" textAlign="center" fontWeight="bold" textTransform="capitalize">{t("Member List")}</Text>
                        <Image source={logoImage ? { uri: logoImage } : require('../assets/images/logo.png')} style={{ width: 60, height: 25, resizeMode: 'contain' }} />
                    </HStack>
                </LinearGradient>
                <ImageBackground source={require('../assets/images/bg.jpg')} imageStyle={{ resizeMode: 'contain', position: 'absolute', bottom: 0, top: '65%', opacity: memberList.length < 4 ? 0.6 : 0 }} style={styles.bgimage}>
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
                            {afterSearch && (
                                <Box style={styles.productbox}>
                                    <HStack justifyContent="space-between">
                                        <View style={[styles.inputbox, { width: '70%' }]}>
                                            <Input size="lg" onChangeText={(text) => setSearchTerm(text)} variant="unstyled" InputLeftElement={<Icon name="search-outline" size={20} color="#666666" style={{ width: 25, marginLeft: 10, textAlign: 'center' }} />} placeholder={t("Member Id / Phone")} />
                                        </View>
                                        <Button size="xs" style={[styles.custbtn, { width: '25%', marginVertical: 7, backgroundColor: "#666666" }]} onPress={() => onSearch()}>
                                            <Text color="#ffffff" fontSize="md" fontWeight="medium">{t("Search")}</Text>
                                        </Button>
                                    </HStack>
                                </Box>
                            )}
                            {dataFound == "notfound" && (
                                <Stack space={5} style={[styles.productbox, { height: 350, justifyContent: 'center', alignItems: 'center', padding: 30 }]}>
                                    <Icon name="hourglass-outline" size={80} color="#999999" />
                                    <Text fontSize='lg' fontWeight="bold" textAlign="center" color="#111111">{t("Result Not Found")}</Text>
                                    <Text fontSize='sm' fontWeight="medium" textAlign="center" color="#666666">{t("Whoops... This Information is not available for a moment")}</Text>
                                </Stack>
                            )}
                            {dataFound == "found" && (
                                <VStack>
                                    {memberList.map((item, index) =>
                                        <Box key={index} style={styles.productbox}>
                                            <HStack justifyContent="space-between" alignItems="center">
                                                <View style={{ width: '70%' }}>
                                                    <Text fontSize='md' fontWeight="bold" color="#111111">{item.farm_name}</Text>
                                                    <Text fontSize='sm' fontWeight="bold" color="#666666">{t("Member ID")}: {item.id_extern01}</Text>
                                                    <Pressable onPress={() => { Linking.openURL(`tel:${item.phone_no}`) }} style={{ marginTop: 5 }}>
                                                        <HStack space={2}>
                                                            <Stack justifyContent="center" alignItems="center" style={{ backgroundColor: darkColor, width: 22, height: 22, borderRadius: 6 }}><Icon name="call" size={14} color="#ffffff" /></Stack>
                                                            <Text fontSize='sm' fontWeight="medium" color={darkColor}>{item.phone_no}</Text>
                                                        </HStack>
                                                    </Pressable>
                                                </View>
                                                <VStack style={{ width: '25%' }} space={2}>
                                                    {/* {item.able_to_copy == 1 && (
                                                    <LinearGradient
                                                        colors={["#666666", "#111111"]}
                                                        start={{ x: 0.5, y: 0 }}
                                                        style={{ height: 35, borderRadius: 10, overflow: 'hidden' }}
                                                    >
                                                        <Button size="xs" variant="link" onPress={() => onCopy(item.member_id)}>
                                                            <Text color="#ffffff" fontSize="xs" fontWeight="bold">{t("Copy")}</Text>
                                                        </Button>
                                                    </LinearGradient>
                                                    )} */}
                                                    <LinearGradient
                                                        colors={[lightColor, darkColor]}
                                                        start={{ x: 0.5, y: 0 }}
                                                        style={{ height: 35, borderRadius: 10, overflow: 'hidden' }}
                                                    >
                                                        <Button size="xs" variant="link" onPress={() => navigation.navigate("MemberListOption", { id: item.member_id, forCopy: item.able_to_copy, contactId: altContactId })}>
                                                            <Text color="#111111" fontSize="xs" fontWeight="bold">{t("Details")}</Text>
                                                        </Button>
                                                    </LinearGradient>
                                                </VStack>
                                            </HStack>
                                        </Box>
                                    )}
                                </VStack>
                            )}
                            {pageNumber != totalPage && (
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
    custbtn: { width: '100%', borderRadius: 12, overflow: 'hidden' },
    spincontainer: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0, 0, 0, 0.9)' },
});
export default MemberListScreen;
