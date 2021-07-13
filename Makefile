.DEFAULT_GOAL := run

.PHONY: build
build:
	docker-compose build streetmerchant

.PHONY: run
run:
	docker-compose up

.PHONY: run-detached
run-detached:
	docker-compose up -d

.PHONY: stop
stop:
	docker-compose down

.PHONY: eslint
eslint:
	eslint .

.PHONY: tests
test:
	npm run test

.PHONY: eslint-fix
eslint-fix:
	eslint . --fix
