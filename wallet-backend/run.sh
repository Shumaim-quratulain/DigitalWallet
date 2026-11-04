#!/bin/bash
#
# Starts the Spring Boot backend on http://localhost:8080
#
# Spring Boot 3.4.4 / Gradle 8.13 do NOT support running on JDK 24, which is
# the default `java` on this machine, so we always pin the build to Temurin 21.
#
set -e

cd "$(dirname "$0")"

if [ -z "$JAVA_HOME" ] || ! "$JAVA_HOME/bin/java" -version 2>&1 | grep -q '"21'; then
  export JAVA_HOME="$(/usr/libexec/java_home -v 21)"
fi

echo "Using JAVA_HOME=$JAVA_HOME"
exec ./gradlew :app:bootRun --console=plain
