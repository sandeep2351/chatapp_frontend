export const HOST = import.meta.env.VITE_SERVER_URL || 'http://localhost:9090'; // Default to localhost if not set

export const AUTH_ROUTES = `${HOST}/api/auth`;
export const SIGNUP_ROUTES = `${AUTH_ROUTES}/signup`;
export const LOGIN_ROUTES = `${AUTH_ROUTES}/login`;
export const GET_USER_INFO = `${AUTH_ROUTES}/userInfo`;
export const UPDATE_PROFILE_ROUTE = `${AUTH_ROUTES}/update-profile`;
export const ADD_PROFILE_IMAGE_ROUTE = `${AUTH_ROUTES}/add-profile-image`;
export const REMOVE_PROFILE_IMAGE_ROUTE = `${AUTH_ROUTES}/remove-profile-image`;
export const LOG_OUT_ROUTE = `${AUTH_ROUTES}/logout`;


export const CONTACT_ROUTES=`${HOST}/api/contacts`;
export const SEARCH_CONTACT_ROUTES = `${CONTACT_ROUTES}/search`;
export const  GET_DM_CONTACT_ROUTES=`${CONTACT_ROUTES}/get-contacts-dm`;
export const GET_ALL_CONTACTS_ROUTES=`${CONTACT_ROUTES}/get-all-contacts`;


export const MESSAGES_ROUTES=`${HOST}/api/messages`;
export const GET_ALL_MESSAGES_ROUTE=`${MESSAGES_ROUTES}/get-messages`;
export const UPLOAD_FILE_ROUTE = `${MESSAGES_ROUTES}/upload-file`;


export const CHANNEL_ROUTES=`${HOST}/api/channels`;
export const CREATE_CHANNELS_ROUTE=`${CHANNEL_ROUTES}/create-channels`;
export const GET_USER_CHANNELS_ROUTE=`${CHANNEL_ROUTES}/get-user-channel`
export const GET_CHANNEL_MESSAGES_ROUTE=`${CHANNEL_ROUTES}//get-channel-messages`;