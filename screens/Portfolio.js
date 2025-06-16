import AsyncStorage from '@react-native-async-storage/async-storage';
import { Box, HStack, NativeBaseProvider, ScrollView, Select, Stack, Text, Toast, VStack } from 'native-base';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, StyleSheet, TouchableOpacity, StatusBar, View, ImageBackground } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import { API_KEY, BASE_URL, CONTACT_HIER_ID, ORG_ID, PROGRAM_ID } from '../auth_provider/Config';
import { useTranslation } from 'react-i18next';
import OrgTabComponents from '../components/OrgTab';

const PortfolioScreen = ({ navigation, route }) => {

    const { t } = useTranslation();

    const [loading, setLoading] = React.useState(false);
    const [lightColor, setLightColor] = React.useState("#cbf75e");
    const [darkColor, setDarkColor] = React.useState("#2BBB86");
    const [logoImage, setLogoImage] = React.useState("");
    const [dataFound, setDataFound] = React.useState("");

    const [dataList, setDataList] = React.useState([]);

    const [monthYear, setMonthYear] = useState("");
    const [windowList, setWindowList] = React.useState([]);

    const [FYList, setFYList] = React.useState([]);
    const [selectedYear, setSelectedYear] = React.useState("");

    const [memberType, setMemberType] = React.useState("");
    const [selectedORG, setSelectedORG] = React.useState("");

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            setLoading(true);
            if (route.params.pageType == 3) {
                getFinancialYear();
            } else {
                getWindowMonth();
            }
        });
        return unsubscribe;
    }, []);

    const getWindowMonth = () => {
        AsyncStorage.getItem('userToken').then(val => {
            if (val != null) {
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

    const getFinancialYear = () => {
        AsyncStorage.getItem('userToken').then(val => {
            if (val != null) {
                let formdata = new FormData();
                formdata.append("APIkey", `${API_KEY}`);
                formdata.append("token", JSON.parse(val).token);
                formdata.append("orgId", JSON.parse(val).org_id);
                fetch(`${BASE_URL}/get_financial_year`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                    body: formdata
                })
                    .then((response) => response.json())
                    .then((responseJson) => {
                        //console.log("Financial:", responseJson);
                        if (responseJson.status == 'success') {
                            setFYList(responseJson.financial_year);
                            setSelectedYear(responseJson.financial_year[0].fyear);
                            getAllData(responseJson.financial_year[0].fyear, selectedORG);
                        } else {
                            Toast.show({ description: responseJson.message });
                            setFYList([]);
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
                        //console.log("Financial Error:", error);
                        Toast.show({ description: t("Sorry! Somthing went Wrong. Maybe Network request Failed") });
                    });
            } else {
                setLoading(false);
                AsyncStorage.clear();
                navigation.navigate('Login');
            }
        });
    }

    const getAllData = (valData, forORG) => {
        AsyncStorage.getItem('userToken').then(val => {
            if (val != null) {
                setLogoImage(JSON.parse(val).logo_url);

                setLightColor(JSON.parse(val).info.theme_color.light);
                setDarkColor(JSON.parse(val).info.theme_color.dark);

                let formdata = new FormData();
                formdata.append("APIkey", `${API_KEY}`);
                formdata.append("token", JSON.parse(val).token);
                formdata.append("orgId", JSON.parse(val).org_id);
                formdata.append("target_for", valData);
                formdata.append("type", route.params.pageType);
                formdata.append("defaultOrgSelection", forORG);
                fetch(`${BASE_URL}/get_bde_dashboard_member_count`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                    body: formdata
                })
                    .then((response) => response.json())
                    .then((responseJson) => {
                        console.log("Dashboard Member:", responseJson);
                        if (responseJson.status == 'success') {
                            setLoading(false);
                            setDataList(responseJson.active_member_details);
                            if (responseJson.active_member_details.length != 0) {
                                setDataFound("found");
                            } else {
                                setDataFound("notfound");
                            }
                        } else {
                            Toast.show({ description: responseJson.message });
                            setDataList([]);
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
                        //console.log("Dashboard Member Error:", error);
                        Toast.show({ description: t("Sorry! Somthing went Wrong. Maybe Network request Failed") });
                    });
            } else {
                setLoading(false);
                AsyncStorage.clear();
                navigation.navigate('Login');
            }
        });
    }

    const onSelectWindow = (data) => {
        setMonthYear(data);
        setLoading(true);
        getAllData(data);
    }
    const onSelectYear = (val) => {
        setSelectedYear(val);
        setLoading(true);
        getAllData(val);
    }

    const goNext = (name, type) => {
        if (name != "undefined") {
            if (route.params.pageType == 3) {
                navigation.navigate("PortfolioDetails", { portTitle: name, portType: type, optionType: route.params.pageType, targetFor: selectedYear })
            } else {
                navigation.navigate("PortfolioDetails", { portTitle: name, portType: type, optionType: route.params.pageType, targetFor: monthYear })
            }
        }
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
                        <Text color="#111111" fontSize="16" textAlign="center" fontWeight="bold" textTransform="capitalize">{route.params.pageTitle}</Text>
                        <Image source={logoImage ? { uri: logoImage } : require('../assets/images/logo.png')} style={{ width: 60, height: 25, resizeMode: 'contain' }} />
                    </HStack>
                </LinearGradient>
                <ImageBackground source={require('../assets/images/bg.jpg')} imageStyle={{ resizeMode: 'contain', position: 'absolute', bottom: 0, top: '65%', opacity: 0.6 }} style={styles.bgimage}>
                    <ScrollView>
                        <LinearGradient
                            colors={[lightColor, darkColor]}
                            style={{ height: 120, position: 'absolute', top: 0, width: '100%', borderBottomEndRadius: 100, borderBottomStartRadius: 100, overflow: 'hidden' }}
                            start={{ x: 0.5, y: 0 }}
                        ></LinearGradient>
                        {memberType == "CSO" && (
                            <OrgTabComponents clickBtn={onCheck} navigation={navigation} component={selectedORG} />
                        )}
                        <Box paddingY="3" paddingX="6" mt="5">
                            {route.params.pageType == 3 && (
                                <Box style={styles.productbox}>
                                    <Stack mb="4" pb="3" borderBottomWidth={1} borderColor="#bbbbbb">
                                        <Text color="#000000" fontSize="14" fontWeight="medium" textAlign="center">{t("Financial Year")}</Text>
                                    </Stack>
                                    <HStack justifyContent="space-between" bg="#444444" style={{ padding: 10, borderRadius: 14, overflow: 'hidden' }}>
                                        <View style={[styles.inputbox, { borderRadius: 7, marginVertical: 0, backgroundColor: '#ffffff' }]}>
                                            <Select variant="underlined" size="md" placeholder={t("Select Year")}
                                                selectedValue={selectedYear}
                                                onValueChange={value => onSelectYear(value)}
                                                style={{ paddingLeft: 15, height: 35 }}
                                                _selectedItem={{
                                                    backgroundColor: '#eeeeee',
                                                    endIcon: <Icon name="checkmark-circle" size={22} color="#2BBB86" style={{ right: 0, position: 'absolute' }} />
                                                }}>
                                                {FYList.map((item, index) =>
                                                    <Select.Item key={index} label={"FY " + item.fyear} value={item.fyear} />
                                                )}
                                            </Select>
                                        </View>
                                    </HStack>
                                </Box>
                            )}
                            {route.params.pageType == 2 && (
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
                            )}

                            {dataFound == "notfound" && (
                                <Stack space={5} style={[styles.productbox, { height: 350, justifyContent: 'center', alignItems: 'center', padding: 30 }]}>
                                    <Icon name="hourglass-outline" size={80} color="#999999" />
                                    <Text fontSize='lg' fontWeight="bold" textAlign="center" color="#111111">{t("Result Not Found")}</Text>
                                    <Text fontSize='sm' fontWeight="medium" textAlign="center" color="#666666">{t("Whoops... This Information is not available for a moment")}</Text>
                                </Stack>
                            )}
                            {dataFound == "found" && (
                                <LinearGradient
                                    colors={['#ffffff', '#eeeeee']}
                                    style={styles.productbox}
                                    start={{ x: 0.5, y: 0 }}
                                >
                                    <HStack justifyContent="center" alignItems="center" flexWrap="wrap">
                                        {dataList.map((item, index) =>
                                            <LinearGradient
                                                colors={[lightColor, '#eeeeee']}
                                                start={{ x: 0.5, y: 0 }}
                                                style={styles.dashElement}
                                                key={index}
                                            >
                                                <TouchableOpacity onPress={() => goNext(item.name, item.type)}>
                                                    <VStack justifyContent="center" alignItems="center">
                                                        <Stack style={{ backgroundColor: '#111111', borderRadius: 10, minWidth: 80, height: 50, position: 'relative', zIndex: 9, paddingHorizontal: 5 }}>
                                                            <Text color="#ffffff" fontSize="18" lineHeight="50" textAlign="center" fontWeight="bold">{item.count}</Text>
                                                        </Stack>
                                                        <VStack style={styles.dashInner} justifyContent="center" alignItems="center">
                                                            <Text color="#111111" fontSize="14" textAlign="center" fontWeight="bold" textTransform="capitalize">{item.name}</Text>
                                                        </VStack>
                                                    </VStack>
                                                </TouchableOpacity>
                                            </LinearGradient>
                                        )}
                                    </HStack>
                                </LinearGradient>
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
    dashElement: { width: '44%', margin: '3%', padding: 8, paddingTop: 7, borderRadius: 12, overflow: 'hidden' },
    dashInner: { marginTop: -12, padding: 5, paddingTop: 15, width: '100%', height: 80, borderRadius: 10, backgroundColor: '#ffffff', overflow: 'hidden' },
    productbox: { borderRadius: 15, width: '100%', backgroundColor: '#ffffff', marginBottom: 20, padding: 20, borderColor: '#ffffff', borderWidth: 2, elevation: 10, shadowColor: '#666666', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.4, shadowRadius: 10, overflow: 'hidden' },
    inputbox: { backgroundColor: 'rgba(0,0,0,0.06)', borderRadius: 10, width: '100%', overflow: 'hidden', marginVertical: 7 },
    custbtn: { width: '100%', backgroundColor: '#111111', borderRadius: 8, overflow: 'hidden' },
    optionbtn: { backgroundColor: 'none', width: '46%', borderRadius: 8, overflow: 'hidden' },
    spincontainer: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0, 0, 0, 0.8)' },
});

export default PortfolioScreen;
