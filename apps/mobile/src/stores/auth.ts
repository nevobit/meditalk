import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import client from '../../../graphql';
import { gql } from '@apollo/client';
import { VERIFY_CODE_MUTATION } from '../graphql/index';
import { signInWithGoogle } from '../services/googleAuth';
import { signInWithApple } from '../services/appleAuth';

interface User {
    id: string;
    email: string;
    name: string;
    phoneNumber?: string;
    countryCode?: string;
    city?: string;
    state?: string;
    country?: string;
    latitude?: string;
    longitude?: string;
    companyName?: string;
    companyDescription?: string;
    companyLogo?: string;
    profilePicture?: string;
    createdAt?: string;
    updatedAt?: string;
    isProfileComplete?: boolean;
    isRecruiter?: boolean;
    skills?: Array<{
        id?: string;
        name: string;
        category?: string;
        experienceLevel?: string;
    }>;
    profileCompletion?: {
        percentage: number;
        isMinimallyComplete: boolean;
        currentStep?: number;
        completedCount?: number;
        completedFields?: string[];
        missingFields?: string[];
        nextRecommendedField?: string;
        suggestions?: string[];
        totalFields?: number;
    };
}

interface AuthState {
    // State
    user: User | null;
    token: string | null;
    refreshToken: string | null;
    isLoading: boolean;
    isAuthenticated: boolean;

    // Login/Registration flow state
    currentEmail: string | null;
    isCodeSent: boolean;
    isCodeVerified: boolean;
    userExists: boolean | null;

    // Registration progress (if user exists but profile incomplete)
    registrationSessionId: string | null;
    registrationCurrentStep: number;
    isRegistrationInProgress: boolean;

    // Actions
    setLoading: (loading: boolean) => void;
    setUser: (user: User | null) => void;
    setTokens: (token: string | null, refreshToken: string | null) => void;

    // Unified login/registration flow
    initiateAuth: (email: string) => Promise<{ success: boolean; message: string; userExists: boolean }>;
    verifyCode: (email: string, code: string) => Promise<{ success: boolean; message: string; user?: User; token?: string; refreshToken?: string; needsRegistration?: boolean; currentStep?: number }>;

    // Registration flow (for existing users with incomplete profiles)
    startRegistration: (email: string) => Promise<{ success: boolean; message: string; sessionId: string }>;
    finalizeRegistration: () => Promise<{ success: boolean; message: string; userId?: string }>;

    // User creation (for new users)
    createUser: (email: string) => Promise<{ success: boolean; message: string; user?: User }>;

    // Auth management
    logout: () => Promise<void>;
    refreshAuthToken: () => Promise<unknown>;
    getAuthHeaders: () => Record<string, string>;

    // Google Authentication
    signInWithGoogle: () => Promise<{ success: boolean; message: string; user?: User; token?: string; refreshToken?: string; needsRegistration?: boolean; currentStep?: number }>;

    // Apple Authentication
    signInWithApple: () => Promise<{ success: boolean; message: string; user?: User; token?: string; refreshToken?: string; needsRegistration?: boolean; currentStep?: number }>;

    // Flow management
    resetAuthFlow: () => void;
    setCodeSent: (sent: boolean) => void;
    setCodeVerified: (verified: boolean) => void;
    setUserExists: (exists: boolean | null) => void;
    setRegistrationProgress: (sessionId: string | null, currentStep: number) => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            // Initial state
            user: null,
            token: null,
            refreshToken: null,
            isLoading: false,
            isAuthenticated: false,

            // Login/Registration flow state
            currentEmail: null,
            isCodeSent: false,
            isCodeVerified: false,
            userExists: null,

            // Registration progress
            registrationSessionId: null,
            registrationCurrentStep: 1,
            isRegistrationInProgress: false,

            // Actions
            setLoading: (loading: boolean) => set({ isLoading: loading }),

            setUser: (user: User | null) => set({ user }),

            setTokens: (token: string | null, refreshToken: string | null) =>
                set({
                    token,
                    refreshToken,
                    isAuthenticated: !!(token && refreshToken)
                }),

            // Unified login/registration flow
            initiateAuth: async (email: string) => {
                set({ isLoading: true, currentEmail: email.toLowerCase() });

                try {
                    const LOGIN_MUTATION = gql`
                        mutation Login($email: String!) {
                            auth {
                                login(email: $email) {
                                    success
                                    message
                                    email
                                    userExists
                                    sessionId
                                }
                            }
                        }
                    `;

                    const { data } = await client.mutate({
                        mutation: LOGIN_MUTATION,
                        variables: { email: email.toLowerCase() }
                    });

                    if (!data?.auth?.login) {
                        throw new Error('No data received');
                    }

                    const result = data.auth.login;
                    set({
                        isCodeSent: result.success,
                        userExists: result.userExists,
                        registrationSessionId: result.sessionId,
                        isLoading: false
                    });

                    return result;
                } catch (error) {
                    set({ isLoading: false });
                    throw error;
                }
            },

            verifyCode: async (email: string, code: string) => {
                set({ isLoading: true });

                try {

                    const { data } = await client.mutate({
                        mutation: VERIFY_CODE_MUTATION,
                        variables: {
                            email: email.toLowerCase(),
                            code: code
                        }
                    });

                    if (!data?.auth?.verifyCode) {
                        throw new Error('No data received');
                    }

                    const authData = data.auth.verifyCode;
                    const user = authData.user;
                    const isProfileComplete = user.profileCompletion?.isMinimallyComplete ? true : false;
                    if (isProfileComplete) {
                        set({
                            user: user,
                            token: authData.token,
                            refreshToken: authData.refreshToken,
                            isAuthenticated: true,
                            isCodeVerified: true,
                            isLoading: false,
                            isRegistrationInProgress: false,
                            registrationSessionId: null,
                            registrationCurrentStep: 1
                        });

                        return {
                            success: true,
                            message: 'Login successful',
                            user: user,
                            token: authData.token,
                            refreshToken: authData.refreshToken,
                            needsRegistration: false
                        };
                    } else {
                        set({
                            user: user,
                            token: authData.token,
                            refreshToken: authData.refreshToken,
                            isAuthenticated: true,
                            isCodeVerified: true,
                            isLoading: false,
                            isRegistrationInProgress: true,
                            registrationCurrentStep: user.profileCompletion?.currentStep || 1,
                        });

                        return {
                            success: true,
                            message: 'Profile incomplete - continue registration',
                            user: user,
                            token: authData.token,
                            refreshToken: authData.refreshToken,
                            needsRegistration: true,
                            currentStep: user.profileCompletion?.currentStep || 1
                        };
                    }
                } catch (error) {
                    set({ isLoading: false });
                    throw error;
                }
            },

            startRegistration: async (email: string) => {
                set({ isLoading: true });

                try {
                    const START_REGISTRATION_MUTATION = gql`
                        mutation StartRegistration($email: String!) {
                            registration {
                                start(email: $email) {
                                    success
                                    message
                                    sessionId
                                }
                            }
                        }
                    `;

                    const { data } = await client.mutate({
                        mutation: START_REGISTRATION_MUTATION,
                        variables: { email: email.toLowerCase() }
                    });

                    if (!data?.registration?.start) {
                        throw new Error('No data received');
                    }

                    const result = data.registration.start;

                    if (result.success) {
                        set({
                            registrationSessionId: result.sessionId,
                            isRegistrationInProgress: true,
                            registrationCurrentStep: 1,
                            isLoading: false
                        });
                    }

                    return result;
                } catch (error) {
                    set({ isLoading: false });
                    throw error;
                }
            },


            finalizeRegistration: async () => {
                const { registrationSessionId } = get();
                if (!registrationSessionId) {
                    throw new Error('No active registration session');
                }

                set({ isLoading: true });

                try {
                    const FINALIZE_REGISTRATION_MUTATION = gql`
                        mutation FinalizeRegistration($sessionId: String!) {
                            registration {
                                finalize(sessionId: $sessionId) {
                                    success
                                    message
                                    userId
                                }
                            }
                        }
                    `;

                    const { data } = await client.mutate({
                        mutation: FINALIZE_REGISTRATION_MUTATION,
                        variables: { sessionId: registrationSessionId }
                    });

                    if (!data?.registration?.finalize) {
                        throw new Error('No data received');
                    }

                    const result = data.registration.finalize;

                    if (result.success) {
                        set({
                            isRegistrationInProgress: false,
                            registrationSessionId: null,
                            registrationCurrentStep: 1,
                            isLoading: false
                        });
                    }

                    return result;
                } catch (error) {
                    set({ isLoading: false });
                    throw error;
                }
            },

            // User creation (for new users)
            createUser: async (email: string) => {
                set({ isLoading: true });

                try {
                    const CREATE_USER_MUTATION = gql`
                        mutation CreateUser($email: String!) {
                            auth {
                                createUser(email: $email) {
                                    success
                                    message
                                    user {
                                        id
                                        email
                                        name
                                    }
                                }
                            }
                        }
                    `;

                    const { data } = await client.mutate({
                        mutation: CREATE_USER_MUTATION,
                        variables: { email: email.toLowerCase() }
                    });

                    if (!data?.auth?.createUser) {
                        throw new Error('No data received');
                    }

                    const result = data.auth.createUser;

                    set({
                        isLoading: false
                    });

                    return result;
                } catch (error) {
                    set({ isLoading: false });
                    throw error;
                }
            },

            logout: async () => {
                set({
                    user: null,
                    token: null,
                    refreshToken: null,
                    isAuthenticated: false,
                    isLoading: false,
                    currentEmail: null,
                    isCodeSent: false,
                    isCodeVerified: false,
                    userExists: null,
                    registrationSessionId: null,
                    registrationCurrentStep: 1,
                    isRegistrationInProgress: false
                });
            },

            refreshAuthToken: async () => {
                const { refreshToken } = get();

                if (!refreshToken) {
                    throw new Error('No refresh token available');
                }

                try {
                    const REFRESH_TOKEN_MUTATION = gql`
                        mutation RefreshToken($refreshToken: String!) {
                            auth {
                                refreshToken(refreshToken: $refreshToken) {
                                    accessToken
                                    refreshToken
                                    user {
                                        id
                                        email
                                        name
                                    }
                                }
                            }
                        }
                    `;

                    const { data } = await client.mutate({
                        mutation: REFRESH_TOKEN_MUTATION,
                        variables: { refreshToken }
                    });

                    if (!data?.auth?.refreshToken) {
                        throw new Error('No data received');
                    }

                    const authData = data.auth.refreshToken;

                    set({
                        user: authData.user,
                        token: authData.accessToken,
                        refreshToken: authData.refreshToken,
                        isAuthenticated: true,
                    });

                    return authData;
                } catch (error) {
                    await get().logout();
                    throw error;
                }
            },

            // Google Authentication
            signInWithGoogle: async () => {
                set({ isLoading: true });

                try {
                    // Sign in with Google
                    const googleUser = await signInWithGoogle();

                    // Call your backend to authenticate with Google
                    const GOOGLE_AUTH_MUTATION = gql`
                        mutation GoogleAuth($googleUser: GoogleAuthInput!) {
                            auth {
                                googleAuth(googleUser: $googleUser) {
                                    success
                                    message
                                    user {
                                        id
                                        email
                                        name
                                        profileCompletion {
                                            percentage
                                            isMinimallyComplete
                                            currentStep
                                        }
                                    }
                                    token
                                    refreshToken
                                }
                            }
                        }
                    `;

                    const { data } = await client.mutate({
                        mutation: GOOGLE_AUTH_MUTATION,
                        variables: {
                            googleUser: {
                                id: googleUser.id,
                                email: googleUser.email,
                                name: googleUser.name,
                                photo: googleUser.photo,
                                familyName: googleUser.familyName,
                                givenName: googleUser.givenName,
                            }
                        }
                    });

                    if (!data?.auth?.googleAuth) {
                        throw new Error('No data received from Google authentication');
                    }

                    const authData = data.auth.googleAuth;
                    const user = authData.user;
                    const isProfileComplete = user.profileCompletion?.isMinimallyComplete || false;

                    if (isProfileComplete) {
                        set({
                            user: user,
                            token: authData.token,
                            refreshToken: authData.refreshToken,
                            isAuthenticated: true,
                            isLoading: false,
                            isRegistrationInProgress: false,
                            registrationSessionId: null,
                            registrationCurrentStep: 1
                        });

                        return {
                            success: true,
                            message: 'Google authentication successful',
                            user: user,
                            token: authData.token,
                            refreshToken: authData.refreshToken,
                            needsRegistration: false
                        };
                    } else {
                        set({
                            user: user,
                            token: authData.token,
                            refreshToken: authData.refreshToken,
                            isAuthenticated: true,
                            isLoading: false,
                            isRegistrationInProgress: true,
                            registrationCurrentStep: user.profileCompletion?.currentStep || 1,
                        });

                        return {
                            success: true,
                            message: 'Profile incomplete - continue registration',
                            user: user,
                            token: authData.token,
                            refreshToken: authData.refreshToken,
                            needsRegistration: true,
                            currentStep: user.profileCompletion?.currentStep || 1
                        };
                    }
                } catch (error) {
                    set({ isLoading: false });
                    throw error;
                }
            },

            // Apple Authentication
            signInWithApple: async () => {
                set({ isLoading: true });

                try {
                    // Sign in with Apple
                    const appleUser = await signInWithApple();

                    // Call your backend to authenticate with Apple
                    const APPLE_AUTH_MUTATION = gql`
                        mutation AppleAuth($appleUser: AppleAuthInput!) {
                            auth {
                                appleAuth(appleUser: $appleUser) {
                                    success
                                    message
                                    user {
                                        id
                                        email
                                        name
                                        profileCompletion {
                                            percentage
                                            isMinimallyComplete
                                            currentStep
                                        }
                                    }
                                    token
                                    refreshToken
                                }
                            }
                        }
                    `;

                    const { data } = await client.mutate({
                        mutation: APPLE_AUTH_MUTATION,
                        variables: {
                            appleUser: {
                                id: appleUser.id,
                                email: appleUser.email,
                                name: appleUser.name,
                                familyName: appleUser.familyName,
                                givenName: appleUser.givenName,
                                identityToken: appleUser.identityToken,
                                authorizationCode: appleUser.authorizationCode,
                            }
                        }
                    });

                    if (!data?.auth?.appleAuth) {
                        throw new Error('No data received from Apple authentication');
                    }

                    const authData = data.auth.appleAuth;
                    const user = authData.user;
                    const isProfileComplete = user.profileCompletion?.isMinimallyComplete || false;

                    if (isProfileComplete) {
                        set({
                            user: user,
                            token: authData.token,
                            refreshToken: authData.refreshToken,
                            isAuthenticated: true,
                            isLoading: false,
                            isRegistrationInProgress: false,
                            registrationSessionId: null,
                            registrationCurrentStep: 1
                        });

                        return {
                            success: true,
                            message: 'Apple authentication successful',
                            user: user,
                            token: authData.token,
                            refreshToken: authData.refreshToken,
                            needsRegistration: false
                        };
                    } else {
                        set({
                            user: user,
                            token: authData.token,
                            refreshToken: authData.refreshToken,
                            isAuthenticated: true,
                            isLoading: false,
                            isRegistrationInProgress: true,
                            registrationCurrentStep: user.profileCompletion?.currentStep || 1,
                        });

                        return {
                            success: true,
                            message: 'Profile incomplete - continue registration',
                            user: user,
                            token: authData.token,
                            refreshToken: authData.refreshToken,
                            needsRegistration: true,
                            currentStep: user.profileCompletion?.currentStep || 1
                        };
                    }
                } catch (error) {
                    set({ isLoading: false });
                    throw error;
                }
            },

            getAuthHeaders: () => {
                const { token } = get();

                if (!token) {
                    return {} as Record<string, string>;
                }

                return {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                } as Record<string, string>;
            },

            // Flow management
            resetAuthFlow: () => {
                set({
                    currentEmail: null,
                    isCodeSent: false,
                    isCodeVerified: false,
                    userExists: null,
                    registrationSessionId: null,
                    registrationCurrentStep: 1,
                    isRegistrationInProgress: false
                });
            },

            setCodeSent: (sent: boolean) => set({ isCodeSent: sent }),
            setCodeVerified: (verified: boolean) => set({ isCodeVerified: verified }),
            setUserExists: (exists: boolean | null) => set({ userExists: exists }),
            setRegistrationProgress: (sessionId: string | null, currentStep: number) =>
                set({ registrationSessionId: sessionId, registrationCurrentStep: currentStep }),
        }),
        {
            name: 'auth-storage',
            storage: createJSONStorage(() => AsyncStorage),
            partialize: (state) => ({
                user: state.user,
                token: state.token,
                refreshToken: state.refreshToken,
                isAuthenticated: state.isAuthenticated,
                currentEmail: state.currentEmail,
                isCodeSent: state.isCodeSent,
                isCodeVerified: state.isCodeVerified,
                userExists: state.userExists,
                registrationSessionId: state.registrationSessionId,
                registrationCurrentStep: state.registrationCurrentStep,
                isRegistrationInProgress: state.isRegistrationInProgress,
            }),
        }
    )
);
