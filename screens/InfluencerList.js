import AsyncStorage from '@react-native-async-storage/async-storage';
import { Box, Button, HStack, Input, NativeBaseProvider, ScrollView, Stack, Text, Toast, VStack } from 'native-base';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, StyleSheet, TouchableOpacity, StatusBar, View, ImageBackground, Keyboard, Linking, Pressable } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import { API_KEY, BASE_URL, CONTACT_HIER_ID, ORG_ID, PROGRAM_ID } from '../auth_provider/Config';
import { useTranslation } from 'react-i18next';
import OrgTabComponents from '../components/OrgTab';

const InfluencerListScreen = ({ navigation }) => {

    const { t } = useTranslation();

    const [loading, setLoading] = React.useState(false);
    const [lightColor, setLightColor] = React.useState("#cbf75e");
    const [darkColor, setDarkColor] = React.useState("#2BBB86");
    const [logoImage, setLogoImage] = React.useState("");
    const [dataFound, setDataFound] = React.useState("");

    const [searchTerm, setSearchTerm] = React.useState("");
    const [influenceList, setInfuencerList] = React.useState("");
    const [pageNumber, setPageNumber] = React.useState(1);

    const [afterSearch, setAfterSearch] = React.useState(false);

    const [totalPage, setTotalPage] = React.useState("");

    const [filterStatus, setFilterStatus] = React.useState("");
    const [isReset, setIsReset] = React.useState(false);

    const [memberType, setMemberType] = React.useState("");
    const [selectedORG, setSelectedORG] = React.useState("");

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            setLoading(true);
            setFilterStatus("");
            AsyncStorage.getItem('userToken').then(val => {
                if (val != null) {
                    setMemberType(JSON.parse(val).member_type);
                    if (JSON.parse(val).member_type == "CSO") {
                        AsyncStorage.getItem('selectedOrg').then(orgVal => {
                            console.log("orgVal:", orgVal)
                            if (orgVal != null) {
                                setSelectedORG(JSON.parse(orgVal));
                                getAllData(filterStatus, JSON.parse(orgVal));
                            } else {
                                setSelectedORG(JSON.parse(val).default_org_selection[0].id);
                                getAllData(filterStatus, JSON.parse(val).default_org_selection[0].id);
                            }
                        })
                    } else {
                        setSelectedORG(JSON.parse(val).org_id);
                        getAllData(filterStatus, JSON.parse(val).org_id);
                    }
                }
            })
        });
        return unsubscribe;
    }, []);

    const getAllData = (documentFilter, forORG) => {
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
                formdata.append("document_filter", documentFilter);
                formdata.append("defaultOrgSelection", forORG);
                console.log(formdata);
                fetch(`${BASE_URL}/get_cso_registered_influencer`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                    body: formdata
                })
                    .then((response) => response.json())
                    .then((responseJson) => {
                        console.log("Influencer:", responseJson);
                        if (responseJson.status == 'success') {
                            setLoading(false);
                            setInfuencerList(responseJson.members_list);
                            setAfterSearch(true);
                            setTotalPage(responseJson.total_pages);
                            setDataFound("found");
                        } else {
                            Toast.show({ description: responseJson.message });
                            setInfuencerList([]);
                            setTotalPage("");
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

    const onSearch = () => {
        Keyboard.dismiss();
        setLoading(true);
        setPageNumber(1);
        getAllData(filterStatus, JSON.parse(orgVal));
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
                formdata.append("document_filter", filterStatus);
                formdata.append("defaultOrgSelection", selectedORG);
                fetch(`${BASE_URL}/get_cso_registered_influencer`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                    body: formdata
                })
                    .then((response) => response.json())
                    .then((responseJson) => {
                        //console.log("Loadmore Influencer:", responseJson);
                        if (responseJson.members_list.length != 0) {
                            setLoading(false);
                            let newArrya = influenceList.concat(responseJson.members_list);
                            setInfuencerList(newArrya);
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
        setFilterStatus(dataVal);
        getAllData(dataVal, selectedORG);
    }

    const onCheck = (e) => {
        setLoading(true);
        getAllData(filterStatus, e);
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
                        <Text color="#111111" fontSize="16" textAlign="center" fontWeight="bold" textTransform="capitalize">{t("Influencer List")}</Text>
                        <Image source={logoImage ? { uri: logoImage } : require('../assets/images/logo.png')} style={{ width: 60, height: 25, resizeMode: 'contain' }} />
                    </HStack>
                </LinearGradient>
                <ImageBackground source={require('../assets/images/bg.jpg')} imageStyle={{ resizeMode: 'contain', position: 'absolute', bottom: 0, top: '65%', opacity: influenceList.length < 4 ? 0.6 : 0 }} style={styles.bgimage}>
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
                                <Box style={[styles.productbox, { paddingHorizontal: 8 }]}>
                                    <HStack alignItems="center" justifyContent="space-evenly">
                                        <LinearGradient
                                            colors={filterStatus == "" ? ["#555555", "#000000"] : ["#eeeeee", "#bbbbbb"]}
                                            start={{ x: 0.5, y: 0 }}
                                            style={[styles.custbtn, { width: '24%' }]}
                                        >
                                            <Button size="xs" variant="link" _text={{ color: filterStatus == "" ? "#ffffff" : "#111111", fontWeight: 'bold', fontSize: 12 }} onPress={() => onSetFilter("")}>{t("All")}</Button>
                                        </LinearGradient>
                                        <LinearGradient
                                            colors={filterStatus == "1" ? ["#555555", "#000000"] : ["#eeeeee", "#bbbbbb"]}
                                            start={{ x: 0.5, y: 0 }}
                                            style={[styles.custbtn, { width: '24%' }]}
                                        >
                                            <Button size="xs" variant="link" _text={{ color: filterStatus == "1" ? "#ffffff" : "#111111", fontWeight: 'bold', fontSize: 12 }} onPress={() => onSetFilter("1")}>{t("Aadhaar")}</Button>
                                        </LinearGradient>
                                        <LinearGradient
                                            colors={filterStatus == "2" ? ["#555555", "#000000"] : ["#eeeeee", "#bbbbbb"]}
                                            start={{ x: 0.5, y: 0 }}
                                            style={[styles.custbtn, { width: '24%' }]}
                                        >
                                            <Button size="xs" variant="link" _text={{ color: filterStatus == "2" ? "#ffffff" : "#111111", fontWeight: 'bold', fontSize: 12 }} onPress={() => onSetFilter("2")}>{t("Pan")}</Button>
                                        </LinearGradient>
                                        <LinearGradient
                                            colors={filterStatus == "3" ? ["#555555", "#000000"] : ["#eeeeee", "#bbbbbb"]}
                                            start={{ x: 0.5, y: 0 }}
                                            style={[styles.custbtn, { width: '24%' }]}
                                        >
                                            <Button size="xs" variant="link" _text={{ color: filterStatus == "3" ? "#ffffff" : "#111111", fontWeight: 'bold', fontSize: 12 }} onPress={() => onSetFilter("3")}>{t("Both")}</Button>
                                        </LinearGradient>
                                    </HStack>
                                    <HStack justifyContent="space-between" bg="#e6e6e6" style={{ padding: 10, marginTop: 15, borderRadius: 10, overflow: 'hidden' }}>
                                        <Stack style={{ width: '72%' }}>
                                            <View style={[styles.inputbox, { borderRadius: 7, marginVertical: 0, backgroundColor: '#ffffff' }]}>
                                                <Input style={{ height: 35 }} size="md" onChangeText={(text) => setSearchTerm(text)} variant="unstyled" InputLeftElement={<Icon name="search-outline" size={20} color="#666666" style={{ width: 25, marginLeft: 10, textAlign: 'center' }} />} placeholder={t("Member Id / Phone")} />
                                            </View>
                                        </Stack>
                                        <Button size="xs" isDisabled={searchTerm == ""} style={[styles.custbtn, { width: '25%', height: 35, backgroundColor: "#666666" }]} _text={{ color: "#ffffff", fontWeight: 'bold', fontSize: 12 }} onPress={() => onSearch()}>{t("Search")}</Button>
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
                                    {influenceList.map((item, index) =>
                                        <Box key={index} style={styles.productbox}>
                                            <HStack justifyContent="space-between" alignItems="center">
                                                <View style={{ width: '60%' }}>
                                                    <Text fontSize='md' fontWeight="bold" color="#111111">{item.contacts_name}</Text>
                                                    <Text fontSize='sm' fontWeight="bold" color="#666666">{t("Member ID")}: {item.id_extern01}</Text>
                                                    <Pressable onPress={() => { Linking.openURL(`tel:${item.phone_number}`) }} style={{ marginTop: 5 }}>
                                                        <HStack space={2}>
                                                            <Stack justifyContent="center" alignItems="center" style={{ backgroundColor: darkColor, width: 22, height: 22, borderRadius: 6 }}><Icon name="call" size={14} color="#ffffff" /></Stack>
                                                            <Text fontSize='sm' fontWeight="medium" color={darkColor}>{item.phone_number}</Text>
                                                        </HStack>
                                                    </Pressable>
                                                </View>
                                                <LinearGradient
                                                    colors={[lightColor, darkColor]}
                                                    start={{ x: 0.5, y: 0 }}
                                                    style={{ width: '36%', height: 38, borderRadius: 10, overflow: 'hidden' }}
                                                >
                                                    <Button size="xs" variant="link" onPress={() => navigation.navigate("UpdateKYC", { id: item.id })}>
                                                        <Text color="#111111" fontSize="sm" fontWeight="bold">{t("KYC Update")}</Text>
                                                    </Button>
                                                </LinearGradient>
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
    custbtn: { width: '100%', backgroundColor: '#111111', borderRadius: 12, overflow: 'hidden' },
    spincontainer: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0, 0, 0, 0.8)' },
});

export default InfluencerListScreen;
