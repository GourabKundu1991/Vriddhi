import AsyncStorage from '@react-native-async-storage/async-storage';
import { Box, HStack, NativeBaseProvider, Text, VStack, Toast, Button, Stack, Menu, Select, Pressable, Input } from 'native-base';
import React, { useCallback, useEffect, useState } from 'react';
import Icon from 'react-native-vector-icons/Ionicons';
import { ActivityIndicator, Image, ScrollView, StatusBar, StyleSheet, TouchableOpacity, View, ImageBackground, Linking, Alert } from 'react-native';
import { API_KEY, BASE_URL, CONTACT_HIER_ID, ORG_ID, PROGRAM_ID } from '../auth_provider/Config';
import LinearGradient from 'react-native-linear-gradient';
import MonthPicker from 'react-native-month-year-picker';
import moment from 'moment';
import { useTranslation } from 'react-i18next';
import OrgTabComponents from '../components/OrgTab';

const PendingApprovalScreen = ({ navigation, route }) => {

    const { t } = useTranslation();

    const [loading, setLoading] = React.useState(false);
    const [lightColor, setLightColor] = React.useState("#cbf75e");
    const [darkColor, setDarkColor] = React.useState("#2BBB86");
    const [logoImage, setLogoImage] = React.useState("");
    const [cameraColor, setCameraColor] = React.useState("#f04e23");
    const [dataFound, setDataFound] = React.useState("");

    const [allLeads, setAllLeads] = React.useState([]);

    const [pop, setPop] = React.useState(false);
    const [leadId, setLeadId] = React.useState("");

    const [otp, setOtp] = React.useState('');

    const [contactId, setContactId] = React.useState('');

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
                fetch(`${BASE_URL}/get_default_info`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                    body: formdata
                })
                    .then((response) => response.json())
                    .then((responseJson) => {
                        console.log("Default Info:", responseJson);
                        if (responseJson.status == 'success') {
                            formdata.append("has_duplicate_account", responseJson.has_duplicate_account);
                            formdata.append("defaultOrgSelection", forORG);
                            fetch(`${BASE_URL}/officer_contractor_approval`, {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'multipart/form-data',
                                },
                                body: formdata
                            })
                                .then((response) => response.json())
                                .then((responseJsonData) => {
                                    console.log("officer_contractor_approval:", responseJsonData);
                                    if (responseJsonData.status == 'success') {
                                        setLoading(false);
                                        setAllLeads(responseJsonData.data);
                                        if (responseJsonData.pending_lead_count == 0) {
                                            setFilterStatus("All");
                                        }
                                        setDataFound("found");
                                    } else {
                                        Toast.show({ description: responseJsonData.message });
                                        setAllLeads([]);
                                        setDataFound("notfound");
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
                                    //console.log("officer_contractor_approval Error:", error);
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
                        //console.log("Default Info Error:", error);
                        Toast.show({ description: t("Sorry! Somthing went Wrong. Maybe Network request Failed") });
                    });
            } else {
                setLoading(false);
                AsyncStorage.clear();
                navigation.navigate('Login');
            }
        });
    }

    const onRejectApprove = (id, type) => {
        setOtp("");
        if (type == 1) {
            setLoading(true);
            setPop(true);
            onSubmit(id, type);
            setContactId(id);
        } else {
            Alert.alert(
                t("Alert"),
                t("Are you sure for reject") + "?",
                [
                    {
                        text: t("Cancel"),
                        onPress: () => console.log("Cancel Pressed"),
                        style: "cancel"
                    },
                    {
                        text: t("Yes"), onPress: () => {
                            setLoading(true);
                            onSubmit(id, type);
                        }
                    }
                ],
                { cancelable: false }
            );
        }
    }

    const onCancel = () => {
        setPop(false);
        setOtp("");
    }

    const onVerify = () => {
        if (otp.trim() == "") {
            Toast.show({ description: t("Please enter OTP") });
        } else {
            setLoading(true);
            onSubmit(contactId, 1);
        }
    }

    const onSubmit = (contId, actionType) => {
        AsyncStorage.getItem('userToken').then(val => {
            if (val != null) {
                let formdata = new FormData();
                formdata.append("APIkey", `${API_KEY}`);
                formdata.append("token", JSON.parse(val).token);
                formdata.append("orgId", JSON.parse(val).org_id);
                formdata.append("contractor_id", contId);
                formdata.append("action", actionType);
                formdata.append("otp", otp);
                console.log(formdata);
                fetch(`${BASE_URL}/approve_reject_contact`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                    body: formdata
                })
                    .then((response) => response.json())
                    .then((responseJson) => {
                        console.log("approve_reject_contact:", responseJson);
                        if (responseJson.status == 'success') {
                            Toast.show({ description: responseJson.message });
                            if (actionType == 2) {
                                getAllData(selectedORG);
                            } else if (actionType == 1 && otp !== "") {
                                setPop(false);
                                getAllData(selectedORG);
                            } else {
                                setLoading(false);
                            }
                            setOtp("");
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
                        //console.log("approve_reject_contact Error:", error);
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
                        <Text color="#111111" fontSize="16" textAlign="center" fontWeight="bold" textTransform="capitalize">{t("Pending Approval")}</Text>
                        <Image source={logoImage ? { uri: logoImage } : require('../assets/images/logo.png')} style={{ width: 60, height: 25, resizeMode: 'contain' }} />
                    </HStack>
                </LinearGradient>
                <ImageBackground source={require('../assets/images/bg.jpg')} imageStyle={{ resizeMode: 'contain', position: 'absolute', bottom: 0, top: '65%', opacity: allLeads.length < 3 ? 0.6 : 0 }} style={styles.bgimage}>
                    <ScrollView>
                        <LinearGradient
                            colors={[lightColor, darkColor]}
                            style={{ height: allLeads.length == 0 ? 150 : 120, position: 'absolute', top: 0, width: '100%', borderBottomEndRadius: 100, borderBottomStartRadius: 100, overflow: 'hidden' }}
                            start={{ x: 0.5, y: 0 }}
                        ></LinearGradient>
                        {memberType == "CSO" && (
                            <OrgTabComponents clickBtn={onCheck} navigation={navigation} component={selectedORG} />
                        )}
                        <Box padding="5">
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
                                <Box>
                                    <VStack>
                                        {allLeads.map((item, index) =>
                                            <Box key={index} style={styles.productbox}>
                                                <View>
                                                    <VStack style={styles.productdetails} space="2">
                                                        <Text fontSize='md' fontWeight="bold">{item.contact_name}</Text>
                                                        <Pressable onPress={() => { Linking.openURL(`tel:${item.mobile_no}`) }}><Text fontSize='md' fontWeight="bold" color={darkColor}><Icon name="call" size={18} color="#999999" /> {item.mobile_no}</Text></Pressable>
                                                        <VStack>
                                                            <Text fontSize='sm'>{t("Member ID")}:   <Text fontSize='sm' fontWeight="bold">{item.dcm_contact_id}</Text></Text>
                                                            <Text fontSize='sm'>{t("Member Code")}:   <Text fontSize='sm' fontWeight="bold">{item.contact_id_extern01}</Text></Text>
                                                            <Text fontSize='sm'>{t("Date")}:   <Text fontSize='sm' fontWeight="bold">{moment(item.created_at).format('DD-MM-YYYY')}</Text></Text>
                                                        </VStack>
                                                    </VStack>
                                                </View>
                                                <HStack space={1} alignItems="center" justifyContent="space-evenly" bg="#e6e6e6" borderRadius="10" overflow="hidden" padding="2" mt="5">
                                                    <LinearGradient
                                                        colors={["#821700", "#f04e23"]}
                                                        start={{ x: 0.5, y: 0 }}
                                                        style={styles.custbtn}
                                                    >
                                                        <Button size="xs" variant="link" _text={{ color: "#ffffff", fontWeight: 'bold', fontSize: 13 }} onPress={() => onRejectApprove(item.dcm_contact_id, 2)}>{t("Reject")}</Button>
                                                    </LinearGradient>
                                                    <LinearGradient
                                                        colors={["#10764F", "#2BBB86"]}
                                                        start={{ x: 0.5, y: 0 }}
                                                        style={styles.custbtn}
                                                    >
                                                        <Button size="xs" variant="link" _text={{ color: "#ffffff", fontWeight: 'bold', fontSize: 13 }} onPress={() => onRejectApprove(item.dcm_contact_id, 1)}>{t("Approve")}</Button>
                                                    </LinearGradient>
                                                </HStack>
                                            </Box>
                                        )}
                                    </VStack>
                                </Box>
                            )}
                        </Box>
                    </ScrollView>
                </ImageBackground>
            </Box>
            {pop && (
                <View style={styles.spincontainer}>
                    <LinearGradient
                        colors={['#ffffff', lightColor]}
                        start={{ x: 0.5, y: 0 }}
                        style={{ width: 300, borderRadius: 15, overflow: 'hidden' }}
                    >
                        <ScrollView>
                            <VStack w="100%" paddingY="3" paddingX="5" alignItems="center" justifyContent="center">
                                <Text mt={5} mb={2} fontSize="md" fontWeight="bold" color="#111111">{t("Enter OTP & Verify")}</Text>
                                <Text color="#111111" fontSize="sm" textAlign="center" marginBottom={5}>{t("Please enter OTP and click on Verify OTP to continue.")}</Text>
                                <View style={[styles.inputbox, { backgroundColor: 'rgba(255,255,255,0.7)' }]}>
                                    <Input size="lg" onChangeText={(text) => setOtp(text)} keyboardType='number-pad' maxLength={6} variant="unstyled" InputLeftElement={<Icon name="key-outline" size={20} color="#f04e23" style={{ width: 25, marginLeft: 10, textAlign: 'center' }} />} placeholder={t("Enter OTP") + " *"} />
                                </View>
                                <TouchableOpacity style={{ alignSelf: 'center', marginVertical: 10 }} onPress={() => onSubmit(contactId, 1)}>
                                    <Text color="#f04e23" fontSize="sm" letterSpacing={0.5} fontWeight="bold" textAlign="center">{t("Resend OTP")}?</Text>
                                </TouchableOpacity>
                                <HStack justifyContent="space-between" width="100%" alignContent="center" marginY={5}>
                                    <Button size="xs" variant="outline" style={[styles.custbtn, { borderColor: '#111111', borderWidth: 1 }]} onPress={() => onCancel()}>
                                        <Text color="#111111" fontSize="sm" fontWeight="medium">{t("Verify Later")}</Text>
                                    </Button>
                                    <Button style={[styles.custbtn, { backgroundColor: '#111111', }]} onPress={() => onVerify()}>
                                        <Text color="#ffffff" fontSize="sm" fontWeight="medium">{t("Verify OTP")}</Text>
                                    </Button>
                                </HStack>
                            </VStack>
                        </ScrollView>
                    </LinearGradient>
                </View>
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
    inputbox: { backgroundColor: 'rgba(0,0,0,0.06)', borderRadius: 10, width: '100%', overflow: 'hidden', marginVertical: 7 },
    custbtn: { width: '48%', borderRadius: 12, overflow: 'hidden' },
    productbox: { borderRadius: 15, width: '96%', margin: '2%', backgroundColor: '#f6f6f6', padding: 15, borderColor: '#ffffff', borderWidth: 2, elevation: 10, shadowColor: '#666666', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.4, shadowRadius: 10, overflow: 'hidden' },
    productimage: { borderColor: '#dddddd', backgroundColor: '#ffffff', borderWidth: 1, borderRadius: 10, width: '38%', height: 90, justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
    productdetails: { width: '100%' },
    spincontainer: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0, 0, 0, 0.9)' },
});

export default PendingApprovalScreen;
