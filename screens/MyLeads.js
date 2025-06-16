import AsyncStorage from '@react-native-async-storage/async-storage';
import { Box, HStack, NativeBaseProvider, Text, VStack, Toast, Button, Stack, Menu, Select, Pressable, Input } from 'native-base';
import React, { useCallback, useEffect, useState } from 'react';
import Icon from 'react-native-vector-icons/Ionicons';
import { ActivityIndicator, Image, ScrollView, StatusBar, StyleSheet, TouchableOpacity, View, ImageBackground, Linking } from 'react-native';
import { API_KEY, BASE_URL, CONTACT_HIER_ID, ORG_ID, PROGRAM_ID } from '../auth_provider/Config';
import LinearGradient from 'react-native-linear-gradient';
import MonthPicker from 'react-native-month-year-picker';
import moment from 'moment';
import { useTranslation } from 'react-i18next';
import OrgTabComponents from '../components/OrgTab';

const MyLeadScreen = ({ navigation, route }) => {

    const { t } = useTranslation();

    const [loading, setLoading] = React.useState(false);
    const [lightColor, setLightColor] = React.useState("#cbf75e");
    const [darkColor, setDarkColor] = React.useState("#2BBB86");
    const [logoImage, setLogoImage] = React.useState("");
    const [cameraColor, setCameraColor] = React.useState("#f04e23");
    const [dataFound, setDataFound] = React.useState("");

    const [allLeads, setAllLeads] = React.useState([]);
    const [pending, setPending] = React.useState("");
    const [reasonsList, setReasonsList] = React.useState([]);
    const [rejectReason, setRejectReason] = React.useState("");

    const [filterStatus, setFilterStatus] = React.useState("");

    const [pop, setPop] = React.useState(false);
    const [leadId, setLeadId] = React.useState("");

    const [date, setDate] = useState(new Date());
    const [monthYear, setMonthYear] = useState("");
    const [show, setShow] = useState(false);

    const [isReset, setIsReset] = React.useState(false);

    const [memberType, setMemberType] = React.useState("");
    const [selectedORG, setSelectedORG] = React.useState("");

    const showPicker = useCallback((value) => { setLoading(true); setShow(value) }, []);

    const [pageNumber, setPageNumber] = React.useState(1);
    const [totalPage, setTotalPage] = React.useState(0);

    const onDateChange = useCallback(
        (event, newDate) => {
            const selectedDate = newDate || date;
            showPicker(false);
            if (event == "dateSetAction") {
                setDate(newDate);
                setMonthYear(moment(newDate).format('MMMM, YYYY'));
                setLoading(false);
            } else {
                setLoading(false);
            }
        },
        [date, showPicker],
    );

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            setLoading(true);
            const month = "";
            const year = "";
            AsyncStorage.getItem('userToken').then(val => {
                if (val != null) {
                    setMemberType(JSON.parse(val).member_type);
                    if (JSON.parse(val).member_type == "CSO") {
                        AsyncStorage.getItem('selectedOrg').then(orgVal => {
                            console.log("orgVal:", orgVal)
                            if (orgVal != null) {
                                setSelectedORG(JSON.parse(orgVal));
                                getAllData(month, year, JSON.parse(orgVal));
                            } else {
                                setSelectedORG(JSON.parse(val).default_org_selection[0].id);
                                getAllData(month, year, JSON.parse(val).default_org_selection[0].id);
                            }
                        })
                    } else {
                        setSelectedORG(JSON.parse(val).org_id);
                        getAllData(month, year, JSON.parse(val).org_id);
                    }
                }
            })
        });
        return unsubscribe;
    }, []);

    const getAllData = (month, year, forORG) => {
        AsyncStorage.getItem('userToken').then(val => {
            if (route.params != undefined) {
                setFilterStatus(route.params.type);
            } else {
                if (JSON.parse(val).member_type == "CSO") {
                    setFilterStatus("Open");
                } else {
                    setFilterStatus("All");
                }
            }
            if (val != null) {
                setLogoImage(JSON.parse(val).logo_url);

                setLightColor(JSON.parse(val).info.theme_color.light);
                setDarkColor(JSON.parse(val).info.theme_color.dark);

                let formdata = new FormData();
                formdata.append("APIkey", `${API_KEY}`);
                formdata.append("token", JSON.parse(val).token);
                formdata.append("orgId", JSON.parse(val).org_id);
                formdata.append("target_for", month);
                formdata.append("target_year", year);
                formdata.append("defaultOrgSelection", forORG);
                formdata.append("pageNumber", 1);
                console.log(formdata);
                fetch(`${BASE_URL}/get_lead_information_by_contact_id`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                    body: formdata
                })
                    .then((response) => response.json())
                    .then((responseJson) => {
                        console.log("My Leads:", responseJson);
                        setTotalPage(responseJson.load_more_button);
                        if (responseJson.status == 'success') {
                            setLoading(false);
                            setAllLeads(responseJson.lead_list);
                            setReasonsList(responseJson.reason_list);
                            setPending(responseJson.pending_lead_count);
                            if (responseJson.pending_lead_count == 0) {
                                setFilterStatus("All");
                            }
                            setDataFound("found");
                        } else {
                            Toast.show({ description: responseJson.message });
                            setAllLeads([]);
                            setReasonsList([]);
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
                        //console.log("My Leads Error:", error);
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
                formdata.append("target_for", "");
                formdata.append("target_year", "");
                formdata.append("defaultOrgSelection", selectedORG);
                formdata.append("pageNumber", num);
                console.log(formdata);
                fetch(`${BASE_URL}/get_lead_information_by_contact_id`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                    body: formdata
                })
                    .then((response) => response.json())
                    .then((responseJson) => {
                        console.log("My Leads:", responseJson);
                        setTotalPage(responseJson.load_more_button);
                        if (responseJson.status == 'success') {
                            let newArrya = allLeads.concat(responseJson.lead_list);
                            setAllLeads(newArrya);
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

    const onSearch = () => {
        setLoading(true);
        getAllData(moment(date).format('MM'), moment(date).format('YYYY'), selectedORG);
        setIsReset(true);
    }

    const onSetFilter = (dataVal) => {
        setLoading(true);
        setFilterStatus(dataVal);
        setTimeout(function () {
            setLoading(false);
        }, 1000);
    }

    const onReset = () => {
        setDate(new Date());
        setLoading(true);
        setIsReset(false);
        setMonthYear("");
        const month = "";
        const year = "";
        getAllData(month, year, selectedORG);
    }

    const onReject = (id) => {
        setPop(true);
        setLeadId(id);
    }

    const onCancel = () => {
        setPop(false);
        setRejectReason("");
    }

    const onSubmit = () => {
        if (rejectReason == "") {
            Toast.show({ description: t("Please select Reason") });
        } else {
            setLoading(true);
            setPop(false);
            AsyncStorage.getItem('userToken').then(val => {
                if (val != null) {
                    let formdata = new FormData();
                    formdata.append("APIkey", `${API_KEY}`);
                    formdata.append("token", JSON.parse(val).token);
                    formdata.append("orgId", JSON.parse(val).org_id);
                    formdata.append("rejection_reason", rejectReason);
                    formdata.append("status", 2);
                    formdata.append("lead_id", leadId);
                    fetch(`${BASE_URL}/lead_approval`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'multipart/form-data',
                        },
                        body: formdata
                    })
                        .then((response) => response.json())
                        .then((responseJson) => {
                            //console.log("Reject:", responseJson);
                            if (responseJson.status == 'success') {
                                Toast.show({ description: responseJson.message });
                                setTimeout(function () {
                                    const month = "";
                                    const year = "";
                                    getAllData(month, year, selectedORG);
                                    setRejectReason("");
                                    setLeadId("");
                                }, 1000);
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
                            //console.log("Reject Error:", error);
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

    const onCheck = (e) => {
        const month = "";
        const year = "";
        setLoading(true);
        getAllData(month, year, e);
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
                        <Text color="#111111" fontSize="16" textAlign="center" fontWeight="bold" textTransform="capitalize">{t("Lead List")}</Text>
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
                            <Box style={[styles.productbox, { paddingHorizontal: 8 }]}>
                                <HStack alignItems="center" justifyContent="space-evenly">
                                    <LinearGradient
                                        colors={filterStatus == "All" ? ["#555555", "#000000"] : ["#eeeeee", "#bbbbbb"]}
                                        start={{ x: 0.5, y: 0 }}
                                        style={[styles.custbtn, { width: '30%' }]}
                                    >
                                        <Button size="xs" variant="link" _text={{ color: filterStatus == "All" ? "#ffffff" : "#111111", fontWeight: 'bold', fontSize: 12 }} onPress={() => onSetFilter("All")}>{t("All")}</Button>
                                    </LinearGradient>
                                    <LinearGradient
                                        colors={filterStatus == "Approve" ? ["#555555", "#000000"] : ["#eeeeee", "#bbbbbb"]}
                                        start={{ x: 0.5, y: 0 }}
                                        style={[styles.custbtn, { width: '30%' }]}
                                    >
                                        <Button size="xs" variant="link" _text={{ color: filterStatus == "Approve" ? "#ffffff" : "#111111", fontWeight: 'bold', fontSize: 12 }} onPress={() => onSetFilter("Approve")}>{t("Approved")}</Button>
                                    </LinearGradient>
                                    <LinearGradient
                                        colors={filterStatus == "Open" ? ["#555555", "#000000"] : ["#eeeeee", "#bbbbbb"]}
                                        start={{ x: 0.5, y: 0 }}
                                        style={[styles.custbtn, { width: '30%' }]}
                                    >
                                        <Button size="xs" variant="link" _text={{ color: filterStatus == "Open" ? "#ffffff" : "#111111", fontWeight: 'bold', fontSize: 12 }} onPress={() => onSetFilter("Open")}>{t("Pending")}
                                            {Number(pending).toString() != 0 && (
                                                <Text style={{ position: 'absolute', right: -22, top: -5, zIndex: 9, borderRadius: 10, overflow: 'hidden', width: 18, height: 18, fontSize: 10, fontWeight: 'bold', textAlign: 'center', lineHeight: 18 }} color="#ffffff" bg={cameraColor}>{Number(pending).toString()}</Text>
                                            )}
                                        </Button>
                                    </LinearGradient>
                                </HStack>
                                <HStack justifyContent="space-between" bg="#e6e6e6" style={{ padding: 10, marginTop: 15, borderRadius: 10, overflow: 'hidden' }}>
                                    <Stack style={{ width: '72%' }}>
                                        <Pressable style={[styles.inputbox, { borderRadius: 7, marginVertical: 0, backgroundColor: '#ffffff' }]} onPress={() => showPicker(true)}>
                                            <HStack paddingY={Platform.OS == "ios" ? "1.5" : "1.5"}>
                                                <Icon name="calendar-outline" size={20} color="#666666" style={{ width: 25, marginLeft: 10, marginRight: 10, textAlign: 'center' }} />
                                                <Text color={monthYear != "" ? "#111111" : "#999999"} fontSize="md">{monthYear != "" ? monthYear : t("Month - Year")}</Text>
                                            </HStack>
                                        </Pressable>
                                        {isReset && (
                                            <Button size="xs" variant="link" isDisabled={monthYear == ""} style={[styles.custbtn, { width: 40, height: 35, backgroundColor: darkColor, position: 'absolute', right: 0 }]} onPress={() => onReset()}><Icon name="refresh-outline" size={16} color="#ffffff" /></Button>
                                        )}
                                    </Stack>
                                    <Button size="xs" isDisabled={monthYear == ""} style={[styles.custbtn, { width: '25%', height: 35, backgroundColor: "#666666" }]} _text={{ color: "#ffffff", fontWeight: 'bold', fontSize: 12 }} onPress={() => onSearch()}>{t("Search")}</Button>
                                </HStack>
                            </Box>
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
                                    {filterStatus == "All" ?
                                        <VStack>
                                            {allLeads.map((item, index) =>
                                                <Box key={index} style={styles.productbox}>
                                                    <HStack space="4" justifyContent="space-between">
                                                        <VStack style={styles.productdetails} space="1">
                                                            {item.is_cso_login == 0 ?
                                                                <Text fontSize='md' fontWeight="bold">{item.project_contact_person}</Text>
                                                                :
                                                                <Text fontSize='md' fontWeight="bold">{item.member_name}</Text>
                                                            }
                                                            <Text fontSize='sm'><Icon name="calendar" size={18} color="#999999" /> {item.created_at}</Text>
                                                            {item.is_cso_login == 1 && (
                                                                <Text fontSize='sm'><Icon name="person" size={18} color="#999999" /> {item.project_contact_person}</Text>
                                                            )}
                                                            <Text fontSize='sm'><Icon name="call" size={18} color="#999999" /> {item.project_contact_phone_number}</Text>
                                                        </VStack>
                                                        <VStack justifyContent="space-between" alignItems="flex-end" space="1" flex={1}>
                                                            <Menu marginRight="10" trigger={triggerProps => {
                                                                return <TouchableOpacity {...triggerProps}>
                                                                    <Icon name="ellipsis-horizontal-circle" size={36} color="#111111" />
                                                                </TouchableOpacity>;
                                                            }}>
                                                                <HStack justifyContent="space-between" alignItems="center" w="100%">
                                                                    <Menu.Item>
                                                                        <TouchableOpacity style={{ backgroundColor: '#111111', width: 40, height: 40, justifyContent: 'center', alignItems: 'center', borderRadius: 30, overflow: 'hidden' }} onPress={() => { Linking.openURL(`tel:${item.project_contact_phone_number}`) }}>
                                                                            <Icon name="call" size={22} color="#ffffff" />
                                                                        </TouchableOpacity>
                                                                        <TouchableOpacity style={{ backgroundColor: '#111111', width: 40, height: 40, justifyContent: 'center', alignItems: 'center', borderRadius: 30, overflow: 'hidden' }} onPress={() => navigation.navigate('LeadDetails', { details: item })}>
                                                                            <Icon name="information-circle" size={28} color="#ffffff" />
                                                                        </TouchableOpacity>
                                                                    </Menu.Item>
                                                                </HStack>
                                                            </Menu>
                                                            <Text fontWeight="bold" fontSize='md' color={item.status == "Rejected" ? "#F73303" : item.status == "Approve" ? "#14BF39" : "#E88907"}>{item.status}</Text>
                                                        </VStack>
                                                    </HStack>
                                                    {item.show_button == 1 && (
                                                        <HStack space={1} alignItems="center" justifyContent="space-evenly" bg="#e6e6e6" borderRadius="10" overflow="hidden" padding="2" mt="5">
                                                            <LinearGradient
                                                                colors={["#821700", "#f04e23"]}
                                                                start={{ x: 0.5, y: 0 }}
                                                                style={styles.custbtn}
                                                            >
                                                                <Button size="xs" variant="link" _text={{ color: "#ffffff", fontWeight: 'bold', fontSize: 13 }} onPress={() => onReject(item.id)}>{t("Reject Lead")}</Button>
                                                            </LinearGradient>
                                                            <LinearGradient
                                                                colors={["#10764F", "#2BBB86"]}
                                                                start={{ x: 0.5, y: 0 }}
                                                                style={styles.custbtn}
                                                            >
                                                                <Button size="xs" variant="link" _text={{ color: "#ffffff", fontWeight: 'bold', fontSize: 13 }} onPress={() => navigation.navigate('ApproveLead', { details: item })}>{t("Approve Lead")}</Button>
                                                            </LinearGradient>
                                                        </HStack>
                                                    )}
                                                </Box>
                                            )}
                                        </VStack>
                                        :
                                        <VStack>
                                            {allLeads.filter(item => item.status == filterStatus).map((item, index) =>
                                                <Box key={index} style={styles.productbox}>
                                                    <HStack space="4" justifyContent="space-between">
                                                        <VStack style={styles.productdetails} space="1">
                                                            {item.is_cso_login == 0 ?
                                                                <Text fontSize='md' fontWeight="bold">{item.project_contact_person}</Text>
                                                                :
                                                                <Text fontSize='md' fontWeight="bold">{item.member_name}</Text>
                                                            }
                                                            <Text fontSize='sm'><Icon name="calendar" size={18} color="#999999" /> {item.created_at}</Text>
                                                            {item.is_cso_login == 1 && (
                                                                <Text fontSize='sm'><Icon name="person" size={18} color="#999999" /> {item.project_contact_person}</Text>
                                                            )}
                                                            <Text fontSize='sm'><Icon name="call" size={18} color="#999999" /> {item.project_contact_phone_number}</Text>
                                                        </VStack>
                                                        <VStack justifyContent="space-between" alignItems="flex-end" space="1" flex={1}>
                                                            <Menu marginRight="10" trigger={triggerProps => {
                                                                return <TouchableOpacity {...triggerProps}>
                                                                    <Icon name="ellipsis-horizontal-circle" size={36} color="#111111" />
                                                                </TouchableOpacity>;
                                                            }}>
                                                                <HStack justifyContent="space-between" alignItems="center" w="100%">
                                                                    <Menu.Item>
                                                                        <TouchableOpacity style={{ backgroundColor: '#111111', width: 40, height: 40, justifyContent: 'center', alignItems: 'center', borderRadius: 30, overflow: 'hidden' }} onPress={() => { Linking.openURL(`tel:${item.project_contact_phone_number}`) }}>
                                                                            <Icon name="call" size={22} color="#ffffff" />
                                                                        </TouchableOpacity>
                                                                        <TouchableOpacity style={{ backgroundColor: '#111111', width: 40, height: 40, justifyContent: 'center', alignItems: 'center', borderRadius: 30, overflow: 'hidden' }} onPress={() => navigation.navigate('LeadDetails', { details: item })}>
                                                                            <Icon name="information-circle" size={28} color="#ffffff" />
                                                                        </TouchableOpacity>
                                                                    </Menu.Item>
                                                                </HStack>
                                                            </Menu>
                                                            <Text fontWeight="bold" fontSize='md' color={item.status == "Rejected" ? "#F73303" : item.status == "Approve" ? "#14BF39" : "#E88907"}>{item.status}</Text>
                                                        </VStack>
                                                    </HStack>
                                                    {item.show_button == 1 && (
                                                        <HStack space={1} alignItems="center" justifyContent="space-evenly" bg="#e6e6e6" borderRadius="10" overflow="hidden" padding="2" mt="5">
                                                            <LinearGradient
                                                                colors={["#821700", "#f04e23"]}
                                                                start={{ x: 0.5, y: 0 }}
                                                                style={styles.custbtn}
                                                            >
                                                                <Button size="xs" variant="link" _text={{ color: "#ffffff", fontWeight: 'bold', fontSize: 13 }} onPress={() => onReject(item.id)}>{t("Reject Lead")}</Button>
                                                            </LinearGradient>
                                                            <LinearGradient
                                                                colors={["#10764F", "#2BBB86"]}
                                                                start={{ x: 0.5, y: 0 }}
                                                                style={styles.custbtn}
                                                            >
                                                                <Button size="xs" variant="link" _text={{ color: "#ffffff", fontWeight: 'bold', fontSize: 13 }} onPress={() => navigation.navigate('ApproveLead', { details: item })}>{t("Approve Lead")}</Button>
                                                            </LinearGradient>
                                                        </HStack>
                                                    )}
                                                </Box>
                                            )}
                                        </VStack>
                                    }
                                </Box>
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
            {loading && (
                <View style={styles.spincontainer}>
                    <ActivityIndicator animating={loading} size="large" color={darkColor} />
                </View>
            )}
            {pop && (
                <VStack flex={1} style={{ backgroundColor: "rgba(0,0,0,0.85)", position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center', padding: 30 }}>
                    <Box style={styles.productbox}>
                        <Text color="#444444" fontWeight="bold" fontSize="md" mt="2" textAlign="center">{t("Reason for Rejection")} *</Text>
                        <View style={styles.inputbox}>
                            <Select variant="underlined" size="lg" placeholder={t("Please Select Reason")}
                                selectedValue={rejectReason}
                                onValueChange={value => setRejectReason(value)}
                                style={{ paddingLeft: 15 }}
                                _selectedItem={{
                                    backgroundColor: '#eeeeee',
                                    endIcon: <Icon name="checkmark-circle" size={22} color="#2BBB86" style={{ right: 0, position: 'absolute' }} />
                                }}>
                                {reasonsList.map((item, index) =>
                                    <Select.Item key={index} label={item} value={item} />
                                )}
                            </Select>
                        </View>
                        <HStack space={1} alignItems="center" justifyContent="space-evenly" bg="#dddddd" borderRadius="10" overflow="hidden" padding="2" mt="4">
                            <LinearGradient
                                colors={["#821700", "#f04e23"]}
                                start={{ x: 0.5, y: 0 }}
                                style={styles.custbtn}
                            >
                                <Button size="xs" variant="link" _text={{ color: "#ffffff", fontWeight: 'bold', fontSize: 13 }} onPress={() => onCancel()}>{t("Cancel")}</Button>
                            </LinearGradient>
                            <LinearGradient
                                colors={["#10764F", "#2BBB86"]}
                                start={{ x: 0.5, y: 0 }}
                                style={styles.custbtn}
                            >
                                <Button size="xs" variant="link" _text={{ color: "#ffffff", fontWeight: 'bold', fontSize: 13 }} onPress={() => onSubmit()}>{t("Submit")}</Button>
                            </LinearGradient>
                        </HStack>
                    </Box>
                </VStack>
            )}
            {show && (
                <MonthPicker
                    onChange={onDateChange}
                    value={date}
                    maximumDate={new Date()}
                />
            )}
        </NativeBaseProvider>
    );
};

const styles = StyleSheet.create({
    bgimage: { flex: 1, justifyContent: 'center' },
    inputbox: { backgroundColor: 'rgba(0,0,0,0.06)', borderRadius: 10, width: '100%', overflow: 'hidden', marginVertical: 7 },
    custbtn: { backgroundColor: 'none', width: '46%', borderRadius: 8, overflow: 'hidden' },
    productbox: { borderRadius: 15, width: '96%', margin: '2%', backgroundColor: '#f6f6f6', padding: 15, borderColor: '#ffffff', borderWidth: 2, elevation: 10, shadowColor: '#666666', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.4, shadowRadius: 10, overflow: 'hidden' },
    productimage: { borderColor: '#dddddd', backgroundColor: '#ffffff', borderWidth: 1, borderRadius: 10, width: '38%', height: 90, justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
    productdetails: { width: '58%' },
    spincontainer: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0, 0, 0, 0.8)' },
});

export default MyLeadScreen;
