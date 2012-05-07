package org.apache.photoshare;

import android.os.Bundle;
import org.apache.cordova.*;

public class photoshare extends DroidGap
{
    @Override
    public void onCreate(Bundle savedInstanceState)
    {
        super.onCreate(savedInstanceState);
        super.loadUrl("file:///android_asset/www/index.html");
    }
}

