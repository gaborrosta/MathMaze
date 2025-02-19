import org.jetbrains.kotlin.gradle.dsl.JvmTarget
import org.jetbrains.kotlin.gradle.tasks.KotlinCompile
import org.springframework.boot.gradle.tasks.bundling.BootJar

plugins {
	id("org.springframework.boot") version "3.4.2"
	id("io.spring.dependency-management") version "1.1.7"
	kotlin("jvm") version "2.1.10"
	kotlin("plugin.spring") version "2.1.10"
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
	implementation("org.springframework.boot:spring-boot-starter-web:3.4.2")
	implementation("org.springframework.boot:spring-boot-starter-security:3.4.2")
	implementation("com.fasterxml.jackson.module:jackson-module-kotlin:2.18.2")
	implementation("org.jetbrains.kotlin:kotlin-reflect:2.1.10")

	//ML
	implementation("org.jetbrains.kotlinx:kotlin-deeplearning-tensorflow:0.5.2")
	implementation("org.jetbrains.kotlinx:kotlin-deeplearning-dataset:0.5.2")

	//OpenCV
	implementation(files("libs/opencv-490.jar"))

    //Database
	implementation("org.hsqldb:hsqldb:2.7.4")
	implementation("org.postgresql:postgresql:42.7.5")
	implementation("org.springframework.boot:spring-boot-starter-data-jpa:3.4.2")

	//Mail
	implementation("org.springframework.boot:spring-boot-starter-mail:3.4.2")

	//JWT
	implementation("io.jsonwebtoken:jjwt-api:0.12.6")
	implementation("io.jsonwebtoken:jjwt-impl:0.12.6")
	implementation("io.jsonwebtoken:jjwt-jackson:0.12.6")

	//Tests
	testImplementation("org.springframework.boot:spring-boot-starter-test:3.4.2") { exclude(module = "mockito-core") }
	testImplementation("io.mockk:mockk:1.13.16")
	testImplementation("com.ninja-squad:springmockk:4.0.2")
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
