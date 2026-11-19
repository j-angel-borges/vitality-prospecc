import { auth, db } from '@/firebase/firebaseClient';
import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

export type UserRole = 'ultra_admin' | 'superadmin' | 'sales_rep';

export interface CrmUserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: UserRole;
  assignedRepName?: string; // 'Jose Angel' | 'Ricfel'
  assignedTabs?: string[];
  lastLogin?: any;
}

// Lista de correos con permisos SuperAdmin directos (Dueño / Cuenta Proyecto)
const SUPERADMIN_EMAILS = [
  'mipropiadinastia@gmail.com',
  'jangelborges@quarz.online'
];

const LS_GOOGLE_ACCESS_TOKEN = 'vitality_google_access_token_v2';

/**
 * Crea una nueva instancia de GoogleAuthProvider con scopes explícitos de Contactos y Calendario
 */
export function createGoogleProvider(): GoogleAuthProvider {
  const provider = new GoogleAuthProvider();
  // Scope estándar de Google People API para lectura de contactos
  provider.addScope('https://www.googleapis.com/auth/contacts.readonly');
  // Scope estándar de Google Calendar para sincronización y creación de eventos
  provider.addScope('https://www.googleapis.com/auth/calendar.events');
  provider.addScope('https://www.googleapis.com/auth/calendar.readonly');
  provider.addScope('https://www.googleapis.com/auth/userinfo.profile');
  provider.addScope('https://www.googleapis.com/auth/userinfo.email');
  
  // Forzar diálogo de consentimiento de Google para grantear los scopes solicitados
  provider.setCustomParameters({
    prompt: 'consent select_account',
    access_type: 'offline'
  });
  return provider;
}

export const googleProvider = createGoogleProvider();

export const getStoredAccessToken = (): string | null => {
  try {
    return localStorage.getItem(LS_GOOGLE_ACCESS_TOKEN);
  } catch {
    return null;
  }
};

export const setStoredAccessToken = (token: string | null) => {
  try {
    if (token) {
      localStorage.setItem(LS_GOOGLE_ACCESS_TOKEN, token);
    } else {
      localStorage.removeItem(LS_GOOGLE_ACCESS_TOKEN);
    }
  } catch {}
};

/**
 * Iniciar sesión con Google OAuth solicitando permisos de Contactos y Calendario
 */
export async function loginWithGoogle(customAdvisorName?: string): Promise<{ user: User; profile: CrmUserProfile; accessToken?: string }> {
  // Siempre crear un provider fresco con prompt consent
  const provider = createGoogleProvider();
  let result;
  try {
    result = await signInWithPopup(auth, provider);
  } catch (popupErr: any) {
    console.warn('[Auth] signInWithPopup advertencia:', popupErr?.code, popupErr?.message);
    if (
      popupErr?.code === 'auth/popup-blocked' ||
      popupErr?.code === 'auth/popup-closed-by-user' ||
      popupErr?.code === 'auth/cancelled-popup-request'
    ) {
      try {
        const { signInWithRedirect } = await import('firebase/auth');
        await signInWithRedirect(auth, provider);
        return new Promise(() => {}); // Espera el flujo de redirección móvil
      } catch (redirectErr) {
        throw popupErr;
      }
    }
    throw popupErr;
  }
  const credential = GoogleAuthProvider.credentialFromResult(result);
  const accessToken = credential?.accessToken;

  console.log('[Auth] Google Login exitoso. Access token presente:', !!accessToken);

  if (accessToken) {
    setStoredAccessToken(accessToken);
  }

  const user = result.user;
  const userDocRef = doc(db, 'crm_users', user.uid);
  const snap = await getDoc(userDocRef);

  let profile: CrmUserProfile;

  const emailLower = (user.email || '').toLowerCase();
  const isUltraAdmin = emailLower === 'mipropiadinastia@gmail.com';
  const isJoseAngel = emailLower.includes('jangelborges') || (customAdvisorName ? /jangel|jose|angel/i.test(customAdvisorName) : false);
  const isRicfel = emailLower.includes('r.olaizola') || emailLower.includes('ricfel') || (customAdvisorName ? /ricfel/i.test(customAdvisorName) : false);

  const cleanCustom = (customAdvisorName || '').trim();
  let assignedRole: UserRole = 'sales_rep';
  let assignedRep = 'Jangel';

  if (isUltraAdmin) {
    assignedRole = 'ultra_admin';
    assignedRep = 'ALL';
  } else if (isRicfel) {
    assignedRole = 'superadmin';
    assignedRep = 'Ricfel';
  } else if (isJoseAngel) {
    assignedRole = 'superadmin';
    assignedRep = 'Jangel';
  } else {
    assignedRole = 'sales_rep';
    assignedRep = cleanCustom || user.displayName || 'Asesor Comercial';
  }

  if (snap.exists()) {
    profile = snap.data() as CrmUserProfile;
    let needsUpdate = false;
    const updates: Partial<CrmUserProfile> = {};

    if (profile.role !== assignedRole) {
      profile.role = assignedRole;
      updates.role = assignedRole;
      needsUpdate = true;
    }
    if (cleanCustom && profile.displayName !== cleanCustom) {
      profile.displayName = cleanCustom;
      updates.displayName = cleanCustom;
      needsUpdate = true;
    } else if (isJoseAngel && profile.displayName !== 'Jangel') {
      profile.displayName = 'Jangel';
      updates.displayName = 'Jangel';
      needsUpdate = true;
    } else if (isRicfel && profile.displayName !== 'Ricfel') {
      profile.displayName = 'Ricfel';
      updates.displayName = 'Ricfel';
      needsUpdate = true;
    }

    if (profile.assignedRepName !== assignedRep) {
      profile.assignedRepName = assignedRep;
      updates.assignedRepName = assignedRep;
      needsUpdate = true;
    }

    if (needsUpdate) {
      await setDoc(userDocRef, { ...updates, updatedAt: serverTimestamp() }, { merge: true });
    }
  } else {
    // Crear perfil inicial
    profile = {
      uid: user.uid,
      email: user.email || '',
      displayName: cleanCustom 
        ? cleanCustom 
        : (isUltraAdmin 
          ? 'Ultra Admin (Dinastía)' 
          : (isJoseAngel ? 'Jangel' : (isRicfel ? 'Ricfel' : (user.displayName || 'Asesor Comercial')))),
      photoURL: user.photoURL || undefined,
      role: assignedRole,
      assignedRepName: assignedRep,
      lastLogin: serverTimestamp()
    };
    await setDoc(userDocRef, profile, { merge: true });
  }

  return { user, profile, accessToken };
}

/**
 * Procesa el retorno de autenticación por redirección (Android e iOS Safari)
 */
export async function handleRedirectAuth(): Promise<{ user: User; profile: CrmUserProfile } | null> {
  try {
    const { getRedirectResult } = await import('firebase/auth');
    const result = await getRedirectResult(auth);
    if (result) {
      const credential = GoogleAuthProvider.credentialFromResult(result);
      if (credential?.accessToken) {
        setStoredAccessToken(credential.accessToken);
      }
      const profile = await getUserProfile(result.user.uid, result.user.email);
      if (profile) {
        return { user: result.user, profile };
      }
    }
  } catch (err) {
    console.warn('[Auth] handleRedirectAuth note:', err);
  }
  return null;
}

/**
 * Cerrar sesión y purgar tokens de caché
 */
export async function logoutUser(): Promise<void> {
  setStoredAccessToken(null);
  try {
    localStorage.removeItem('vitality_google_access_token_v1');
    localStorage.removeItem('vitality_google_access_token_v2');
  } catch {}
  await signOut(auth);
}

/**
 * Obtener perfil de usuario desde Firestore
 */
export async function getUserProfile(uid: string, email?: string | null): Promise<CrmUserProfile | null> {
  try {
    const userDocRef = doc(db, 'crm_users', uid);
    const snap = await getDoc(userDocRef);
    if (snap.exists()) {
      const profile = snap.data() as CrmUserProfile;
      const emailLower = (profile.email || email || '').toLowerCase();
      if (emailLower === 'mipropiadinastia@gmail.com') {
        profile.role = 'ultra_admin';
        profile.assignedRepName = 'ALL';
      } else if (emailLower.includes('jangelborges')) {
        profile.role = 'superadmin';
        profile.assignedRepName = 'Jangel';
      } else if (emailLower.includes('r.olaizola') || emailLower.includes('ricfel')) {
        profile.role = 'superadmin';
        profile.assignedRepName = 'Ricfel';
      }
      return profile;
    }

    const emailLower = (email || '').toLowerCase();
    const isUltraAdmin = emailLower === 'mipropiadinastia@gmail.com';
    const isJoseAngel = emailLower.includes('jangelborges');
    const isRicfel = emailLower.includes('r.olaizola') || emailLower.includes('ricfel');

    let assignedRole: UserRole = 'sales_rep';
    let assignedRep = 'Jose Angel';

    if (isUltraAdmin) {
      assignedRole = 'ultra_admin';
      assignedRep = 'ALL';
    } else if (isRicfel) {
      assignedRole = 'superadmin';
      assignedRep = 'Ricfel';
    } else if (isJoseAngel) {
      assignedRole = 'superadmin';
      assignedRep = 'Jose Angel';
    } else {
      assignedRole = 'sales_rep';
      assignedRep = 'Asesor Comercial';
    }

    const defaultProfile: CrmUserProfile = {
      uid,
      email: email || '',
      displayName: isUltraAdmin 
        ? 'Ultra Admin (Dinastía)' 
        : (isJoseAngel ? 'José Angel (SuperAdmin)' : (isRicfel ? 'Ricfel (SuperAdmin)' : 'Asesor Vitality')),
      role: assignedRole,
      assignedRepName: assignedRep,
      lastLogin: serverTimestamp()
    };

    await setDoc(userDocRef, defaultProfile, { merge: true });
    return defaultProfile;
  } catch (e) {
    console.warn('Error obteniendo perfil de usuario:', e);
    return null;
  }
}

/**
 * Elimina un usuario de la colección crm_users en Firestore
 */
export async function deleteCrmUser(uid: string): Promise<void> {
  const { deleteDoc } = await import('firebase/firestore');
  const userDocRef = doc(db, 'crm_users', uid);
  await deleteDoc(userDocRef);
}

/**
 * Actualiza el perfil de un usuario en Firestore
 */
export async function updateUserProfile(uid: string, updates: Partial<CrmUserProfile>): Promise<void> {
  const userDocRef = doc(db, 'crm_users', uid);
  await setDoc(userDocRef, { ...updates, updatedAt: serverTimestamp() }, { merge: true });
}

/**
 * Obtiene la lista completa de usuarios registrados en el CRM
 */
export async function getAllCrmUsers(): Promise<CrmUserProfile[]> {
  try {
    const { collection, getDocs } = await import('firebase/firestore');
    const colRef = collection(db, 'crm_users');
    const snap = await getDocs(colRef);
    return snap.docs.map(d => d.data() as CrmUserProfile);
  } catch (e) {
    console.warn('Error leyendo crm_users:', e);
    return [];
  }
}
