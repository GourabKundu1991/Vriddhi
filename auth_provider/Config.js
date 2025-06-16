import { Platform } from "react-native";

// UAT base url
//const BASE_URL = "https://uat-mandres.straightline.in/vriddhi/v16/vriddhi_req"

// LIVE base url
const BASE_URL = "https://api.straightline.in/vriddhi/v16/vriddhi_req"

export {BASE_URL};

export const API_KEY = '332827c90c411790ffa33170c13daa8efb12fd4c';
export const OS_TYPE = Platform.OS == 'ios' ? "ios" : "android";
export const APP_VERSION = Platform.OS == 'ios' ? "1.2.0" : "6.2.3";