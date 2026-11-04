# Build stage
FROM openjdk:21-jdk-slim AS builder

WORKDIR /app
COPY . .

# Build the application
RUN chmod +x gradlew && \
    ./gradlew :app:clean :app:bootJar --no-daemon && \
    mv /app/app/build/libs/*.jar /app/app.jar

# Runtime stage
FROM openjdk:21-jdk-slim
WORKDIR /app
COPY --from=builder /app/app.jar app.jar

# Non-root user setup
RUN useradd -m myuser && chown -R myuser:myuser /app
USER myuser

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]