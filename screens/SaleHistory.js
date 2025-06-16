import AsyncStorage from '@react-native-async-storage/async-storage';
import { Box, Button, HStack, NativeBaseProvider, ScrollView, Select, Stack, Text, Toast, VStack } from 'native-base';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, StyleSheet, TouchableOpacity, StatusBar, View, ImageBackground } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import { API_KEY, BASE_URL, CONTACT_HIER_ID, ORG_ID, PROGRAM_ID } from '../auth_provider/Config';
import moment from 'moment';
import { useTranslation } from 'react-i18next';

const SaleHistoryScreen = ({ navigation }) => {

    const { t } = useTranslation();

    const [loading, setLoading] = React.useState(false);
    const [lightColor, setLightColor] = React.useState("#cbf75e");
    const [darkColor, setDarkColor] = React.useState("#2BBB86");
    const [logoImage, setLogoImage] = React.useState("");
    const [dataFound, setDataFound] = React.useState("");

    const [saleList, setSaleList] = React.useState([]);
    const [FYList, setFYList] = React.useState([]);
    const [selectedYear, setSelectedYear] = React.useState(moment(new Date()).format("YYYY"));

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            setLoading(true);
            getAllData(selectedYear);
        });
        return unsubscribe;
    }, []);

    const getAllData = (filterYear) => {
        AsyncStorage.getItem('userToken').then(val => {
            if (val != null) {
                setLogoImage(JSON.parse(val).logo_url);

                setLightColor(JSON.parse(val).info.theme_color.light);
                setDarkColor(JSON.parse(val).info.theme_color.dark);

                let formdata = new FormData();
                formdata.append("APIkey", `${API_KEY}`);
                formdata.append("token", JSON.parse(val).token);
                formdata.append("orgId", JSON.parse(val).org_id);
                formdata.append("financial_year", filterYear);
                fetch(`${BASE_URL}/get_nuvoco_sales`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                    body: formdata
                })
                    .then((response) => response.json())
                    .then((responseJson) => {
                        console.log("History:", responseJson);
                        if (responseJson.status == 'success') {
                            setLoading(false);
                            setSelectedYear(responseJson.defaultFinancialYear.toString());
                            setFYList(responseJson.financialYears);
                            setSaleList(responseJson.sales);
                            setDataFound("found");
                        } else {
                            Toast.show({ description: responseJson.message });
                            setSelectedYear(responseJson.defaultFinancialYear.toString());
                            setFYList(responseJson.financialYears);
                            setDataFound("notfound");
                            setSaleList([]);
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
                        //console.log("History Error:", error);
                        Toast.show({ description: t("Sorry! Somthing went Wrong. Maybe Network request Failed") });
                    });
            } else {
                setLoading(false);
                AsyncStorage.clear();
                navigation.navigate('Login');
            }
        });
    }

    const onSelectYear = (val) => {
        setSelectedYear(val);
        setLoading(true);
        getAllData(val);
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
                        <Text color="#111111" fontSize="16" textAlign="center" fontWeight="bold" textTransform="capitalize">{t("Approved Liftings")}</Text>
                        <Image source={logoImage ? { uri: logoImage } : require('../assets/images/logo.png')} style={{ width: 60, height: 25, resizeMode: 'contain' }} />
                    </HStack>
                </LinearGradient>
                <ImageBackground source={require('../assets/images/bg.jpg')} imageStyle={{ resizeMode: 'contain', position: 'absolute', bottom: 0, top: '65%', opacity: saleList.length < 4 ? 0.6 : 0 }} style={styles.bgimage}>
                    <ScrollView>
                        <LinearGradient
                            colors={[lightColor, darkColor]}
                            style={{ height: 110, position: 'absolute', top: 0, width: '100%', borderBottomEndRadius: 100, borderBottomStartRadius: 100, overflow: 'hidden' }}
                            start={{ x: 0.5, y: 0 }}
                        ></LinearGradient>

                        <Box padding="5">
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
                                                <Select.Item key={index} label={item.f_year} value={item.year_val} />
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
                                    {saleList.map((item, index) =>
                                        <Box key={index} style={[styles.productbox, { padding: 0 }]}>
                                            <LinearGradient
                                                colors={item.approval_text == "" ? [lightColor, darkColor] : ["#eeeeee", "#aaaaaa"]}
                                                start={{ x: 0.5, y: 0 }}
                                                style={{ paddingVertical: 8, paddingHorizontal: 12 }}
                                            >
                                                <HStack justifyContent="center" alignItems="center" space={2}>
                                                    <Icon name="calendar-outline" size={18} color="#111111" />
                                                    <Text color="#111111" fontSize="13" textAlign="center" fontWeight="bold" textTransform="uppercase">{item.month_name}</Text>
                                                    {item.approval_text != "" && (
                                                        <Text color="#f04e23" fontWeight="bold" fontSize="12" textAlign="center">({item.approval_text})</Text>
                                                    )}
                                                </HStack>
                                            </LinearGradient>
                                            <VStack padding="3">
                                                <Box borderWidth="1" borderColor="#cccccc" backgroundColor="#dddddd" borderStyle="solid" overflow="hidden">
                                                    <HStack paddingY="1" paddingX="3" borderColor="#dddddd" borderBottomWidth="1" justifyContent="space-between" alignItems="center">
                                                        <Text fontSize='xs' fontWeight="bold" color="#555555">{t("Product Name")}</Text>
                                                        <Text fontSize='xs' fontWeight="bold" color="#555555">{t("Quantity")}</Text>
                                                    </HStack>
                                                </Box>
                                                {item.sale_details.map((subitem, subindex) =>
                                                    <Box key={subindex} borderWidth="1" borderColor="#cccccc" borderStyle="solid" overflow="hidden">
                                                        <HStack paddingY="1" paddingX="3" borderColor="#dddddd" borderBottomWidth="1" justifyContent="space-between" alignItems="center">
                                                            <Text fontSize='xs' fontWeight="bold" color="#111111">{subitem.product_name}</Text>
                                                            <Text fontSize='xs' fontWeight="bold" color="#111111">{subitem.tonnage}</Text>
                                                        </HStack>
                                                    </Box>
                                                )}
                                            </VStack>
                                            <LinearGradient
                                                colors={item.approval_text == "" ? [lightColor, darkColor] : ["#aaaaaa", "#eeeeee"]}
                                                start={{ x: 0.5, y: 0 }}
                                                style={{ paddingVertical: 8, paddingHorizontal: 12 }}
                                            >
                                                <HStack justifyContent="space-between" alignItems="center" space={2}>
                                                    <Text color="#111111" fontSize="13" textAlign="center" fontWeight="bold">{t("Total")}:</Text>
                                                    <Text color="#111111" fontSize="13" textAlign="center" fontWeight="bold">{item.monthly_grand_total}</Text>
                                                </HStack>
                                            </LinearGradient>
                                        </Box>
                                    )}
                                </VStack>
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

export default SaleHistoryScreen;
