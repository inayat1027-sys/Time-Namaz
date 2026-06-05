#!/usr/bin/env node
/**
 * Cordova hook: устанавливает нативный Android home-screen виджет
 * после prepare/platform add. Копирует Java + XML файлы в platforms/android
 * и регистрирует receiver в AndroidManifest.xml.
 */
const fs = require('fs');
const path = require('path');

module.exports = function (ctx) {
  const platformRoot = path.join(ctx.opts.projectRoot, 'platforms', 'android');
  if (!fs.existsSync(platformRoot)) {
    console.log('[install-widget] Android platform не добавлена, пропуск.');
    return;
  }

  const srcDir   = path.join(ctx.opts.projectRoot, 'android-widget');
  const javaDir  = path.join(platformRoot, 'app', 'src', 'main', 'java', 'com', 'namaztime', 'app');
  const layoutDir = path.join(platformRoot, 'app', 'src', 'main', 'res', 'layout');
  const xmlDir   = path.join(platformRoot, 'app', 'src', 'main', 'res', 'xml');
  const drawableDir = path.join(platformRoot, 'app', 'src', 'main', 'res', 'drawable');

  [javaDir, layoutDir, xmlDir, drawableDir].forEach(d => fs.mkdirSync(d, { recursive: true }));

  // Копируем файлы
  const copy = (from, to) => {
    fs.copyFileSync(path.join(srcDir, from), to);
    console.log('[install-widget] -> ' + to);
  };
  copy('PrayerWidget.java',   path.join(javaDir, 'PrayerWidget.java'));
  copy('widget_layout.xml',   path.join(layoutDir, 'widget_layout.xml'));
  copy('widget_info.xml',     path.join(xmlDir, 'widget_info.xml'));
  copy('widget_background.xml', path.join(drawableDir, 'widget_background.xml'));
  copy('widget_preview.png',  path.join(drawableDir, 'widget_preview.png'));

  // Патчим AndroidManifest.xml — добавляем receiver, если его ещё нет
  const manifestPath = path.join(platformRoot, 'app', 'src', 'main', 'AndroidManifest.xml');
  let manifest = fs.readFileSync(manifestPath, 'utf8');
  if (!manifest.includes('PrayerWidget')) {
    const receiverXml = `
        <receiver
            android:name=".PrayerWidget"
            android:exported="true">
            <intent-filter>
                <action android:name="android.appwidget.action.APPWIDGET_UPDATE" />
            </intent-filter>
            <meta-data
                android:name="android.appwidget.provider"
                android:resource="@xml/widget_info" />
        </receiver>
    </application>`;
    manifest = manifest.replace('</application>', receiverXml);
    fs.writeFileSync(manifestPath, manifest);
    console.log('[install-widget] AndroidManifest.xml пропатчен: добавлен PrayerWidget receiver');
  } else {
    console.log('[install-widget] PrayerWidget уже зарегистрирован в манифесте.');
  }
};
