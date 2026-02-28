FROM azul/zulu-openjdk:17-latest
COPY libs/ /libs/
ENV LD_LIBRARY_PATH=/libs:$LD_LIBRARY_PATH
VOLUME /tmp
COPY build/libs/*.jar app.jar
ENTRYPOINT ["java","-jar","/app.jar"]
