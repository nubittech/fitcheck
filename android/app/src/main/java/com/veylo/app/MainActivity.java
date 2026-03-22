package com.veylo.app;

import android.content.res.Configuration;
import android.content.res.Resources;
import android.os.Bundle;
import androidx.activity.EdgeToEdge;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
  @Override
  protected void onCreate(Bundle savedInstanceState) {
    EdgeToEdge.enable(this);
    super.onCreate(savedInstanceState);
  }

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
