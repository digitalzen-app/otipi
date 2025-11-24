# 1. Install required packages
sudo apt update
sudo apt install -y wget unzip openjdk-11-jdk

# 2. Download the command line tools from Android repository
# wget https://dl.google.com/android/repository/commandlinetools-linux-8092744_latest.zip
latest=https://dl.google.com/android/repository/commandlinetools-linux-10406996_latest.zip
cmdlineToolsPath="/tmp/cmdline-tools.zip"
if [ ! -f "$cmdlineToolsPath" ]; then
    wget -O $cmdlineToolsPath $latest

    # 3. Create a directory for the Android SDK and move downloaded tools there
    mkdir -p $HOME/android-sdk/cmdline-tools
    unzip $cmdlineToolsPath -d $HOME/android-sdk/cmdline-tools
    mv $HOME/android-sdk/cmdline-tools/cmdline-tools $HOME/android-sdk/cmdline-tools/latest
    rm $cmdlineToolsPath
else
    echo "cmdline-tools.zip already exists in /tmp. Skipping download."
fi


# 4. Set environment variables temporarily for the current session
export ANDROID_SDK_ROOT=$HOME/android-sdk
export PATH=$PATH:$ANDROID_SDK_ROOT/cmdline-tools/latest/bin:$ANDROID_SDK_ROOT/emulator:$ANDROID_SDK_ROOT/platform-tools

# 5. Accept the licenses before installing components
yes | sdkmanager --licenses

# 6. Update sdkmanager and install emulator, platform-tools, and system images with Google APIs and Play Store (choose a correct API level)
sdkmanager --update
sdkmanager "platform-tools" "emulator"
sdkmanager "platforms;android-29" "system-images;android-29;google_apis_playstore;x86"

# 7. Create an Android Virtual Device (AVD) with Google Play
echo "no" | avdmanager create avd -n testEmulator -k "system-images;android-29;google_apis_playstore;x86" --device "pixel"

# 8. Start the emulator with the created AVD
emulator -avd testEmulator
