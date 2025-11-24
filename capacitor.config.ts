const config: CapacitorElectronConfig = {
    appId: "com.otipi.app",
    appName: "Otipi",
    webDir: "dist",
    server: {

        // androidScheme: "https",
        // url: "http://192.168.1.51:8100",
        cleartext: true,
        androidScheme: "http"
    },
    electron: {
        customUrlScheme: "otipi",
        hideMainWindowOnLaunch: false,
        deepLinkingEnabled: true,
        deepLinkingCustomProtocol: "otipi",
        backgroundColor: "#ffffff",
    },
    plugins: {
        GoogleAuth: {
            // ALL THIS IS NOT NEEDED AND SENT BY CLIENT
            // IF YOU HAVE something went wrong, code 10
            // then check your sha1 from gradle 
            scopes: ["https://www.googleapis.com/auth/drive.appdata"],
            // scopes: ['profile', 'email'],
            // serverClientId: "367883949459-46bqhcdv4vciie62rsjmpmteiipbf4bt.apps.googleusercontent.com",
            clientId: "367883949459-46bqhcdv4vciie62rsjmpmteiipbf4bt.apps.googleusercontent.com",
            // forceCodeForRefreshToken: false,
        },
    },
};

export default config;
