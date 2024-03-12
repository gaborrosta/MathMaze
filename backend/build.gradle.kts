import org.jetbrains.kotlin.gradle.tasks.KotlinCompile
import org.springframework.boot.gradle.tasks.bundling.BootJar

plugins {
	id("org.springframework.boot") version "3.2.2"
	id("io.spring.dependency-management") version "1.1.4"
	kotlin("jvm") version "1.9.22"
	kotlin("plugin.spring") version "1.9.22"
}

group = "com.rostagabor"
version = "0.0.1-SNAPSHOT"

java {
	sourceCompatibility = JavaVersion.VERSION_17
}

repositories {
	mavenCentral()
	flatDir {
		dirs("libs")
	}
}

dependencies {
	//Spring Boot & Kotlin
	implementation("org.springframework.boot:spring-boot-starter-web:3.2.3")
	implementation("org.springframework.boot:spring-boot-starter-security:3.2.3")
	implementation("com.fasterxml.jackson.module:jackson-module-kotlin:2.16.1")
	implementation("org.jetbrains.kotlin:kotlin-reflect:1.9.22")

	//ML
	implementation("org.jetbrains.kotlinx:kotlin-deeplearning-tensorflow:0.5.2")
	implementation("org.jetbrains.kotlinx:kotlin-deeplearning-dataset:0.5.2")

	//OpenCV
	implementation(files("libs/opencv-490.jar"))

    //Database
	implementation("org.hsqldb:hsqldb:2.7.2")
	implementation("org.postgresql:postgresql:42.7.2")
	implementation("org.springframework.boot:spring-boot-starter-data-jpa:3.2.3")

	//Mail
	implementation("org.springframework.boot:spring-boot-starter-mail:3.2.3")

	//JWT
	implementation("io.jsonwebtoken:jjwt-api:0.12.5")
	implementation("io.jsonwebtoken:jjwt-impl:0.12.5")
	implementation("io.jsonwebtoken:jjwt-jackson:0.12.5")

	//Tests
	testImplementation("org.springframework.boot:spring-boot-starter-test:3.2.3")
}

tasks.withType<KotlinCompile> {
	kotlinOptions {
		freeCompilerArgs += "-Xjsr305=strict"
		jvmTarget = "17"
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
