import AsyncStorage from '@react-native-async-storage/async-storage';
import { Box, Button, HStack, Input, NativeBaseProvider, Pressable, ScrollView, Stack, Text, Toast, VStack } from 'native-base';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Image, StyleSheet, TouchableOpacity, StatusBar, View, ImageBackground, Keyboard, Linking } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import { API_KEY, BASE_URL, CONTACT_HIER_ID, ORG_ID, PROGRAM_ID } from '../auth_provider/Config';
import MonthPicker from 'react-native-month-year-picker';
import moment from 'moment';
import { useTranslation } from 'react-i18next';
import OrgTabComponents from '../components/OrgTab';

const PortfolioDetailsScreen = ({ navigation, route }) => {

    const { t } = useTranslation();

    const [loading, setLoading] = React.useState(false);
    const [lightColor, setLightColor] = React.useState("#cbf75e");
    const [darkColor, setDarkColor] = React.useState("#2BBB86");
    const [logoImage, setLogoImage] = React.useState("");

    const [searchTerm, setSearchTerm] = React.useState("");

    const [totalPage, setTotalPage] = React.useState("");

    const [dataList, setDataList] = React.useState([]);
    const [pageNumber, setPageNumber] = React.useState(1);
    const [pointFilter, setPointFilter] = React.useState(1);
    const [filterOn, setFilterOn] = React.useState("");

    const [date, setDate] = React.useState(new Date());
    const [monthYear, setMonthYear] = React.useState("");
    const [show, setShow] = React.useState(false);

    const [isReset, setIsReset] = React.useState(false);

    const [premiumBags, setPremiumBags] = React.useState(false);
    const [altContactId, setAltContactId] = React.useState([]);

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
                                getAllData(filterOn, pointFilter, JSON.parse(orgVal));
                            } else {
                                setSelectedORG(JSON.parse(val).default_org_selection[0].id);
                                getAllData(filterOn, pointFilter, JSON.parse(val).default_org_selection[0].id);
                            }
                        })
                    } else {
                        setSelectedORG(JSON.parse(val).org_id);
                        getAllData(filterOn, pointFilter, JSON.parse(val).org_id);
                    }
                }
            })
            if (route.params.optionType == 2 || route.params.optionType == 4) {
                setPremiumBags(true);
            }
        });
        return unsubscribe;
    }, []);

    const getAllData = (type, point, forORG) => {
        AsyncStorage.getItem('userToken').then(val => {
            if (val != null) {
                setLogoImage(JSON.parse(val).logo_url);

                setLightColor(JSON.parse(val).info.theme_color.light);
                setDarkColor(JSON.parse(val).info.theme_color.dark);

                let formdata = new FormData();
                formdata.append("APIkey", `${API_KEY}`);
                formdata.append("token", JSON.parse(val).token);
                formdata.append("orgId", JSON.parse(val).org_id);
                formdata.append("memberType", route.params.portTitle);
                formdata.append("type", route.params.portType);
                formdata.append("target_for", route.params.targetFor);
                formdata.append("filter", point);
                formdata.append("filterOn", type);
                formdata.append("searchText", searchTerm);
                formdata.append("monthYear", monthYear);
                formdata.append("page", 1);
                formdata.append("defaultOrgSelection", forORG);
                console.log(formdata);
                fetch(`${BASE_URL}/get_bde_dashboard_member_type_details`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                    body: formdata
                })
                    .then((response) => response.json())
                    .then((responseJson) => {
                        console.log("Dashboard Member Details:", responseJson);
                        if (responseJson.status == 'success') {
                            setLoading(false);
                            setDataList(responseJson.active_base_member_details);
                            setTotalPage(responseJson.total_pages);
                            setAltContactId(responseJson.has_duplicate_account);
                        } else {
                            Toast.show({ description: responseJson.message });
                            setDataList([]);
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
                        console.log("Dashboard Member Details Error:", error);
                        Toast.show({ description: t("Sorry! Somthing went Wrong. Maybe Network request Failed") });
                    });
            } else {
                setLoading(false);
                AsyncStorage.clear();
                navigation.navigate('Login');
            }
        });
    };

    const loadMore = () => {
        let num = pageNumber + 1;
        setLoading(true);
        AsyncStorage.getItem('userToken').then(val => {
            if (val != null) {
                let formdata = new FormData();
                formdata.append("APIkey", `${API_KEY}`);
                formdata.append("token", JSON.parse(val).token);
                formdata.append("orgId", JSON.parse(val).org_id);
                formdata.append("memberType", route.params.portTitle);
                formdata.append("type", route.params.portType);
                formdata.append("filter", pointFilter);
                formdata.append("filterOn", filterOn);
                formdata.append("searchText", searchTerm);
                formdata.append("monthYear", monthYear);
                formdata.append("page", num);
                formdata.append("defaultOrgSelection", selectedORG);
                fetch(`${BASE_URL}/get_bde_dashboard_member_type_details`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                    body: formdata
                })
                    .then((response) => response.json())
                    .then((responseJson) => {
                        //console.log("Loadmore Member Details:", responseJson);
                        if (responseJson.active_base_member_details.length != 0) {
                            setLoading(false);
                            setPageNumber(num);
                            setTotalPage(responseJson.total_pages);
                            setAltContactId(responseJson.has_duplicate_account);
                            let newArrya = dataList.concat(responseJson.active_base_member_details);
                            setDataList(newArrya);
                        } else {
                            setLoading(false);
                            setPageNumber(1);
                            setTotalPage("");
                        }
                    })
                    .catch((error) => {
                        setLoading(false);
                        //console.log("Loadmore Member Details Error:", error);
                        Toast.show({ description: t("Sorry! Somthing went Wrong. Maybe Network request Failed") });
                    });
            } else {
                setLoading(false);
                AsyncStorage.clear();
                navigation.navigate('Login');
            }
        });
    };

    const showPicker = useCallback((value) => { setLoading(true); setShow(value) }, []);

    const onDateChange = useCallback(
        (event, newDate) => {
            showPicker(false);
            if (event == "dateSetAction") {
                setDate(newDate);
                setMonthYear(moment(newDate).format('YYYY-MM'));
                setLoading(false);
            } else {
                setLoading(false);
            }
        },
        [date, showPicker],
    );

    const onSearch = () => {
        Keyboard.dismiss();
        if (monthYear == "" && searchTerm.trim() == "") {
            Toast.show({ description: t("Please select Month-Year or enter Search Value") });
        } else {
            setLoading(true);
            setIsReset(true);
            getAllData(filterOn, pointFilter, selectedORG);
        }
    };

    const onReset = useCallback(() => {
        setIsReset(false);
        setPointFilter(1);
        setLoading(true);
        setPageNumber(1);
        setDate(new Date());
        setMonthYear("");
        setSearchTerm("");
        setTimeout(function () {
            getAllData(filterOn, pointFilter, selectedORG);
        }, 1000);
    }, [],
    );

    const onFilter = (type, point) => {
        setLoading(true);
        setPageNumber(1);
        setFilterOn(type);
        if (point == 1) {
            setPointFilter(2);
            getAllData(type, 2, selectedORG);
        } else {
            setPointFilter(1);
            getAllData(type, 1, selectedORG);
        }
    };

    const onCheck = (e) => {
        setLoading(true);
        getAllData(filterOn, pointFilter, e);
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
                        <Text color="#111111" fontSize="16" textAlign="center" fontWeight="bold" textTransform="capitalize">{route.params.portTitle} {t("Details")}</Text>
                        <Image source={logoImage ? { uri: logoImage } : require('../assets/images/logo.png')} style={{ width: 60, height: 25, resizeMode: 'contain' }} />
                    </HStack>
                </LinearGradient>
                <ImageBackground source={require('../assets/images/bg.jpg')} imageStyle={{ resizeMode: 'contain', position: 'absolute', bottom: 0, top: '65%', opacity: dataList.length < 2 ? 0.6 : 0 }} style={styles.bgimage}>
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
                                <Stack justifyContent="space-between">
                                    <Pressable style={styles.inputbox} onPress={() => showPicker(true)}>
                                        <HStack paddingY={Platform.OS == "ios" ? "1.5" : "2.5"}>
                                            <Icon name="calendar-outline" size={20} color="#666666" style={{ width: 25, marginLeft: 10, marginRight: 10, textAlign: 'center' }} />
                                            <Text color={monthYear != "" ? "#111111" : "#999999"} fontSize="md">{monthYear != "" ? moment(monthYear).format('MMMM, YYYY') : t("Month - Year (Enrollment Month)")}</Text>
                                        </HStack>
                                    </Pressable>
                                    <View style={styles.inputbox}>
                                        <Input size="lg" value={searchTerm} onChangeText={(text) => setSearchTerm(text)} variant="unstyled" InputLeftElement={<Icon name="search-outline" size={20} color="#666666" style={{ width: 25, marginLeft: 10, textAlign: 'center' }} />} placeholder={t("ID/Phone/Dealer")} />
                                    </View>
                                </Stack>
                                <HStack justifyContent="center" space={2}>
                                    {isReset && (
                                        <Button size="xs" style={[styles.custbtn, { width: '48%', marginVertical: 7, backgroundColor: "#777777" }]} onPress={() => onReset()}>
                                            <Text color="#ffffff" fontSize="md" fontWeight="medium">{t("Reset")}</Text>
                                        </Button>
                                    )}
                                    <LinearGradient
                                        colors={[lightColor, darkColor]}
                                        start={{ x: 0.5, y: 0 }}
                                        style={[styles.custbtn, { width: isReset ? '48%' : '100%', marginVertical: 7 }]}
                                    >
                                        <Button variant="link" size="xs" onPress={() => onSearch()}>
                                            <Text color="#111111" fontSize="md" fontWeight="medium">{t("Search")}</Text>
                                        </Button>
                                    </LinearGradient>
                                </HStack>
                            </Box>
                            {dataList.length == 0 ?
                                <Stack space={5} style={[styles.productbox, { height: 350, justifyContent: 'center', alignItems: 'center', padding: 30 }]}>
                                    <Icon name="hourglass-outline" size={80} color="#999999" />
                                    <Text fontSize='lg' fontWeight="bold" textAlign="center" color="#111111">{t("Result Not Found")}</Text>
                                    <Text fontSize='sm' fontWeight="medium" textAlign="center" color="#666666">{t("Whoops... This Information is not available for a moment")}</Text>
                                </Stack>
                                :
                                <Box style={styles.productbox}>
                                    <ScrollView horizontal={true} nestedScrollEnabled={true}>
                                        <HStack>
                                            <VStack bg="#eeeeee" borderColor="#dddddd" borderWidth="1" justifyContent="center" alignItems="center">
                                                <Stack padding="2" height="45" borderColor="#dddddd" borderWidth="1" width="100%" justifyContent="center" alignItems="center">
                                                    <Text fontSize='xs' fontWeight="bold" color="#000000">{t("Vriddhi ID")}</Text>
                                                </Stack>
                                                {dataList.map((item, index) =>
                                                    <VStack key={index} padding="2" width="100%" bg="#ffffff" borderColor="#dddddd" borderWidth="1" justifyContent="center" alignItems="center">
                                                        <Pressable onPress={() => navigation.navigate("MemberListOption", { id: item.id, forCopy: item.able_to_copy, contactId: altContactId })}><Text fontSize='xs' fontWeight="bold" color={darkColor} textAlign="center">{item.id_extern01}</Text></Pressable>
                                                    </VStack>
                                                )}
                                            </VStack>
                                            <VStack bg="#eeeeee" borderColor="#dddddd" borderWidth="1" justifyContent="center" alignItems="center">
                                                <Stack padding="2" height="45" borderColor="#dddddd" borderWidth="1" width="100%" justifyContent="center" alignItems="center">
                                                    <Text fontSize='xs' fontWeight="bold" color="#000000">{t("Name")}</Text>
                                                </Stack>
                                                {dataList.map((item, index) =>
                                                    <VStack key={index} padding="2" width="100%" bg="#ffffff" borderColor="#dddddd" borderWidth="1" justifyContent="center" alignItems="center">
                                                        <Text fontSize='xs' fontWeight="bold" color="#666666" textAlign="center">{item.contacts_name}</Text>
                                                    </VStack>
                                                )}
                                            </VStack>
                                            <VStack bg="#eeeeee" borderColor="#dddddd" borderWidth="1" justifyContent="center" alignItems="center">
                                                <Stack padding="2" height="45" borderColor="#dddddd" borderWidth="1" width="100%" justifyContent="center" alignItems="center">
                                                    <Text fontSize='xs' fontWeight="bold" color="#000000">{t("Phone")}</Text>
                                                </Stack>
                                                {dataList.map((item, index) =>
                                                    <VStack key={index} padding="2" width="100%" bg="#ffffff" borderColor="#dddddd" borderWidth="1" justifyContent="center" alignItems="center">
                                                        <Pressable onPress={() => { Linking.openURL(`tel:${item.phone_number}`) }}><Text fontSize='xs' fontWeight="bold" color={darkColor} textAlign="center">{item.phone_number}</Text></Pressable>
                                                    </VStack>
                                                )}
                                            </VStack>
                                            <VStack bg="#eeeeee" borderColor="#dddddd" borderWidth="1" justifyContent="center" alignItems="center">
                                                <TouchableOpacity onPress={() => onFilter("available_point", pointFilter)}>
                                                    <HStack padding="2" height="45" space={2} borderColor="#dddddd" borderWidth="1" justifyContent="center" alignItems="center">
                                                        <Text fontSize='xs' fontWeight="bold" color="#000000">{t("Available Points")}</Text>
                                                        <VStack>
                                                            <Icon name="caret-up-outline" size={14} color="#111111" />
                                                            <Icon name="caret-down-outline" size={14} color="#111111" />
                                                        </VStack>
                                                    </HStack>
                                                </TouchableOpacity>
                                                {dataList.map((item, index) =>
                                                    <VStack key={index} padding="2" width="100%" bg="#ffffff" borderColor="#dddddd" borderWidth="1" justifyContent="center" alignItems="center">
                                                        <Text fontSize='xs' fontWeight="bold" color="#666666" textAlign="center">{item.available_point}</Text>
                                                    </VStack>
                                                )}
                                            </VStack>
                                            {route.params.optionType == 3 && (
                                                <VStack bg="#eeeeee" borderColor="#dddddd" borderWidth="1" justifyContent="center" alignItems="center">
                                                    <TouchableOpacity onPress={() => onFilter("total_redeemed", pointFilter)}>
                                                        <HStack padding="2" height="45" space={2} borderColor="#dddddd" borderWidth="1" justifyContent="center" alignItems="center">
                                                            <Text fontSize='xs' fontWeight="bold" color="#000000">{t("Redeemed Points")}</Text>
                                                            <VStack>
                                                                <Icon name="caret-up-outline" size={14} color="#111111" />
                                                                <Icon name="caret-down-outline" size={14} color="#111111" />
                                                            </VStack>
                                                        </HStack>
                                                    </TouchableOpacity>
                                                    {dataList.map((item, index) =>
                                                        <VStack key={index} padding="2" width="100%" bg="#ffffff" borderColor="#dddddd" borderWidth="1" justifyContent="center" alignItems="center">
                                                            <Text fontSize='xs' fontWeight="bold" color="#666666" textAlign="center">{item.total_redeemed}</Text>
                                                        </VStack>
                                                    )}
                                                </VStack>
                                            )}
                                            <VStack bg="#eeeeee" borderColor="#dddddd" borderWidth="1" justifyContent="center" alignItems="center">
                                                <Stack padding="2" height="45" borderColor="#dddddd" borderWidth="1" width="100%" justifyContent="center" alignItems="center">
                                                    <Text fontSize='xs' fontWeight="bold" color="#000000">{t("Dealer Code")}</Text>
                                                </Stack>
                                                {dataList.map((item, index) =>
                                                    <VStack key={index} padding="2" width="100%" bg="#ffffff" borderColor="#dddddd" borderWidth="1" justifyContent="center" alignItems="center">
                                                        <Text fontSize='xs' fontWeight="bold" color="#666666" textAlign="center">{item.dealer_code}</Text>
                                                    </VStack>
                                                )}
                                            </VStack>
                                            <VStack bg="#eeeeee" borderColor="#dddddd" borderWidth="1" justifyContent="center" alignItems="center">
                                                <Stack padding="2" height="45" borderColor="#dddddd" borderWidth="1" width="100%" justifyContent="center" alignItems="center">
                                                    <Text fontSize='xs' fontWeight="bold" color="#000000">{t("Dealer Firm")}</Text>
                                                </Stack>
                                                {dataList.map((item, index) =>
                                                    <VStack key={index} padding="2" width="100%" bg="#ffffff" borderColor="#dddddd" borderWidth="1" justifyContent="center" alignItems="center">
                                                        <Text fontSize='xs' fontWeight="bold" color="#666666" textAlign="center">{item.firm_name}</Text>
                                                    </VStack>
                                                )}
                                            </VStack>
                                            <HStack>
                                                {premiumBags && (
                                                    <VStack bg="#eeeeee" borderColor="#dddddd" borderWidth="1" justifyContent="center" alignItems="center">
                                                        <TouchableOpacity onPress={() => onFilter("premium_total_sale", pointFilter)}>
                                                            <HStack padding="2" height="45" space={2} borderColor="#dddddd" borderWidth="1" justifyContent="center" alignItems="center">
                                                                <Text fontSize='xs' fontWeight="bold" color="#000000">{t("Premium (Bags)")}</Text>
                                                                <VStack>
                                                                    <Icon name="caret-up-outline" size={14} color="#111111" />
                                                                    <Icon name="caret-down-outline" size={14} color="#111111" />
                                                                </VStack>
                                                            </HStack>
                                                        </TouchableOpacity>
                                                        {dataList.map((item, index) =>
                                                            <VStack key={index} padding="2" width="100%" bg="#ffffff" borderColor="#dddddd" borderWidth="1" justifyContent="center" alignItems="center">
                                                                <Text fontSize='xs' fontWeight="bold" color="#666666" textAlign="center">{item.premium_total_sale}</Text>
                                                            </VStack>
                                                        )}
                                                    </VStack>
                                                )}
                                                {route.params.optionType == 2 && (
                                                    <VStack bg="#eeeeee" borderColor="#dddddd" borderWidth="1" justifyContent="center" alignItems="center">
                                                        <TouchableOpacity onPress={() => onFilter("total_value", pointFilter)}>
                                                            <HStack padding="2" height="45" space={2} borderColor="#dddddd" borderWidth="1" justifyContent="center" alignItems="center">
                                                                <Text fontSize='xs' fontWeight="bold" color="#000000">{t("Total (Bags)")}</Text>
                                                                <VStack>
                                                                    <Icon name="caret-up-outline" size={14} color="#111111" />
                                                                    <Icon name="caret-down-outline" size={14} color="#111111" />
                                                                </VStack>
                                                            </HStack>
                                                        </TouchableOpacity>
                                                        {dataList.map((item, index) =>
                                                            <VStack key={index} padding="2" width="100%" bg="#ffffff" borderColor="#dddddd" borderWidth="1" justifyContent="center" alignItems="center">
                                                                <Text fontSize='xs' fontWeight="bold" color="#666666" textAlign="center">{item.total_value}</Text>
                                                            </VStack>
                                                        )}
                                                    </VStack>
                                                )}
                                            </HStack>
                                        </HStack>
                                    </ScrollView>
                                    {pageNumber != totalPage && (
                                        <HStack paddingY="3" paddingX="6" justifyContent="center">
                                            <Button variant="outline" size={'xs'} rounded={30} onPress={() => loadMore()}>
                                                <Text color="#bbbbbb">{t("Load More")}</Text>
                                            </Button>
                                        </HStack>
                                    )}
                                </Box>
                            }
                        </Box>
                    </ScrollView>
                </ImageBackground>
            </Box>
            {loading && (
                <View style={styles.spincontainer}>
                    <ActivityIndicator animating={loading} size="large" color={darkColor} />
                </View>
            )}
            {show && (
                <MonthPicker
                    onChange={onDateChange}
                    value={date}
                    maximumDate={new Date()}
                />
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

export default PortfolioDetailsScreen;
