package com.veylo.app;

import android.content.res.Configuration;
import android.content.res.Resources;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
  @Override
  public Resources getResources() {
    Resources res = super.getResources();
    Configuration config = new Configuration(res.getConfiguration());
    if (config.fontScale != 1.0f) {
      config.fontScale = 1.0f;
      return createConfigurationContext(config).getResources();
    }
    return res;
  }
}
