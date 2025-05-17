import Credential from '@arcgis/core/identity/Credential';
import IdentityManager from '@arcgis/core/identity/IdentityManager';
import OAuthInfo from '@arcgis/core/identity/OAuthInfo';
import Portal from '@arcgis/core/portal/Portal';

export let credential: Credential | null;
let oauthInfo: OAuthInfo;

/**
 * Register application ID and Portal URL
 * with the IdentityManager
 * @param appId
 * @param portalUrl
 */
export const initialize = () => {
  if (!oauthInfo) {
    oauthInfo = new OAuthInfo({
      appId: import.meta.env.VITE_ESRI_APP_ID,
      portalUrl: import.meta.env.VITE_ESRI_PORTAL_URL,
      popup: false
      /* flowType: 'auto' */
    });
    IdentityManager.registerOAuthInfos([oauthInfo]);
  }
};

/**
 * Check current logged in status for current portal
 */
export const checkCurrentStatus = () =>
  IdentityManager.checkSignInStatus(`${oauthInfo.portalUrl}/sharing`);

/**
 * Attempt to sign in,
 * first check current status
 * if not signed in, then go through
 * steps to get credentials
 */
export const signIn = async () => {
  if (!credential) {
    try {
      credential = await checkCurrentStatus();
    } catch {
      credential = await fetchCredentials();
    }
  }
  return credential;
};

/**
 * Sign the user out, but if we checked credentials
 * manually, make sure they are registered with
 * IdentityManager, so it can destroy them properly
 */
export const signOut = async () => {
  // make sure the identitymanager has
  // the credential so it can destroy it
  await signIn();
  IdentityManager.destroyCredentials();
  window.location.reload();
};

/**
 * Get the credentials for the provided portal
 */
export const fetchCredentials = async () => {
  credential = await IdentityManager.getCredential(
    `${oauthInfo.portalUrl}/sharing`,
    {
      error: undefined,
      oAuthPopupConfirmation: false,
      token: undefined
    }
  );
  return credential;
};

/**
 * Initializes authentication, signs in, and returns a loaded Portal object.
 * @returns {Promise<Portal>} A Promise that resolves with a loaded Portal object.
 */
export const auth = async (): Promise<Portal> => {
  initialize();
  await signIn();
  history.replaceState('', '', location.origin);
  const portal = new Portal();
  portal.authMode = 'immediate';
  await portal.load();
  return portal;
};
