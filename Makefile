# One command builds everything: the front first (into the Go embed folder),
# then the Go binary with the front inside. make stops at the first failure,
# so a broken front never ends in a binary.
BINARY := backend/bin/mail-checker

.PHONY: build front back

build: front back

front:
	cd frontend && pnpm install --frozen-lockfile && pnpm build

back:
	cd backend && go build -o bin/mail-checker ./cmd/api
