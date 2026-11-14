# syntax=docker/dockerfile:1

# 1. The front, built into the folder the Go binary embeds.
FROM node:26-alpine AS front
RUN npm install --global pnpm@12.15.0
WORKDIR /src/frontend
COPY frontend/package.json frontend/pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY frontend/ ./
RUN pnpm build

# 2. The back, without cgo (SQLite is pure Go), with the front inside.
FROM golang:1.27-alpine AS back
WORKDIR /src/backend
COPY backend/go.mod backend/go.sum ./
RUN go mod download
COPY backend/ ./
COPY --from=front /src/backend/internal/shared/httpserver/web/dist ./internal/shared/httpserver/web/dist
RUN CGO_ENABLED=0 go build -trimpath -ldflags="-s -w" -o /out/mail-checker ./cmd/api \
 && mkdir -p /out/data

# 3. Only the binary: no shell, no sources, not root. SQLite lives in the /data volume.
FROM gcr.io/distroless/static-debian12:nonroot
COPY --from=back /out/mail-checker /app/mail-checker
COPY --from=back --chown=nonroot:nonroot /out/data /data
ENV MAILCHECKER_HOST=0.0.0.0 \
    MAILCHECKER_PORT=8080 \
    MAILCHECKER_DB_PATH=/data/mail-checker.db
EXPOSE 8080
VOLUME ["/data"]
USER nonroot
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 CMD ["/app/mail-checker", "health"]
ENTRYPOINT ["/app/mail-checker"]
