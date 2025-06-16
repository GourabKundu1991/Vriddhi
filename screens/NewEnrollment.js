import AsyncStorage from '@react-native-async-storage/async-storage';
import { Actionsheet, Box, Button, Checkbox, HStack, Input, NativeBaseProvider, Pressable, Radio, Select, Stack, Text, Toast, VStack } from 'native-base';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, StyleSheet, TouchableOpacity, StatusBar, View, ScrollView, Keyboard, Platform } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import { API_KEY, BASE_URL, CONTACT_HIER_ID, ORG_ID, PROGRAM_ID } from '../auth_provider/Config';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import moment from 'moment';
import { useTranslation } from 'react-i18next';

const NewEnrollmentScreen = ({ navigation }) => {

    const { t } = useTranslation();

    const [loading, setLoading] = React.useState(false);
    const [lightColor, setLightColor] = React.useState("#cbf75e");
    const [darkColor, setDarkColor] = React.useState("#2BBB86");
    const [cameraColor, setCameraColor] = React.useState("#f04e23");
    const [logoImage, setLogoImage] = React.useState("");

    const [memberList, setMemberList] = React.useState([]);
    const [stateList, setStateList] = React.useState([]);
    const [districtList, setDistrictList] = React.useState([]);
    const [districtListPer, setDistrictListPer] = React.useState([]);
    const [pinList, setPinList] = React.useState([]);
    const [pinListPer, setPinListPer] = React.useState([]);
    const [dealerList, setDealerList] = React.useState([]);

    const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
    const [isAnniversaryDatePickerVisible, setAnniversaryDatePickerVisibility] = useState(false);
    const [dateType, setDateType] = React.useState("");

    const [termsCheck, setTermsCheck] = React.useState(false);

    const [pop, setPop] = React.useState(true);
    const [registrtionOrg, setRegistrationOrg] = React.useState([]);
    const [altContactId, setAltContactId] = React.useState([]);

    const [popOTP, setPopOTP] = React.useState(false);
    const [otp, setOtp] = React.useState('');
    const [verifyContactId, setVerifyContactId] = React.useState('');

    const showDatePicker = (val) => {
        setDateType(val);
        if (val == "dob") {
            setDatePickerVisibility(true);
        } else {
            setAnniversaryDatePickerVisibility(true);
        }
    };

    const hideDatePicker = () => {
        setDatePickerVisibility(false);
    };

    const handleConfirm = (date) => {
        hideDatePicker();
        if (dateType == "dob") {
            setDOB(date);
        } else {
            setAnniversary(date);
        }
    };

    const [isStateOpen, setIsStateOpen] = React.useState(false);
    const [statePicker, setStatePicker] = React.useState("");

    const onStateOpen = (val) => {
        setIsStateOpen(true);
        setStatePicker(val);
    }
    const onStateClose = () => {
        setIsStateOpen(false);
    }

    const onSelectState = (details) => {
        onStateClose();
        if (statePicker == "primary") {
            setDistrict("");
            setState(details);
            setDistrictList(details.district_list);
        } else {
            setDistrictPer("");
            setStatePer(details);
            setDistrictListPer(details.district_list);
        }
    }

    const [searchDealer, setSearchDealer] = React.useState("");
    const [searchAltDealer, setSearchAltDealer] = React.useState("");
    const [isDealerOpen, setIsDealerOpen] = React.useState(false);
    const [dealerTypr, setDealerType] = React.useState("");

    const onDealerOpen = (valType, val, valId, exception) => {
        setDealerType(val);
        getDealerList(valType, valId, exception);
    }
    const onDealerClose = () => {
        setIsDealerOpen(false);
    }

    const onSelectDealer = (details) => {
        setSearchDealer("");
        setSearchAltDealer("");
        onDealerClose();
        if (dealerTypr == "primary") {
            setPrimaryDealer(details);
        } else if (dealerTypr == "second") {
            setSecondDealer(details);
        } else if (dealerTypr == "thrid") {
            setThirdDealer(details);
        } else if (dealerTypr == "alt_primary") {
            setAltPrimaryDealer(details);
        } else if (dealerTypr == "alt_second") {
            setAltSecondDealer(details);
        } else if (dealerTypr == "alt_thrid") {
            setAltThirdDealer(details);
        }
    }

    const onDealerCancel = (type) => {
        setSearchDealer("");
        setSearchAltDealer("");
        if (type == "primary") {
            setPrimaryDealer("");
            setSecondDealer("");
            setThirdDealer("");
        } else if (type == "second") {
            setSecondDealer("");
            setThirdDealer("");
        } else if (type == "thrid") {
            setThirdDealer("");
        } else if (type == "alt_primary") {
            setAltPrimaryDealer("");
            setAltSecondDealer("");
            setAltThirdDealer("");
        } else if (type == "alt_second") {
            setAltSecondDealer("");
            setAltThirdDealer("");
        } else if (type == "alt_thrid") {
            setAltThirdDealer("");
        }
    }

    const [isPicker, setIsPicker] = React.useState(false);
    const [imageType, setImageType] = React.useState("");

    const onPickerOpen = (val) => {
        setIsPicker(true);
        setImageType(val);
    }
    const onPickerClose = () => {
        setIsPicker(false);
    }

    const openProfilePicker = (type) => {
        onPickerClose();
        if (type == "library") {
            launchImageLibrary(
                {
                    mediaType: 'photo',
                    includeBase64: true,
                    maxHeight: 1500,
                    maxWidth: 1500,
                },
                (response) => {
                    //console.log(response);
                    if (response.assets != undefined) {
                        if (imageType == "AadhaarFrontImage") {
                            setAadhaarFrontImage(response.assets[0].base64);
                        } else if (imageType == "AadhaarBackImage") {
                            setAadhaarBackImage(response.assets[0].base64);
                        } else if (imageType == "PanImage") {
                            setPanImage(response.assets[0].base64);
                        } else if (imageType == "ProfileImage") {
                            setProfileImage(response.assets[0].base64);
                        }
                    }
                },
            )
        } else if (type == "camera") {
            launchCamera(
                {
                    mediaType: 'photo',
                    includeBase64: true,
                    maxHeight: 1500,
                    maxWidth: 1500,
                },
                (response) => {
                    //console.log(response.assets);
                    if (response.assets != undefined) {
                        if (imageType == "AadhaarFrontImage") {
                            setAadhaarFrontImage(response.assets[0].base64);
                        } else if (imageType == "AadhaarBackImage") {
                            setAadhaarBackImage(response.assets[0].base64);
                        } else if (imageType == "PanImage") {
                            setPanImage(response.assets[0].base64);
                        } else if (imageType == "ProfileImage") {
                            setProfileImage(response.assets[0].base64);
                        }
                    }
                },
            )
        }
    }

    const [registrationType, setRegistrationType] = React.useState("");

    const [fullName, setFullName] = React.useState("");
    const [gender, setGender] = React.useState("");
    const [mobile, setMobile] = React.useState("");
    const [email, setEmail] = React.useState("");
    const [dob, setDOB] = React.useState("");
    const [maritalStatus, setMaritalStatus] = React.useState("");
    const [anniversary, setAnniversary] = React.useState("");
    const [member, setMember] = React.useState("");
    const [monthlyLifting, setMonthlyLifting] = React.useState("");
    const [profileImage, setProfileImage] = React.useState("");

    const [address1, setAddress1] = React.useState("");
    const [address2, setAddress2] = React.useState("");
    const [landMark, setLandMark] = React.useState("");
    const [state, setState] = React.useState("");
    const [district, setDistrict] = React.useState("");
    const [city, setCity] = React.useState("");
    const [pinCode, setPinCode] = React.useState("");

    const [sameAddress, setSameAddress] = React.useState(false);

    const [address1Per, setAddress1Per] = React.useState("");
    const [address2Per, setAddress2Per] = React.useState("");
    const [landMarkPer, setLandMarkPer] = React.useState("");
    const [statePer, setStatePer] = React.useState("");
    const [districtPer, setDistrictPer] = React.useState("");
    const [cityPer, setCityPer] = React.useState("");
    const [pinCodePer, setPinCodePer] = React.useState("");

    const [primaryDealer, setPrimaryDealer] = React.useState("");
    const [secondDealer, setSecondDealer] = React.useState("");
    const [thirdDealer, setThirdDealer] = React.useState("");
    const [altPrimaryDealer, setAltPrimaryDealer] = React.useState("");
    const [altSecondDealer, setAltSecondDealer] = React.useState("");
    const [altThirdDealer, setAltThirdDealer] = React.useState("");

    const [aadhaarCard, setAadhaarCard] = React.useState("");
    const [aadhaarFrontImage, setAadhaarFrontImage] = React.useState("");
    const [aadhaarBackImage, setAadhaarBackImage] = React.useState("");
    const [panCard, setPanCard] = React.useState("");
    const [panImage, setPanImage] = React.useState("");

    const [csrfToken, setCSRFToken] = React.useState("");

    const [orgID, setOrgID] = React.useState("");
    const [orgNVCL, setOrgNVCL] = React.useState("");
    const [orgNVL, setOrgNVL] = React.useState("");

    useEffect(() => {
        setLoading(true);
        getAllData();
    }, [])

    const getAllData = () => {
        AsyncStorage.getItem('userToken').then(val => {
            if (val != null) {
                setLogoImage(JSON.parse(val).logo_url);

                setLightColor(JSON.parse(val).info.theme_color.light);
                setDarkColor(JSON.parse(val).info.theme_color.dark);

                setOrgID(JSON.parse(val).org_id);
                setOrgNVCL(JSON.parse(val).nvcl_org_id);
                setOrgNVL(JSON.parse(val).nvl_org_id);

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
                            setMemberList(responseJson.member_list);
                            setStateList(responseJson.states);
                            setRegistrationOrg(responseJson.registration_org_selection);
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

    const getDealerList = (valType, altId, exceptionVal) => {
        if (valType == "dealer" && searchDealer == "") {
            Toast.show({ description: t("Please enter Dealer") });
        } else if (valType == "alt_dealer" && searchAltDealer == "") {
            Toast.show({ description: t("Please enter Dealer") });
        } else {
            setLoading(true);
            AsyncStorage.getItem('userToken').then(val => {
                if (val != null) {
                    let formdata = new FormData();
                    formdata.append("APIkey", `${API_KEY}`);
                    formdata.append("token", JSON.parse(val).token);
                    formdata.append("orgId", JSON.parse(val).org_id);
                    formdata.append("contact_str", (valType == "dealer" ? searchDealer : searchAltDealer));
                    formdata.append("officer_alternate_contacts_id", altId);
                    formdata.append("has_primary", exceptionVal)
                    console.log(formdata);
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
                                    setSearchDealer("");
                                    setSearchAltDealer("");
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
    }

    const onSetMember = (data) => {
        setMember(data);
        if (data == "Contractor") {
            setEmail("");
        }
    }

    const onValidate = () => {
        Keyboard.dismiss();
        if (registrationType == "") {
            Toast.show({ description: t("Please choose Organisation Type") });
        } else if (fullName.trim() == "") {
            Toast.show({ description: t("Please enter Full Name") });
        } else if (mobile.trim() == "") {
            Toast.show({ description: t("Please enter Monile Number") });
        } else if (member == "") {
            Toast.show({ description: t("Please select Nature of Business") });
        } else if (member != "Contractor" && email.trim() == "") {
            Toast.show({ description: t("Please enter your Email") });
        } else if (aadhaarCard.trim() == "") {
            Toast.show({ description: t("Please enter Aadhaar Card Number") });
        } else {
            setLoading(true);
            AsyncStorage.getItem('userToken').then(val => {
                if (val != null) {
                    let formdata = new FormData();
                    formdata.append("APIkey", `${API_KEY}`);
                    formdata.append("token", JSON.parse(val).token);
                    formdata.append("orgId", JSON.parse(val).org_id);
                    formdata.append("selected_org", registrationType.id);
                    formdata.append("nob", member);
                    formdata.append("fullName", fullName);
                    formdata.append("regMobNo", mobile);
                    formdata.append("emailAddress", email);
                    formdata.append("address_proof_number", aadhaarCard);
                    formdata.append("id_proof_number", panCard);
                    console.log(formdata);
                    fetch(`${BASE_URL}/registration_step_1_validation`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'multipart/form-data',
                        },
                        body: formdata
                    })
                        .then((response) => response.json())
                        .then((responseJson) => {
                            console.log("Registration Validation:", responseJson);
                            if (responseJson.status == 'success') {
                                Toast.show({ description: responseJson.message });
                                setLoading(false);
                                setPop(false);
                                setSearchDealer("");
                                setSearchAltDealer("");
                                setPrimaryDealer("");
                                setSecondDealer("");
                                setThirdDealer("");
                                setAltPrimaryDealer("");
                                setAltSecondDealer("");
                                setAltThirdDealer("");
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
                            console.log("Registration Validation Error:", error);
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

    const onCheckSubmit = () => {
        Keyboard.dismiss();
        if (fullName.trim() == "") {
            Toast.show({ description: t("Please enter Full Name") });
        } else if (gender == "") {
            Toast.show({ description: t("Please select Gender") });
        } else if (mobile.trim() == "") {
            Toast.show({ description: t("Please enter Monile Number") });
        } else if (member == "") {
            Toast.show({ description: t("Please select Nature of Business") });
        } else if (member != "Contractor" && email.trim() == "") {
            Toast.show({ description: t("Please enter your Email") });
        } else if (dob == "") {
            Toast.show({ description: t("Please select Date of Birth") });
        } else if (member == "Engineer" && maritalStatus == "") {
            Toast.show({ description: t("Please select Marital Status") });
        } /* else if (maritalStatus == "Married" && anniversary == "") {
            Toast.show({ description: t("Please enter Date of Anniversary") });
        }  */else if (monthlyLifting.trim() == "") {
            Toast.show({ description: t("Please enter Average Monthly Liftings") });
        } else if (profileImage == "") {
            Toast.show({ description: t("Please attach Influencer Image") });
        } else if (address1.trim() == "") {
            Toast.show({ description: t("Please enter Address Line 1") });
        } else if (address2.trim() == "") {
            Toast.show({ description: t("Please enter Address Line 2") });
        } else if (state == "") {
            Toast.show({ description: t("Please select State") });
        } else if (district == "") {
            Toast.show({ description: t("Please select District") });
        } else if (pinCode.trim() == "") {
            Toast.show({ description: t("Please enter Pincode") });
        } else if (address1Per.trim() == "") {
            Toast.show({ description: t("Please enter Permanent Address Line 1") });
        } else if (address2Per.trim() == "") {
            Toast.show({ description: t("Please enter Permanent Address Line 2") });
        } else if (statePer == "") {
            Toast.show({ description: t("Please select Permanent State") });
        } else if (districtPer == "") {
            Toast.show({ description: this("Please select Permanent District") });
        } else if (pinCodePer.trim() == "") {
            Toast.show({ description: t("Please enter Permanent Pincode") });
        } else if ((registrationType.name == "For Both" || registrationType.name == "Vriddhi") && primaryDealer == "") {
            Toast.show({ description: t("Please select Primary Dealer for Vriddhi") });
        } else if ((registrationType.name == "For Both" || registrationType.name == "Nipun") && altPrimaryDealer == "") {
            Toast.show({ description: t("Please select Primary Dealer for Nipun") });
        } else if (aadhaarCard.trim() == "") {
            Toast.show({ description: t("Please enter Aadhaar Card Number") });
        } else if (aadhaarFrontImage == "") {
            Toast.show({ description: t("Please attach Aadhaar Front Image") });
        } else if (aadhaarBackImage == "") {
            Toast.show({ description: t("Please attach Aadhaar Back Image") });
        } else if (panCard.trim() != "" && panImage == "") {
            Toast.show({ description: t("Please Attach Pan Image") });
        } else {
            onSubmit();
        }
    }

    const onSubmit = () => {
        /* if (termsCheck == false) {
            Toast.show({ description: t("Please accept Terms & Condition") });
        } else { */
            setLoading(true);
            AsyncStorage.getItem('userToken').then(val => {
                if (val != null) {
                    let formdata = new FormData();
                    formdata.append("selected_org", registrationType.id);
                    formdata.append("APIkey", `${API_KEY}`);
                    formdata.append("orgId", JSON.parse(val).org_id);
                    formdata.append("token", JSON.parse(val).token);
                    formdata.append("fullName", fullName);
                    formdata.append("gender", gender);
                    formdata.append("regMobNo", mobile);
                    formdata.append("emailAddress", email);
                    formdata.append("dateOfBirth", moment(dob).format("YYYY-MM-DD"));
                    formdata.append("dateOfAnniversary", (anniversary != "" ? moment(anniversary).format("YYYY-MM-DD") : ""));
                    formdata.append("nob", member);
                    formdata.append("avgMonthlyLifting", monthlyLifting);
                    formdata.append("profileImage", profileImage);
                    formdata.append("addLine1", address1);
                    formdata.append("addLine2", address2);
                    formdata.append("addLine3", landMark);
                    formdata.append("stateId", state.id);
                    formdata.append("districtId", district);
                    formdata.append("city", city);
                    formdata.append("pincode", pinCode);
                    formdata.append("same_as_com_add", sameAddress ? 1 : 0);
                    formdata.append("permanent_line1", address1Per);
                    formdata.append("permanent_line2", address2Per);
                    formdata.append("permanent_line3", landMarkPer);
                    formdata.append("permanent_dcm_states_id", statePer.id);
                    formdata.append("permanent_dcm_cities_id", districtPer);
                    formdata.append("permanent_city", cityPer);
                    formdata.append("permanent_post_code", pinCodePer);
                    formdata.append("primary_dealer_contact_id", (primaryDealer != "" ? primaryDealer.c_id : ""));
                    formdata.append("secondary_dealer01_contact_id", (secondDealer != "" ? secondDealer.c_id : ""));
                    formdata.append("secondary_dealer02_contact_id", (thirdDealer != "" ? thirdDealer.c_id : ""));
                    formdata.append("alt_org_primary_dealer_contact_id", (altPrimaryDealer != "" ? altPrimaryDealer.c_id : ""));
                    formdata.append("alt_org_secondary_dealer01_contact_id", (altSecondDealer != "" ? altSecondDealer.c_id : ""));
                    formdata.append("alt_org_secondary_dealer02_contact_id", (altThirdDealer != "" ? altThirdDealer.c_id : ""));
                    formdata.append("address_proof_number", aadhaarCard);
                    formdata.append("addProofImage", aadhaarFrontImage);
                    formdata.append("addProofBackImage", aadhaarBackImage);
                    formdata.append("id_proof_number", panCard);
                    formdata.append("idProofImage", panImage);
                    formdata.append("account_hash", csrfToken);
                    console.log(formdata);
                    fetch(`${BASE_URL}/registration`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'multipart/form-data',
                        },
                        body: formdata
                    })
                        .then((response) => response.json())
                        .then((responseJson) => {
                            console.log("Registration:", responseJson);
                            if (responseJson.status == 'success') {
                                Toast.show({ description: responseJson.message });
                                setTimeout(function () {
                                    setLoading(false);
                                    setVerifyContactId(responseJson.verifyContactId);
                                    setPopOTP(true);
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
                            console.log("Registration Error:", error);
                            Toast.show({ description: t("Sorry! Somthing went Wrong. Maybe Network request Failed") });
                        });
                } else {
                    setLoading(false);
                    AsyncStorage.clear();
                    navigation.navigate('Login');
                }
            });
       /*  } */
    }

    const onSelectDistrict = (valDist, type) => {
        if (type == "primary") {
            setDistrict(valDist);
            setPinCode("");
        } else if (type == "permanent") {
            setDistrictPer(valDist);
            setPinCodePer("");
        }
        setLoading(true);
        AsyncStorage.getItem('userToken').then(val => {
            if (val != null) {
                let formdata = new FormData();
                formdata.append("APIkey", `${API_KEY}`);
                formdata.append("token", JSON.parse(val).token);
                formdata.append("orgId", JSON.parse(val).org_id);
                formdata.append("stateId", (type == "primary" ? state.id : statePer.id));
                formdata.append("districtId", valDist);
                console.log(formdata);
                fetch(`${BASE_URL}/state_district_wise_pincode_list`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                    body: formdata
                })
                    .then((response) => response.json())
                    .then((responseJson) => {
                        console.log("state_district_wise_pincode_list:", responseJson);
                        if (responseJson.status == 'success') {
                            setLoading(false);
                            if (type == "primary") {
                                setPinList(responseJson.data);
                            } else if (type == "permanent") {
                                setPinListPer(responseJson.data);
                            }
                        } else {
                            setPinList([]);
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
                        //console.log("state_district_wise_pincode_list Error:", error);
                        Toast.show({ description: t("Sorry! Somthing went Wrong. Maybe Network request Failed") });
                    });
            }
        })
    }

    const onSameAddress = (datavalue) => {
        setSameAddress(datavalue);
        if (datavalue == true) {
            setAddress1Per(address1);
            setAddress2Per(address2);
            setLandMarkPer(landMark);
            setStatePer(state);
            setDistrictPer(district);
            setCityPer(city);
            setPinCodePer(pinCode);
        } else {
            setAddress1Per("");
            setAddress2Per("");
            setLandMarkPer("");
            setStatePer("");
            setDistrictPer("");
            setCityPer("");
            setPinCodePer("");
        }
    }

    const onVerify = () => {
        if (otp.trim() == "") {
            Toast.show({ description: t("Please enter OTP") });
        } else {
            setLoading(true);
            AsyncStorage.getItem('userToken').then(val => {
                if (val != null) {
                    let formdata = new FormData();
                    formdata.append("APIkey", `${API_KEY}`);
                    formdata.append("orgId", JSON.parse(val).org_id);
                    formdata.append("token", JSON.parse(val).token);
                    formdata.append("otpVal", otp);
                    formdata.append("verifyContactId", verifyContactId);
                    console.log(formdata);
                    fetch(`${BASE_URL}/validate_verify_otp`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'multipart/form-data',
                        },
                        body: formdata
                    })
                        .then((response) => response.json())
                        .then((responseJson) => {
                            console.log("validate_verify_otp:", responseJson);
                            if (responseJson.status == 'success') {
                                Toast.show({ description: responseJson.message });
                                setPopOTP(false);
                                setTimeout(function () {
                                    setLoading(false);
                                    navigation.goBack();
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
                            console.log("validate_verify_otp Error:", error);
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

    const resendOtp = () => {
        setLoading(true);
        AsyncStorage.getItem('userToken').then(val => {
            if (val != null) {
                let formdata = new FormData();
                formdata.append("APIkey", `${API_KEY}`);
                formdata.append("token", JSON.parse(val).token);
                formdata.append("orgId", JSON.parse(val).org_id);
                formdata.append("contractor_id", verifyContactId);
                formdata.append("action", 1);
                formdata.append("otp", "");
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
                        console.log("Resend OTP:", responseJson);
                        if (responseJson.status == 'success') {
                            Toast.show({ description: responseJson.message });
                            setLoading(false);
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
                        //console.log("Resend OTP Error:", error);
                        Toast.show({ description: t("Sorry! Somthing went Wrong. Maybe Network request Failed") });
                    });
            } else {
                setLoading(false);
                AsyncStorage.clear();
                navigation.navigate('Login');
            }
        });
    }

    const dobdate = new Date();
    const year = dobdate.getFullYear();
    const month = dobdate.getMonth();
    const day = dobdate.getDate();

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
                        <Text color="#111111" fontSize="16" textAlign="center" fontWeight="bold">{t("New Enrollment")}</Text>
                        <Image source={logoImage ? { uri: logoImage } : require('../assets/images/logo.png')} style={{ width: 60, height: 25, resizeMode: 'contain' }} />
                    </HStack>
                </LinearGradient>
                <ScrollView>
                    <LinearGradient
                        colors={[lightColor, darkColor]}
                        style={{ height: 130, position: 'absolute', top: 0, width: '100%', borderBottomEndRadius: 100, borderBottomStartRadius: 100, overflow: 'hidden' }}
                        start={{ x: 0.5, y: 0 }}
                    ></LinearGradient>
                    <Box padding="5">
                        <Box style={styles.productbox}>
                            <Stack borderColor="#bbbbbb" borderBottomWidth={1} mb="4" pb="3"><Text color={darkColor} fontSize="16" fontWeight="bold" textAlign="center">{t("Influencer Details")}</Text></Stack>
                            <View style={styles.inputbox}>
                                <Input size="lg" value={fullName} readOnly variant="unstyled" InputLeftElement={<Icon name="person-outline" size={20} color="#666666" style={{ width: 25, marginLeft: 10, textAlign: 'center' }} />} placeholder={t("Full Name") + " *"} />
                            </View>
                            <View style={styles.inputbox}>
                                <Input size="lg" value={mobile} readOnly keyboardType='number-pad' maxLength={10} variant="unstyled" InputLeftElement={<Icon name="phone-portrait-outline" size={20} color="#666666" style={{ width: 25, marginLeft: 10, textAlign: 'center' }} />} placeholder={t("Mobile") + " *"} />
                            </View>
                            <View style={styles.inputbox}>
                                <Input size="lg" value={member} readOnly variant="unstyled" InputLeftElement={<Icon name="list-outline" size={20} color="#666666" style={{ width: 25, marginLeft: 10, textAlign: 'center' }} />} placeholder={t("Nature of Business") + " *"} />
                            </View>
                            {email != "" && (
                                <View style={styles.inputbox}>
                                    <Input size="lg" value={email} readOnly keyboardType='email-address' variant="unstyled" InputLeftElement={<Icon name="mail-outline" size={20} color="#666666" style={{ width: 25, marginLeft: 10, textAlign: 'center' }} />} placeholder={t("Email")} />
                                </View>
                            )}
                            <View style={styles.inputbox}>
                                <Select variant="underlined" size="lg" placeholder={t("Select Gender") + " *"}
                                    InputLeftElement={<Icon name="male-female-outline" size={20} color="#666666" style={{ width: 25, marginLeft: 10, marginRight: 10, textAlign: 'center' }} />}
                                    selectedValue={gender}
                                    onValueChange={value => setGender(value)}
                                    _selectedItem={{
                                        backgroundColor: '#eeeeee',
                                        endIcon: <Icon name="checkmark-circle" size={22} color="#2BBB86" style={{ right: 0, position: 'absolute' }} />
                                    }}>
                                    <Select.Item label="Male" value="m" />
                                    <Select.Item label="Female" value="f" />
                                </Select>
                            </View>
                            <Pressable style={styles.inputbox} onPress={() => showDatePicker("dob")}>
                                <HStack paddingY={Platform.OS == "ios" ? "1.5" : "2.5"}>
                                    <Icon name="calendar-outline" size={20} color="#666666" style={{ width: 25, marginLeft: 10, marginRight: 10, textAlign: 'center' }} />
                                    <Text color={dob != "" ? "#111111" : "#999999"} fontSize="md">{dob != "" ? moment(dob).format("DD MMMM, YYYY") : t("Date of Birth") + " *"}</Text>
                                </HStack>
                            </Pressable>
                            <DateTimePickerModal
                                isVisible={isDatePickerVisible}
                                mode="date"
                                onConfirm={handleConfirm}
                                onCancel={hideDatePicker}
                                minimumDate={new Date(moment().subtract(100, "years"))}
                                maximumDate={new Date(moment().subtract(18, "years"))}
                            />
                            <View style={styles.inputbox}>
                                <Select variant="underlined" size="lg" placeholder={member == "Engineer" ? t("Marital Status *") : t("Marital Status")}
                                    InputLeftElement={<Icon name="male-female-outline" size={20} color="#666666" style={{ width: 25, marginLeft: 10, marginRight: 10, textAlign: 'center' }} />}
                                    selectedValue={maritalStatus}
                                    onValueChange={value => setMaritalStatus(value)}
                                    _selectedItem={{
                                        backgroundColor: '#eeeeee',
                                        endIcon: <Icon name="checkmark-circle" size={22} color="#2BBB86" style={{ right: 0, position: 'absolute' }} />
                                    }}>
                                    <Select.Item label="Married" value="Married" />
                                    <Select.Item label="Single" value="Single" />
                                </Select>
                            </View>
                            <Pressable style={styles.inputbox} onPress={() => showDatePicker("anniversary")}>
                                <HStack paddingY={Platform.OS == "ios" ? "1.5" : "2.5"}>
                                    <Icon name="calendar-outline" size={20} color="#666666" style={{ width: 25, marginLeft: 10, marginRight: 10, textAlign: 'center' }} />
                                    <Text color={anniversary != "" ? "#111111" : "#999999"} fontSize="md">{anniversary != "" ? moment(anniversary).format("DD MMMM, YYYY") : t("Date of Anniversary")}</Text>
                                </HStack>
                            </Pressable>
                            <DateTimePickerModal
                                isVisible={isAnniversaryDatePickerVisible}
                                mode="date"
                                onConfirm={handleConfirm}
                                onCancel={hideDatePicker}
                            />
                            <View style={styles.inputbox}>
                                <Input size="lg" onChangeText={(text) => setMonthlyLifting(text)} keyboardType='number-pad' variant="unstyled" InputLeftElement={<Icon name="wallet-outline" size={20} color="#666666" style={{ width: 25, marginLeft: 10, textAlign: 'center' }} />} placeholder={t("Average Monthly liftings(Bags)") + " *"} />
                            </View>
                            <HStack alignItems="center" mt="3" space={0}>
                                <Icon name="attach-outline" size={22} color="#666666" />
                                <Text color="#666666" fontSize="md" textTransform="capitalize">{t("Attach Influencer Image")} *</Text>
                            </HStack>
                            <View style={styles.inputbox}>
                                <Image source={profileImage != "" ? { uri: 'data:image/jpeg;base64,' + profileImage } : require('../assets/images/noimage.jpg')} alt="image" resizeMode='contain' style={{ width: '100%', height: 160 }} />
                                <Pressable onPress={() => onPickerOpen("ProfileImage")} bg={cameraColor} position="absolute" bottom="3" right="3" width="50" height="50" justifyContent="center" alignItems="center" borderRadius="30" overflow="hidden">
                                    <Icon name="camera" size={26} color="#ffffff" />
                                </Pressable>
                            </View>
                        </Box>
                        <Box style={styles.productbox}>
                            <Stack borderColor="#bbbbbb" borderBottomWidth={1} mb="4" pb="3">
                                <Text color={darkColor} fontSize="16" fontWeight="bold" textAlign="center">{t("Communication Address")}</Text>
                                <Text color="#666666" fontSize="12" textAlign="center">{t("Introductory Kit & Gifts will be dispatched to this address")}</Text>
                            </Stack>
                            <View style={styles.inputbox}>
                                <Input size="lg" onChangeText={(text) => setAddress1(text)} variant="unstyled" InputLeftElement={<Icon name="location-outline" size={20} color="#666666" style={{ width: 25, marginLeft: 10, textAlign: 'center' }} />} placeholder={t("Address Line 1") + " *"} />
                            </View>
                            <View style={styles.inputbox}>
                                <Input size="lg" onChangeText={(text) => setAddress2(text)} variant="unstyled" InputLeftElement={<Icon name="location-outline" size={20} color="#666666" style={{ width: 25, marginLeft: 10, textAlign: 'center' }} />} placeholder={t("Address Line 2") + " *"} />
                            </View>
                            <View style={styles.inputbox}>
                                <Input size="lg" onChangeText={(text) => setLandMark(text)} variant="unstyled" InputLeftElement={<Icon name="location-outline" size={20} color="#666666" style={{ width: 25, marginLeft: 10, textAlign: 'center' }} />} placeholder={t("Nearest Landmark")} />
                            </View>
                            <Pressable style={styles.inputbox} onPress={() => onStateOpen("primary")}>
                                <Input size="lg" readOnly variant="unstyled" value={state.name}
                                    InputLeftElement={<Icon name="location-outline" size={20} color="#666666" style={{ width: 25, marginLeft: 10, textAlign: 'center' }} />}
                                    InputRightElement={<Icon name="chevron-down-outline" size={30} color="#777777" style={{ width: 25, marginRight: 10, textAlign: 'center' }} />}
                                    placeholder={t("Select State") + " *"} />
                            </Pressable>
                            {state != "" && (
                                <View style={styles.inputbox}>
                                    <Select variant="underlined" size="lg" placeholder={t("Select District") + " *"}
                                        InputLeftElement={<Icon name="location-outline" size={20} color="#666666" style={{ width: 25, marginLeft: 10, marginRight: 10, textAlign: 'center' }} />}
                                        selectedValue={district}
                                        onValueChange={value => onSelectDistrict(value, "primary")}
                                        _selectedItem={{
                                            backgroundColor: '#eeeeee',
                                            endIcon: <Icon name="checkmark-circle" size={22} color="#2BBB86" style={{ right: 0, position: 'absolute' }} />
                                        }}>
                                        {districtList.map((item, index) =>
                                            <Select.Item key={index} label={item.name} value={item.id} />
                                        )}
                                    </Select>
                                </View>
                            )}
                            <View style={styles.inputbox}>
                                <Input size="lg" onChangeText={(text) => setCity(text)} variant="unstyled" InputLeftElement={<Icon name="location-outline" size={20} color="#666666" style={{ width: 25, marginLeft: 10, textAlign: 'center' }} />} placeholder={t("City")} />
                            </View>
                            <View style={styles.inputbox}>
                                <Input size="lg" keyboardType='number-pad' maxLength={6} onChangeText={(text) => setPinCode(text)} variant="unstyled" InputLeftElement={<Icon name="location-outline" size={20} color="#666666" style={{ width: 25, marginLeft: 10, textAlign: 'center' }} />} placeholder={t("Pincode") + " *"} />
                            </View>
                        </Box>
                        <Box style={styles.productbox}>
                            <Stack borderColor="#bbbbbb" borderBottomWidth={1} mb="4" pb="3">
                                <Text color={darkColor} fontSize="16" fontWeight="bold" textAlign="center">{t("Permanent Address")}</Text>
                                <HStack space={2} justifyContent="center" alignItems="center" mt="1">
                                    {!sameAddress ?
                                        <Pressable onPress={() => onSameAddress(true)}><Icon name="square-outline" size={20} color={cameraColor} /></Pressable>
                                        :
                                        <Pressable onPress={() => onSameAddress(false)}><Icon name="checkbox" size={20} color={cameraColor} /></Pressable>
                                    }
                                    <Text color="#666666" fontSize="14" textAlign="center">{t("Same as above")}</Text>
                                </HStack>
                            </Stack>
                            {sameAddress ?
                                <Text color="#444444" fontSize="15" fontWeight="bold" textAlign="center">{t("Same as Communication Address")}</Text>
                                :
                                <View>
                                    <View style={styles.inputbox}>
                                        <Input size="lg" onChangeText={(text) => setAddress1Per(text)} variant="unstyled" InputLeftElement={<Icon name="location-outline" size={20} color="#666666" style={{ width: 25, marginLeft: 10, textAlign: 'center' }} />} placeholder={t("Address Line 1") + " *"} />
                                    </View>
                                    <View style={styles.inputbox}>
                                        <Input size="lg" onChangeText={(text) => setAddress2Per(text)} variant="unstyled" InputLeftElement={<Icon name="location-outline" size={20} color="#666666" style={{ width: 25, marginLeft: 10, textAlign: 'center' }} />} placeholder={t("Address Line 2") + " *"} />
                                    </View>
                                    <View style={styles.inputbox}>
                                        <Input size="lg" onChangeText={(text) => setLandMarkPer(text)} variant="unstyled" InputLeftElement={<Icon name="location-outline" size={20} color="#666666" style={{ width: 25, marginLeft: 10, textAlign: 'center' }} />} placeholder={t("Nearest Landmark")} />
                                    </View>
                                    <Pressable style={styles.inputbox} onPress={() => onStateOpen("permanent")}>
                                        <Input size="lg" readOnly variant="unstyled" value={statePer.name}
                                            InputLeftElement={<Icon name="location-outline" size={20} color="#666666" style={{ width: 25, marginLeft: 10, textAlign: 'center' }} />}
                                            InputRightElement={<Icon name="chevron-down-outline" size={30} color="#777777" style={{ width: 25, marginRight: 10, textAlign: 'center' }} />}
                                            placeholder={t("Select State") + " *"} />
                                    </Pressable>
                                    {statePer != "" && (
                                        <View style={styles.inputbox}>
                                            <Select variant="underlined" size="lg" placeholder={t("Select District") + " *"}
                                                InputLeftElement={<Icon name="location-outline" size={20} color="#666666" style={{ width: 25, marginLeft: 10, marginRight: 10, textAlign: 'center' }} />}
                                                selectedValue={districtPer}
                                                onValueChange={value => onSelectDistrict(value, "permanent")}
                                                _selectedItem={{
                                                    backgroundColor: '#eeeeee',
                                                    endIcon: <Icon name="checkmark-circle" size={22} color="#2BBB86" style={{ right: 0, position: 'absolute' }} />
                                                }}>
                                                {districtListPer.map((item, index) =>
                                                    <Select.Item key={index} label={item.name} value={item.id} />
                                                )}
                                            </Select>
                                        </View>
                                    )}
                                    <View style={styles.inputbox}>
                                        <Input size="lg" onChangeText={(text) => setCityPer(text)} variant="unstyled" InputLeftElement={<Icon name="location-outline" size={20} color="#666666" style={{ width: 25, marginLeft: 10, textAlign: 'center' }} />} placeholder={t("City")} />
                                    </View>
                                    <View style={styles.inputbox}>
                                        <Input size="lg" keyboardType='number-pad' maxLength={6} onChangeText={(text) => setPinCodePer(text)} variant="unstyled" InputLeftElement={<Icon name="location-outline" size={20} color="#666666" style={{ width: 25, marginLeft: 10, textAlign: 'center' }} />} placeholder={t("Pincode") + " *"} />
                                    </View>
                                </View>
                            }
                        </Box>
                        <Box style={[styles.productbox, { display: registrationType.name == "For Both" ? "flex" : registrationType.name == "Vriddhi" ? "flex" : "none" }]}>
                            <Stack borderColor="#bbbbbb" borderBottomWidth={1} mb="4" pb="3">
                                <Text color={darkColor} fontSize="16" fontWeight="bold" textAlign="center">{t("Vriddhi Dealer Details")}</Text>
                            </Stack>
                            {primaryDealer == "" ?
                                <HStack justifyContent="space-between">
                                    <View style={[styles.inputbox, { width: '73%' }]}>
                                        <Input size="lg" value={searchDealer} onChangeText={(text) => setSearchDealer(text)} variant="unstyled" InputLeftElement={<Icon name="search-outline" size={20} color="#666666" style={{ width: 25, marginLeft: 10, textAlign: 'center' }} />} placeholder={t("Primary Dealer") + " *"} />
                                    </View>
                                    <Button size="xs" style={[styles.custbtn, { width: '25%', marginVertical: 7, backgroundColor: "#777777" }]} onPress={() => onDealerOpen("dealer", "primary", orgID == orgNVCL ? "" : altContactId, 1)}>
                                        <Text color="#ffffff" fontSize="md" fontWeight="medium">{t("Search")}</Text>
                                    </Button>
                                </HStack>
                                :
                                <HStack justifyContent="space-between" alignItems="center" mb="3">
                                    <View style={{ width: '80%' }}>
                                        <Text color={darkColor} fontSize="12">{t("Primary Dealer Code")} *</Text>
                                        <Text color="#111111" fontSize="16" fontWeight="bold" >{primaryDealer.shop_name}</Text>
                                        <Text color="#999999" fontSize="12" fontWeight="bold" >({primaryDealer.phone})</Text>
                                    </View>
                                    <Button size="xs" variant="link" onPress={() => onDealerCancel("primary")}>
                                        <Icon name="close-circle-outline" size={30} color={cameraColor} />
                                    </Button>
                                </HStack>
                            }
                            {primaryDealer != "" && secondDealer == "" && (
                                <HStack justifyContent="space-between">
                                    <View style={[styles.inputbox, { width: '73%' }]}>
                                        <Input size="lg" value={searchDealer} onChangeText={(text) => setSearchDealer(text)} variant="unstyled" InputLeftElement={<Icon name="search-outline" size={20} color="#666666" style={{ width: 25, marginLeft: 10, textAlign: 'center' }} />} placeholder={t("Secondary Dealer 1")} />
                                    </View>
                                    <Button size="xs" style={[styles.custbtn, { width: '25%', height: 42, marginVertical: 7, backgroundColor: "#777777" }]} onPress={() => onDealerOpen("dealer", "second", orgID == orgNVCL ? "" : altContactId, 0)}>
                                        <Text color="#ffffff" fontSize="md" fontWeight="medium">{t("Search")}</Text>
                                    </Button>
                                </HStack>
                            )}
                            {secondDealer != "" && (
                                <HStack justifyContent="space-between" alignItems="center" mb="3">
                                    <View style={{ width: '80%' }}>
                                        <Text color={darkColor} fontSize="12">{t("Secondary Dealer 1")}</Text>
                                        <Text color="#111111" fontSize="16" fontWeight="bold" >{secondDealer.shop_name}</Text>
                                        <Text color="#999999" fontSize="12" fontWeight="bold" >({secondDealer.phone})</Text>
                                    </View>
                                    <Button size="xs" variant="link" onPress={() => onDealerCancel("second")}>
                                        <Icon name="close-circle-outline" size={30} color={cameraColor} />
                                    </Button>
                                </HStack>
                            )}
                            {secondDealer != "" && thirdDealer == "" && (
                                <HStack justifyContent="space-between">
                                    <View style={[styles.inputbox, { width: '73%' }]}>
                                        <Input size="lg" value={searchDealer} onChangeText={(text) => setSearchDealer(text)} variant="unstyled" InputLeftElement={<Icon name="search-outline" size={20} color="#666666" style={{ width: 25, marginLeft: 10, textAlign: 'center' }} />} placeholder={t("Secondary Dealer 2")} />
                                    </View>
                                    <Button size="xs" style={[styles.custbtn, { width: '25%', height: 42, marginVertical: 7, backgroundColor: "#777777" }]} onPress={() => onDealerOpen("dealer", "thrid", orgID == orgNVCL ? "" : altContactId, 0)}>
                                        <Text color="#ffffff" fontSize="md" fontWeight="medium">{t("Search")}</Text>
                                    </Button>
                                </HStack>
                            )}
                            {thirdDealer != "" && (
                                <HStack justifyContent="space-between" alignItems="center">
                                    <View style={{ width: '80%' }}>
                                        <Text color={darkColor} fontSize="12">{t("Secondary Dealer 2")}</Text>
                                        <Text color="#111111" fontSize="16" fontWeight="bold" >{thirdDealer.shop_name}</Text>
                                        <Text color="#999999" fontSize="12" fontWeight="bold" >({thirdDealer.phone})</Text>
                                    </View>
                                    <Button size="xs" variant="link" onPress={() => onDealerCancel("thrid")}>
                                        <Icon name="close-circle-outline" size={30} color={cameraColor} />
                                    </Button>
                                </HStack>
                            )}
                        </Box>
                        <Box style={[styles.productbox, { display: registrationType.name == "For Both" ? "flex" : registrationType.name == "Nipun" ? "flex" : "none" }]}>
                            <Stack borderColor="#bbbbbb" borderBottomWidth={1} mb="4" pb="3">
                                <Text color={darkColor} fontSize="16" fontWeight="bold" textAlign="center">{t("Nipun Dealer Details")}</Text>
                            </Stack>
                            {altPrimaryDealer == "" ?
                                <HStack justifyContent="space-between">
                                    <View style={[styles.inputbox, { width: '73%' }]}>
                                        <Input size="lg" value={searchAltDealer} onChangeText={(text) => setSearchAltDealer(text)} variant="unstyled" InputLeftElement={<Icon name="search-outline" size={20} color="#666666" style={{ width: 25, marginLeft: 10, textAlign: 'center' }} />} placeholder={t("Primary Dealer") + " *"} />
                                    </View>
                                    <Button size="xs" style={[styles.custbtn, { width: '25%', marginVertical: 7, backgroundColor: "#777777" }]} onPress={() => onDealerOpen("alt_dealer", "alt_primary", orgID == orgNVL ? "" : altContactId, 1)}>
                                        <Text color="#ffffff" fontSize="md" fontWeight="medium">{t("Search")}</Text>
                                    </Button>
                                </HStack>
                                :
                                <HStack justifyContent="space-between" alignItems="center" mb="3">
                                    <View style={{ width: '80%' }}>
                                        <Text color={darkColor} fontSize="12">{t("Primary Dealer Code")} *</Text>
                                        <Text color="#111111" fontSize="16" fontWeight="bold" >{altPrimaryDealer.shop_name}</Text>
                                        <Text color="#999999" fontSize="12" fontWeight="bold" >({altPrimaryDealer.phone})</Text>
                                    </View>
                                    <Button size="xs" variant="link" onPress={() => onDealerCancel("alt_primary")}>
                                        <Icon name="close-circle-outline" size={30} color={cameraColor} />
                                    </Button>
                                </HStack>
                            }
                            {altPrimaryDealer != "" && altSecondDealer == "" && (
                                <HStack justifyContent="space-between">
                                    <View style={[styles.inputbox, { width: '73%' }]}>
                                        <Input size="lg" value={searchAltDealer} onChangeText={(text) => setSearchAltDealer(text)} variant="unstyled" InputLeftElement={<Icon name="search-outline" size={20} color="#666666" style={{ width: 25, marginLeft: 10, textAlign: 'center' }} />} placeholder={t("Secondary Dealer 1")} />
                                    </View>
                                    <Button size="xs" style={[styles.custbtn, { width: '25%', height: 42, marginVertical: 7, backgroundColor: "#777777" }]} onPress={() => onDealerOpen("alt_dealer", "alt_second", orgID == orgNVL ? "" : altContactId, 0)}>
                                        <Text color="#ffffff" fontSize="md" fontWeight="medium">{t("Search")}</Text>
                                    </Button>
                                </HStack>
                            )}
                            {altSecondDealer != "" && (
                                <HStack justifyContent="space-between" alignItems="center" mb="3">
                                    <View style={{ width: '80%' }}>
                                        <Text color={darkColor} fontSize="12">{t("Secondary Dealer 1")}</Text>
                                        <Text color="#111111" fontSize="16" fontWeight="bold" >{altSecondDealer.shop_name}</Text>
                                        <Text color="#999999" fontSize="12" fontWeight="bold" >({altSecondDealer.phone})</Text>
                                    </View>
                                    <Button size="xs" variant="link" onPress={() => onDealerCancel("alt_second")}>
                                        <Icon name="close-circle-outline" size={30} color={cameraColor} />
                                    </Button>
                                </HStack>
                            )}
                            {altSecondDealer != "" && altThirdDealer == "" && (
                                <HStack justifyContent="space-between">
                                    <View style={[styles.inputbox, { width: '73%' }]}>
                                        <Input size="lg" value={searchAltDealer} onChangeText={(text) => setSearchAltDealer(text)} variant="unstyled" InputLeftElement={<Icon name="search-outline" size={20} color="#666666" style={{ width: 25, marginLeft: 10, textAlign: 'center' }} />} placeholder={t("Secondary Dealer 2")} />
                                    </View>
                                    <Button size="xs" style={[styles.custbtn, { width: '25%', height: 42, marginVertical: 7, backgroundColor: "#777777" }]} onPress={() => onDealerOpen("alt_dealer", "alt_thrid", orgID == orgNVL ? "" : altContactId, 0)}>
                                        <Text color="#ffffff" fontSize="md" fontWeight="medium">{t("Search")}</Text>
                                    </Button>
                                </HStack>
                            )}
                            {altThirdDealer != "" && (
                                <HStack justifyContent="space-between" alignItems="center">
                                    <View style={{ width: '80%' }}>
                                        <Text color={darkColor} fontSize="12">{t("Secondary Dealer 2")}</Text>
                                        <Text color="#111111" fontSize="16" fontWeight="bold" >{altThirdDealer.shop_name}</Text>
                                        <Text color="#999999" fontSize="12" fontWeight="bold" >({altThirdDealer.phone})</Text>
                                    </View>
                                    <Button size="xs" variant="link" onPress={() => onDealerCancel("alt_thrid")}>
                                        <Icon name="close-circle-outline" size={30} color={cameraColor} />
                                    </Button>
                                </HStack>
                            )}
                        </Box>
                        <Box style={styles.productbox}>
                            <Stack borderColor="#bbbbbb" borderBottomWidth={1} mb="4" pb="3">
                                <Text color={darkColor} fontSize="16" fontWeight="bold" textAlign="center">{t("KYC Details")}</Text>
                            </Stack>
                            <View style={styles.inputbox}>
                                <Input size="lg" value={aadhaarCard} readOnly keyboardType='number-pad' maxLength={12} variant="unstyled" InputLeftElement={<Icon name="card-outline" size={20} color="#666666" style={{ width: 25, marginLeft: 10, textAlign: 'center' }} />} placeholder={t("Aadhaar Card No.") + " *"} />
                            </View>
                            <HStack alignItems="center" mt="3" space={0}>
                                <Icon name="attach-outline" size={22} color="#666666" />
                                <Text color="#666666" fontSize="md" textTransform="capitalize">{t("Attach Aadhaar Front Image")} *</Text>
                            </HStack>
                            <View style={styles.inputbox}>
                                <Image source={aadhaarFrontImage != "" ? { uri: 'data:image/jpeg;base64,' + aadhaarFrontImage } : require('../assets/images/noimage.jpg')} alt="image" resizeMode='contain' style={{ width: '100%', height: 160 }} />
                                <Pressable onPress={() => onPickerOpen("AadhaarFrontImage")} bg={cameraColor} position="absolute" bottom="3" right="3" width="50" height="50" justifyContent="center" alignItems="center" borderRadius="30" overflow="hidden">
                                    <Icon name="camera" size={26} color="#ffffff" />
                                </Pressable>
                            </View>
                            <HStack alignItems="center" mt="3" space={0}>
                                <Icon name="attach-outline" size={22} color="#666666" />
                                <Text color="#666666" fontSize="md" textTransform="capitalize">{t("Attach Aadhaar Back Image")} *</Text>
                            </HStack>
                            <View style={styles.inputbox}>
                                <Image source={aadhaarBackImage != "" ? { uri: 'data:image/jpeg;base64,' + aadhaarBackImage } : require('../assets/images/noimage.jpg')} alt="image" resizeMode='contain' style={{ width: '100%', height: 160 }} />
                                <Pressable onPress={() => onPickerOpen("AadhaarBackImage")} bg={cameraColor} position="absolute" bottom="3" right="3" width="50" height="50" justifyContent="center" alignItems="center" borderRadius="30" overflow="hidden">
                                    <Icon name="camera" size={26} color="#ffffff" />
                                </Pressable>
                            </View>
                            {panCard != "" && (
                                <View style={styles.inputbox}>
                                    <Input size="lg" value={panCard} readOnly variant="unstyled" maxLength={10} InputLeftElement={<Icon name="card-outline" size={20} color="#666666" style={{ width: 25, marginLeft: 10, textAlign: 'center' }} />} placeholder={t("Pan Card No.")} />
                                </View>
                            )}
                            {panCard != "" && (
                                <View>
                                    <HStack alignItems="center" mt="3" space={0}>
                                        <Icon name="attach-outline" size={22} color="#666666" />
                                        <Text color="#666666" fontSize="md" textTransform="capitalize">{t("Attach Pan Image")} *</Text>
                                    </HStack>
                                    <View style={styles.inputbox}>
                                        <Image source={panImage != "" ? { uri: 'data:image/jpeg;base64,' + panImage } : require('../assets/images/noimage.jpg')} alt="image" resizeMode='contain' style={{ width: '100%', height: 160 }} />
                                        <Pressable onPress={() => onPickerOpen("PanImage")} bg={cameraColor} position="absolute" bottom="3" right="3" width="50" height="50" justifyContent="center" alignItems="center" borderRadius="30" overflow="hidden">
                                            <Icon name="camera" size={26} color="#ffffff" />
                                        </Pressable>
                                    </View>
                                </View>
                            )}
                        </Box>
                        {/* <Box style={styles.productbox}>
                            <Text fontWeight={'bold'} color={"#777777"}>
                                {t("Information is accurate. I submit the documents to Nuvoco's CRM and Loyalty program.")}
                            </Text>
                            <HStack paddingRight="10" marginTop="4" flexWrap="wrap">
                                <Checkbox shadow={2} onChange={() => setTermsCheck(!termsCheck)} accessibilityLabel="Checkbox">
                                    {t("I have also read and agreed to the terms of services and privacy policy.")}
                                </Checkbox>
                            </HStack>
                        </Box> */}
                    </Box>
                    <Actionsheet isOpen={isPicker} onClose={onPickerClose}>
                        <Actionsheet.Content>
                            <Text color="#666666" fontSize="md" textAlign="center">{t("Select Image Source")}</Text>
                            <Actionsheet.Item onPress={() => openProfilePicker("library")}>{t("Load from Library")}</Actionsheet.Item>
                            <Actionsheet.Item onPress={() => openProfilePicker("camera")}>{t("Use Camera")}</Actionsheet.Item>
                            <Actionsheet.Item onPress={() => openProfilePicker("cancel")}>{t("Cancel")}</Actionsheet.Item>
                        </Actionsheet.Content>
                    </Actionsheet>
                </ScrollView>
                <LinearGradient
                    colors={[darkColor, lightColor]}
                    start={{ x: 0.5, y: 0 }}
                >
                    <HStack paddingY="3" paddingX="6" justifyContent="space-between" alignContent="center">
                        <Button variant="outline" style={[styles.outlinebtn, { borderColor: '#111111', borderWidth: 2, width: '48%' }]} onPress={() => setPop(true)}>
                            <Text color="#111111" fontSize="md" fontWeight="medium">{t("Previous")}</Text>
                        </Button>
                        <Button style={[styles.custbtn, { backgroundColor: '#111111', borderColor: '#111111', borderWidth: 2, width: '48%' }]} onPress={() => onCheckSubmit()}>
                            <Text color="#ffffff" fontSize="md" fontWeight="medium">{t("Submit")}</Text>
                        </Button>
                    </HStack>
                </LinearGradient>
            </Box>
            {pop && (
                <View style={styles.spincontainer}>
                    <Stack style={{ width: 330, borderRadius: 15, overflow: 'hidden', backgroundColor: '#ffffff' }}>
                        <LinearGradient
                            colors={[darkColor, lightColor]}
                            start={{ x: 0.5, y: 0 }}
                            style={{ padding: 8 }}
                        >
                            <HStack justifyContent="center" alignContent="center">
                                <Text mt={2} mb={2} fontSize="md" fontWeight="bold" color="#111111">{t("New Enrollment")}</Text>
                            </HStack>
                        </LinearGradient>
                        <ScrollView style={{ maxHeight: 600 }}>
                            <VStack w="100%" paddingY="3" paddingX="5" alignItems="center" justifyContent="center">
                                <Radio.Group defaultValue={registrationType} onChange={value => setRegistrationType(value)}>
                                    <HStack space={4} marginY={3}>
                                        {registrtionOrg.map((item, index) =>
                                            <Radio key={index} value={item} colorScheme="green" size="sm" my={1}>{item.name}</Radio>
                                        )}
                                    </HStack>
                                </Radio.Group>
                                <View style={[styles.inputbox, { marginBottom: 1 }]}>
                                    <Input size="md" value={fullName} onChangeText={(text) => setFullName(text)} variant="unstyled" InputLeftElement={<Icon name="person-outline" size={20} color="#666666" style={{ width: 25, marginLeft: 10, textAlign: 'center' }} />} placeholder={t("Full Name") + " *"} />
                                </View>
                                <Text fontSize="xs" color="#ff001a" marginBottom={1}>{t("Full Name as per Aadhaar or PAN")}</Text>
                                <View style={[styles.inputbox, { marginBottom: 1 }]}>
                                    <Input size="md" value={mobile} onChangeText={(text) => setMobile(text)} keyboardType='number-pad' maxLength={10} variant="unstyled" InputLeftElement={<Icon name="logo-whatsapp" size={20} color="#666666" style={{ width: 25, marginLeft: 10, textAlign: 'center' }} />} placeholder={t("WhatsApp / Mobile Number") + " *"} />
                                </View>
                                <Text fontSize="xs" color="#ff001a" marginBottom={1}>{t("WhatsApp Number preferred")}</Text>
                                <View style={styles.inputbox}>
                                    <Select variant="underlined" size="md" placeholder={t("Nature of Business") + " *"}
                                        InputLeftElement={<Icon name="list-outline" size={20} color="#666666" style={{ width: 25, marginLeft: 10, marginRight: 10, textAlign: 'center' }} />}
                                        selectedValue={member}
                                        onValueChange={value => onSetMember(value)}
                                        _selectedItem={{
                                            backgroundColor: '#eeeeee',
                                            endIcon: <Icon name="checkmark-circle" size={22} color="#2BBB86" style={{ right: 0, position: 'absolute' }} />
                                        }}>
                                        {memberList.map((item, index) =>
                                            <Select.Item key={index} label={item.value} value={item.value} />
                                        )}
                                    </Select>
                                </View>
                                {member != "" && (
                                    <View style={styles.inputbox}>
                                        {member == "Contractor" ?
                                            <Input size="md" value={email} onChangeText={(text) => setEmail(text)} keyboardType='email-address' variant="unstyled" InputLeftElement={<Icon name="mail-outline" size={20} color="#666666" style={{ width: 25, marginLeft: 10, textAlign: 'center' }} />} placeholder={t("Email")} />
                                            :
                                            <Input size="md" value={email} onChangeText={(text) => setEmail(text)} keyboardType='email-address' variant="unstyled" InputLeftElement={<Icon name="mail-outline" size={20} color="#666666" style={{ width: 25, marginLeft: 10, textAlign: 'center' }} />} placeholder={t("Email") + " *"} />
                                        }
                                    </View>
                                )}
                                <View style={styles.inputbox}>
                                    <Input size="md" value={aadhaarCard} keyboardType='number-pad' maxLength={12} onChangeText={(text) => setAadhaarCard(text)} variant="unstyled" InputLeftElement={<Icon name="card-outline" size={20} color="#666666" style={{ width: 25, marginLeft: 10, textAlign: 'center' }} />} placeholder={t("Aadhaar Card No.") + " *"} />
                                </View>
                                <View style={styles.inputbox}>
                                    <Input size="md" value={panCard} onChangeText={(text) => setPanCard(text)} variant="unstyled" maxLength={10} InputLeftElement={<Icon name="card-outline" size={20} color="#666666" style={{ width: 25, marginLeft: 10, textAlign: 'center' }} />} placeholder={t("Pan Card No.")} />
                                </View>
                                <Button style={[styles.custbtn, { backgroundColor: '#111111' }]} onPress={() => onValidate()} marginY={2} marginTop={5}>
                                    <Text color="#ffffff" fontSize="sm" fontWeight="medium">{t("Validate")}</Text>
                                </Button>
                                <Button size="xs" style={[styles.custbtn, { backgroundColor: '#ffffff', borderColor: '#111111', borderWidth: 1, marginBottom: 10 }]} onPress={() => navigation.goBack()}>
                                    <Text color="#111111" fontSize="sm" fontWeight="medium">{t("Back")}</Text>
                                </Button>
                            </VStack>
                        </ScrollView>
                    </Stack>
                </View>
            )}
            {popOTP && (
                <View style={styles.spincontainer}>
                    <LinearGradient
                        colors={['#ffffff', lightColor]}
                        start={{ x: 0.5, y: 0 }}
                        style={{ width: 300, borderRadius: 15, overflow: 'hidden' }}
                    >
                        <ScrollView>
                            <VStack w="100%" paddingY="3" paddingX="5" alignItems="center" justifyContent="center">
                                <Text mt={5} mb={2} fontSize="md" fontWeight="bold" color="#111111">{t("Enter OTP & Verify")}</Text>
                                <Text color="#111111" fontSize="sm" textAlign="center" marginBottom={5}>{t("Registration Successfull. Enter OTP to validate Mobile Number.")}</Text>
                                <View style={[styles.inputbox, { backgroundColor: 'rgba(255,255,255,0.7)' }]}>
                                    <Input size="lg" onChangeText={(text) => setOtp(text)} keyboardType='number-pad' maxLength={6} variant="unstyled" InputLeftElement={<Icon name="key-outline" size={20} color="#f04e23" style={{ width: 25, marginLeft: 10, textAlign: 'center' }} />} placeholder={t("Enter OTP") + " *"} />
                                </View>
                                <TouchableOpacity style={{ alignSelf: 'center', marginVertical: 10 }} onPress={() => resendOtp()}>
                                    <Text color="#f04e23" fontSize="sm" fontWeight="bold" textAlign="center">{t("Resend OTP")}?</Text>
                                </TouchableOpacity>
                                <HStack justifyContent="space-between" width="100%" alignContent="center" marginY={5}>
                                    <Button size="xs" variant="outline" style={[styles.custbtn, { width: '48%', borderColor: '#111111', borderWidth: 1 }]} onPress={() => navigation.goBack()}>
                                        <Text color="#111111" fontSize="sm" fontWeight="medium">{t("Verify Later")}</Text>
                                    </Button>
                                    <Button style={[styles.custbtn, { width: '48%', backgroundColor: '#111111' }]} onPress={() => onVerify()}>
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
            <Actionsheet isOpen={isStateOpen} onClose={onStateClose}>
                <Actionsheet.Content>
                    <ScrollView style={{ width: '100%' }}>
                        {stateList.map((item, index) =>
                            <Actionsheet.Item onPress={() => onSelectState(item)} key={index}>{item.name}</Actionsheet.Item>
                        )}
                    </ScrollView>
                </Actionsheet.Content>
            </Actionsheet>
            <Actionsheet isOpen={isDealerOpen} onClose={onDealerClose}>
                <Actionsheet.Content>
                    <ScrollView style={{ width: '100%' }}>
                        {dealerList.map((item, index) =>
                            <Actionsheet.Item onPress={() => onSelectDealer(item)} key={index}>{item.shop_name}</Actionsheet.Item>
                        )}
                    </ScrollView>
                </Actionsheet.Content>
            </Actionsheet>
        </NativeBaseProvider>
    )
}

const styles = StyleSheet.create({
    bgimage: { flex: 1, justifyContent: 'center' },
    inputbox: { backgroundColor: 'rgba(0,0,0,0.06)', borderRadius: 12, width: '100%', overflow: 'hidden', marginVertical: 7 },
    custbtn: { width: '100%', borderRadius: 12, overflow: 'hidden' },
    outlinebtn: { width: '100%', borderRadius: 12, overflow: 'hidden' },
    productbox: { borderRadius: 15, width: '96%', margin: '2%', backgroundColor: '#f6f6f6', padding: 15, borderColor: '#ffffff', borderWidth: 2, elevation: 10, shadowColor: '#666666', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.4, shadowRadius: 10, overflow: 'hidden' },
    spincontainer: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0, 0, 0, 0.9)' },
});

export default NewEnrollmentScreen;
