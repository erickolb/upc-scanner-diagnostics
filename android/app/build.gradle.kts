plugins { id("com.android.application") }
android {
    namespace = "me.erickolb.upcdiagnostics"
    compileSdk = 36
    defaultConfig {
        applicationId = "me.erickolb.upcdiagnostics"
        minSdk = 28
        targetSdk = 36
        versionCode = 1
        versionName = "0.1.0"
    }
    compileOptions { sourceCompatibility = JavaVersion.VERSION_17; targetCompatibility = JavaVersion.VERSION_17 }
    sourceSets.getByName("main").assets.srcDir(layout.buildDirectory.dir("diagnosticAssets").get().asFile)
}
val bundleDiagnostics by tasks.registering(Sync::class) {
    from(rootProject.projectDir.parentFile) { include("index.html", "app.mjs", "parser.mjs") }
    into(layout.buildDirectory.dir("diagnosticAssets"))
}
tasks.named("preBuild").configure { dependsOn(bundleDiagnostics) }
