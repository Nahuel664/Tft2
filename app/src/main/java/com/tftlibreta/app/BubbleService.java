package com.tftlibreta.app;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.pm.ServiceInfo;
import android.graphics.PixelFormat;
import android.graphics.Typeface;
import android.graphics.drawable.GradientDrawable;
import android.os.Build;
import android.os.IBinder;
import android.view.ContextThemeWrapper;
import android.view.Gravity;
import android.view.MotionEvent;
import android.view.View;
import android.view.WindowManager;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.widget.FrameLayout;
import android.widget.LinearLayout;
import android.widget.TextView;

public class BubbleService extends Service {
    private static final String URL = "file:///android_asset/libreta.html#burbuja";
    private WindowManager wm;
    private SharedPreferences sp;
    private Context ctx;
    private TextView bubble;
    private LinearLayout panel;
    private WebView web;
    private WindowManager.LayoutParams bp, pp;
    private boolean loaded = false;

    @Override
    public IBinder onBind(Intent i) { return null; }

    @Override
    public int onStartCommand(Intent i, int flags, int id) { return START_NOT_STICKY; }

    @Override
    public void onCreate() {
        super.onCreate();
        try {
            ctx = new ContextThemeWrapper(this, android.R.style.Theme_DeviceDefault);
            wm = (WindowManager) getSystemService(WINDOW_SERVICE);
            sp = getSharedPreferences("burbuja", MODE_PRIVATE);
            startFg();
            makeBubble();
            makePanel();
            wm.addView(bubble, bp);
        } catch (Exception e) {
            stopSelf();
        }
    }

    private void startFg() {
        String ch = "burbuja";
        NotificationManager nm = (NotificationManager) getSystemService(NOTIFICATION_SERVICE);
        Notification.Builder b;
        if (Build.VERSION.SDK_INT >= 26) {
            nm.createNotificationChannel(new NotificationChannel(ch, "Burbuja TFT", NotificationManager.IMPORTANCE_LOW));
            b = new Notification.Builder(this, ch);
        } else {
            b = new Notification.Builder(this);
        }
        Notification n = b.setContentTitle("TFT Libreta")
            .setContentText("Burbuja flotante activa")
            .setSmallIcon(android.R.drawable.ic_dialog_info).build();
        if (Build.VERSION.SDK_INT >= 34) {
            startForeground(1, n, ServiceInfo.FOREGROUND_SERVICE_TYPE_SPECIAL_USE);
        } else {
            startForeground(1, n);
        }
    }

    private int dp(int v) { return (int) (v * getResources().getDisplayMetrics().density); }

    private WindowManager.LayoutParams lp(int w, int h, int x, int y) {
        int type = Build.VERSION.SDK_INT >= 26
            ? WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY
            : WindowManager.LayoutParams.TYPE_PHONE;
        WindowManager.LayoutParams p = new WindowManager.LayoutParams(
            w, h, type, WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE, PixelFormat.TRANSLUCENT);
        p.gravity = Gravity.TOP | Gravity.START;
        p.x = x;
        p.y = y;
        return p;
    }

    private TextView label(String t, int size) {
        TextView v = new TextView(ctx);
        v.setText(t);
        v.setTextColor(0xFFECE7D9);
        v.setTextSize(size);
        return v;
    }

    private abstract class Drag implements View.OnTouchListener {
        float dx, dy;
        int sx, sy;
        boolean moved;
        abstract int[] start();
        abstract void move(int x, int y);
        abstract void end(boolean moved);

        @Override
        public boolean onTouch(View v, MotionEvent e) {
            switch (e.getAction()) {
                case MotionEvent.ACTION_DOWN: {
                    dx = e.getRawX();
                    dy = e.getRawY();
                    int[] s = start();
                    sx = s[0];
                    sy = s[1];
                    moved = false;
                    return true;
                }
                case MotionEvent.ACTION_MOVE: {
                    float mx = e.getRawX() - dx, my = e.getRawY() - dy;
                    if (Math.abs(mx) > dp(6) || Math.abs(my) > dp(6)) moved = true;
                    if (moved) move(sx + (int) mx, sy + (int) my);
                    return true;
                }
                case MotionEvent.ACTION_UP:
                case MotionEvent.ACTION_CANCEL: {
                    end(moved);
                    return true;
                }
            }
            return false;
        }
    }

    private void makeBubble() {
        bubble = new TextView(ctx);
        bubble.setText("TFT");
        bubble.setGravity(Gravity.CENTER);
        bubble.setTextColor(0xFF06201D);
        bubble.setTypeface(null, Typeface.BOLD);
        GradientDrawable g = new GradientDrawable();
        g.setShape(GradientDrawable.OVAL);
        g.setColor(0xFF35C2B3);
        bubble.setBackground(g);
        bp = lp(dp(56), dp(56), sp.getInt("bx", dp(8)), sp.getInt("by", dp(200)));
        bubble.setOnTouchListener(new Drag() {
            int[] start() { return new int[]{bp.x, bp.y}; }
            void move(int x, int y) { bp.x = x; bp.y = y; wm.updateViewLayout(bubble, bp); }
            void end(boolean m) {
                if (m) sp.edit().putInt("bx", bp.x).putInt("by", bp.y).apply(); else expand();
            }
        });
    }

    private void makePanel() {
        pp = lp(sp.getInt("pw", dp(300)), sp.getInt("ph", dp(380)), sp.getInt("px", dp(20)), sp.getInt("py", dp(120)));
        panel = new LinearLayout(ctx);
        panel.setOrientation(LinearLayout.VERTICAL);
        GradientDrawable bg = new GradientDrawable();
        bg.setColor(0xFF0E1822);
        bg.setCornerRadius(dp(12));
        bg.setStroke(dp(1), 0xFF35C2B3);
        panel.setBackground(bg);

        LinearLayout head = new LinearLayout(ctx);
        head.setOrientation(LinearLayout.HORIZONTAL);
        head.setGravity(Gravity.CENTER_VERTICAL);
        head.setBackgroundColor(0xFF16283A);
        head.addView(label("  TFT Libreta", 14), new LinearLayout.LayoutParams(0, dp(40), 1f));
        TextView min = label("–", 20);
        min.setGravity(Gravity.CENTER);
        min.setOnClickListener(v -> collapse());
        head.addView(min, new LinearLayout.LayoutParams(dp(44), dp(40)));
        TextView close = label("✕", 16);
        close.setGravity(Gravity.CENTER);
        close.setOnClickListener(v -> stopSelf());
        head.addView(close, new LinearLayout.LayoutParams(dp(44), dp(40)));
        head.setOnTouchListener(new Drag() {
            int[] start() { return new int[]{pp.x, pp.y}; }
            void move(int x, int y) { pp.x = x; pp.y = y; wm.updateViewLayout(panel, pp); }
            void end(boolean m) { sp.edit().putInt("px", pp.x).putInt("py", pp.y).apply(); }
        });

        FrameLayout body = new FrameLayout(ctx);
        web = new WebView(ctx);
        web.setBackgroundColor(0xFF0E1822);
        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setAllowFileAccess(true);
        body.addView(web, new FrameLayout.LayoutParams(-1, -1));
        TextView grip = label("◢", 18);
        grip.setGravity(Gravity.CENTER);
        grip.setBackgroundColor(0x8035C2B3);
        body.addView(grip, new FrameLayout.LayoutParams(dp(36), dp(36), Gravity.BOTTOM | Gravity.END));
        grip.setOnTouchListener(new Drag() {
            int[] start() { return new int[]{pp.width, pp.height}; }
            void move(int x, int y) {
                pp.width = Math.max(dp(180), x);
                pp.height = Math.max(dp(200), y);
                wm.updateViewLayout(panel, pp);
            }
            void end(boolean m) { sp.edit().putInt("pw", pp.width).putInt("ph", pp.height).apply(); }
        });

        panel.addView(head, new LinearLayout.LayoutParams(-1, dp(40)));
        panel.addView(body, new LinearLayout.LayoutParams(-1, 0, 1f));
    }

    private void expand() {
        try {
            wm.removeView(bubble);
            wm.addView(panel, pp);
        } catch (Exception e) {
            return;
        }
        if (loaded) web.reload(); else { web.loadUrl(URL); loaded = true; }
    }

    private void collapse() {
        try {
            wm.removeView(panel);
            wm.addView(bubble, bp);
        } catch (Exception e) { }
    }

    @Override
    public void onDestroy() {
        try { wm.removeView(bubble); } catch (Exception e) { }
        try { wm.removeView(panel); } catch (Exception e) { }
        if (web != null) web.destroy();
        super.onDestroy();
    }
              }
