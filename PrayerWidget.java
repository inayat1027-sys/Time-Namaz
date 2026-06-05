package com.namaztime.app;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.widget.RemoteViews;

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;

/**
 * Нативный Android home-screen виджет для приложения "Время Намаза".
 * Показывает текущую дату/время и открывает приложение по тапу.
 */
public class PrayerWidget extends AppWidgetProvider {

    @Override
    public void onUpdate(Context context, AppWidgetManager appWidgetManager, int[] appWidgetIds) {
        for (int appWidgetId : appWidgetIds) {
            RemoteViews views = new RemoteViews(context.getPackageName(),
                    context.getResources().getIdentifier("widget_layout", "layout", context.getPackageName()));

            // Текущая дата
            SimpleDateFormat sdfDate = new SimpleDateFormat("EEEE, d MMMM", new Locale("ru"));
            SimpleDateFormat sdfTime = new SimpleDateFormat("HH:mm", Locale.getDefault());
            Date now = new Date();
            int idDate = context.getResources().getIdentifier("widget_date", "id", context.getPackageName());
            int idTime = context.getResources().getIdentifier("widget_time", "id", context.getPackageName());
            int idRoot = context.getResources().getIdentifier("widget_root", "id", context.getPackageName());

            views.setTextViewText(idDate, sdfDate.format(now));
            views.setTextViewText(idTime, sdfTime.format(now));

            // Открытие приложения по тапу
            Intent launchIntent = context.getPackageManager().getLaunchIntentForPackage(context.getPackageName());
            if (launchIntent != null) {
                launchIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
                PendingIntent pendingIntent = PendingIntent.getActivity(
                        context, 0, launchIntent,
                        PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
                views.setOnClickPendingIntent(idRoot, pendingIntent);
            }

            appWidgetManager.updateAppWidget(appWidgetId, views);
        }
    }
}
