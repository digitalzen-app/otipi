package io.ionic.starter;

import com.codetrixstudio.capacitor.GoogleAuth.GoogleAuth;
import com.getcapacitor.BridgeActivity;
import android.os.Bundle;

public class MainActivity extends BridgeActivity {
    // google auth
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        this.registerPlugin(GoogleAuth.class);
        super.onCreate(savedInstanceState);
    }
}
