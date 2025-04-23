package com.nhnacademy.frontservice.log;

import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.io.RandomAccessFile;
import java.nio.charset.StandardCharsets;
import java.nio.file.Path;
import java.nio.file.Paths;

/**
 * 로그 파일을 실시간으로 감시하고 새로운 로그가 생기면 WebSocket을 통해 클라이언트로 전송하는 클래스입니다.
 */
@Slf4j
@Component
public class LogTailWatcher {

    /**
     * 애플리케이션 시작 시 로그 감시 스레드를 시작합니다.
     * <p>실시간으로 로그 파일 변경을 감지하여 WebSocket으로 전송합니다.</p>
     */
    @PostConstruct
    public void startTail() {
        startWatchingFile("logs/frontservice-entry-info.log");
        startWatchingFile("logs/frontservice-attendance-info.log"); // 근무시간 로그도 감시 추가
    }

    /**
     * 주어진 파일 경로에 대해 로그 변경을 감시하는 스레드를 시작합니다.
     *
     * @param filePath 감시할 로그 파일 경로
     */
    private void startWatchingFile(String filePath) {
        Thread thread = new Thread(() -> {
            try {
                Path logPath = Paths.get(filePath);
                log.info("[LogTailWatcher] 로그 파일 감시 시작: {}", logPath.toAbsolutePath());
                RandomAccessFile file = new RandomAccessFile(logPath.toFile(), "r");
                long filePointer = file.length();

                while (true) {
                    long len = file.length();
                    if (len < filePointer) {
                        filePointer = len;
                    } else if (len > filePointer) {
                        file.seek(filePointer);
                        String line;
                        while ((line = file.readLine()) != null) {
                            String logLine = new String(line.getBytes(StandardCharsets.ISO_8859_1), StandardCharsets.UTF_8);
                            LogWebSocketHandler handler = WebSocketContextHolder.getHandler();
                            if (handler == null) {
                                log.error("[LogTailWatcher] WebSocket 핸들러가 null입니다. broadcast 수행 불가.");
                            } else {
                                handler.broadcast(logLine);
                                log.debug("[LogTailWatcher] 로그 전송 ({}): {}", filePath, logLine);
                            }
                        }
                        filePointer = file.getFilePointer();
                    }
                    Thread.sleep(1000);
                }
            } catch (InterruptedException | IOException e) {
                log.error("[LogTailWatcher] 로그 감시 중 예외 발생 ({}):", filePath, e);
            }
        });
        thread.setDaemon(true);
        thread.start();
        log.info("[LogTailWatcher] 감시 스레드 시작됨 - {}", filePath);
    }
}

