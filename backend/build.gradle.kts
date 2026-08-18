import org.jetbrains.kotlin.gradle.dsl.JvmTarget
import org.jetbrains.kotlin.gradle.tasks.KotlinCompile
import org.springframework.boot.gradle.tasks.bundling.BootJar

plugins {
	id("org.springframework.boot") version "4.0.6"
	id("io.spring.dependency-management") version "1.1.7"
	kotlin("jvm") version "2.3.21"
	kotlin("plugin.spring") version "2.3.21"
}

group = "com.rostagabor"
version = "1.0"

java {
	sourceCompatibility = JavaVersion.VERSION_17
	targetCompatibility = JavaVersion.VERSION_17
}

repositories {
	mavenCentral()
	flatDir {
		dirs("libs")
	}
}

dependencies {
	//Spring Boot & Kotlin
	implementation("org.springframework.boot:spring-boot-starter-web:4.0.6")
	implementation("org.springframework.boot:spring-boot-starter-security:4.0.6")
	implementation("com.fasterxml.jackson.module:jackson-module-kotlin:2.21.3")
	implementation("org.jetbrains.kotlin:kotlin-reflect:2.3.21")

	//ML
	implementation("org.jetbrains.kotlinx:kotlin-deeplearning-tensorflow:0.5.2")
	implementation("org.jetbrains.kotlinx:kotlin-deeplearning-dataset:0.5.2")

	//OpenCV
	implementation("org.bytedeco:javacv-platform:1.5.11")

    //Database
	implementation("org.hsqldb:hsqldb:2.7.4")
	implementation("org.postgresql:postgresql:42.7.11")
	implementation("org.springframework.boot:spring-boot-starter-data-jpa:4.0.6")

	//Mail
	implementation("org.springframework.boot:spring-boot-starter-mail:4.0.6")

	//JWT
	implementation("io.jsonwebtoken:jjwt-api:0.13.0")
	implementation("io.jsonwebtoken:jjwt-impl:0.13.0")
	implementation("io.jsonwebtoken:jjwt-jackson:0.13.0")

	//Tests
	testImplementation("org.springframework.boot:spring-boot-starter-test:4.0.6") { exclude(module = "mockito-core") }
	testImplementation("org.springframework.boot:spring-boot-starter-webmvc-test:4.0.6")
	testImplementation("org.springframework.boot:spring-boot-starter-data-jpa-test:4.0.6")
	testImplementation("io.mockk:mockk:1.14.9")
	testImplementation("com.ninja-squad:springmockk:5.0.1")
}

tasks.withType<KotlinCompile> {
	compilerOptions {
		freeCompilerArgs.add("-Xjsr305=strict")
		jvmTarget.set(JvmTarget.JVM_17)
	}
}

tasks.withType<Test> {
	useJUnitPlatform()
}

tasks.getByName<Jar>("jar") {
	enabled = false
	manifest {
		attributes["Main-Class"] = "com.rostagabor.mathmaze.MainKt"
	}
}

tasks.getByName<BootJar>("bootJar") {
	mainClass.set("com.rostagabor.mathmaze.MainKt")
}
