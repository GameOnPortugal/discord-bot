.DEFAULT_GOAL := run

.PHONY: build
build:
	docker-compose build discordbot

.PHONY: run
run:
	docker-compose up

.PHONY: run-detached
run-detached:
	docker-compose up -d

.PHONY: stop
stop:
	docker-compose stop

.PHONY: eslint
eslint:
	eslint .

.PHONY: tests
test:
	npm run test

.PHONY: eslint-fix
eslint-fix:
	eslint . --fix
