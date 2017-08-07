package com.reversify;

import com.facebook.react.ReactActivity;
import android.content.Intent;
import android.graphics.Color;
import android.view.View;

public class MainActivity extends ReactActivity {
    @Override
    public void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        MainApplication.getCallbackManager().onActivityResult(requestCode, resultCode, data);
    }
    @Override
    public void setContentView(View view){
        super.setContentView(view);
        getWindow().getDecorView().setBackgroundColor(Color.BLACK);
    }
    /**
     * Returns the name of the main component registered from JavaScript.
     * This is used to schedule rendering of the component.
     */
    @Override
    protected String getMainComponentName() {
        return "reVersify";
    }
}
