import { NavigatorScreenParams } from '@react-navigation/native';

export type AuthStackParamsList = {
    Onboarding: undefined;
    Signin: undefined;
    Email: undefined;
    VerificationCode: { email: string };
};

export type RegistrationStackParamsList = {
    RegistrationStep1: undefined;
    RegistrationStep2: undefined;
    RegistrationStep3: undefined;
    RegistrationStep4: undefined;
    RegistrationStep5: undefined;
};

export type RootStackParamsList = {
    Main: NavigatorScreenParams<TabNavigatorParamsList>;
    Registration: NavigatorScreenParams<RegistrationStackParamsList>;
    StartDiscussion: undefined;
    Notifications: undefined;
};

export type TabNavigatorParamsList = {
    Home: undefined;
    Projects: undefined;
    Work: undefined;
    Events: undefined;
    Profile: undefined;
};

export type AppNavigationParams = {
    Auth: NavigatorScreenParams<AuthStackParamsList>;
    Main: NavigatorScreenParams<RootStackParamsList>;
};
