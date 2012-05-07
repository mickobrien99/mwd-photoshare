package __ID__;

import android.app.Activity;
import android.os.Bundle;
import org.apache.cordova.*;

public class __ACTIVITY__ extends DroidGap
{
    @Override
    public void onCreate(Bundle savedInstanceState)
    {
        super.onCreate(savedInstanceState);
        super.loadUrl("file:///android_asset/www/index.html");
    }
    
    @Override
    public void onStart()
    {
       super.onStart();
       FlurryAgent.onStartSession(this, "F3XHB2C84CJ3PN8KV6SG");
    }
    
    @Override
    public void onStop()
    {
       super.onStop();
       FlurryAgent.onEndSession(this);
    }
}

