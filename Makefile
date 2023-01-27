.PHONY: build help

help:
	@grep -E '^[a-zA-Z0-9_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'

install: package.json ## install dependencies
	@if [ "$(CI)" != "true" ]; then \
		echo "Full install..."; \
		yarn; \
	fi
	@if [ "$(CI)" = "true" ]; then \
		echo "Frozen install..."; \
		yarn --frozen-lockfile; \
	fi

run: ## run the demo
	@yarn -s run-demo

build-demo: ## compile the demo to static js
	@yarn -s build-demo

build-ra-supabase-core:
	@echo "Transpiling ra-supabase-core files...";
	@cd ./packages/ra-supabase-core && yarn -s build

build-ra-supabase-language-english:
	@echo "Transpiling ra-supabase-language-english files...";
	@cd ./packages/ra-supabase-language-english && yarn -s build

build-ra-supabase-language-french:
	@echo "Transpiling ra-supabase-language-french files...";
	@cd ./packages/ra-supabase-language-french && yarn -s build

build-ra-supabase-ui-materialui:
	@echo "Transpiling ra-supabase-ui-materialui files...";
	@cd ./packages/ra-supabase-ui-materialui && yarn -s build

build-ra-supabase:
	@echo "Transpiling ra-supabase files...";
	@cd ./packages/ra-supabase && yarn -s build

build: build-ra-supabase-core build-ra-supabase-ui-materialui build-ra-supabase-language-english build-ra-supabase-language-french build-ra-supabase ## compile ES6 files to JS

lint: ## lint the code and check coding conventions
	@echo "Running linter..."
	@yarn -s lint

prettier: ## prettify the source code using prettier
	@echo "Running prettier..."
	@yarn -s prettier

test: build test-unit lint ## launch all tests

test-unit: ## launch unit tests
	@echo "Running unit tests...";
	@yarn -s test-unit;

test-unit-watch: ## launch unit tests and watch for changes
	@echo "Running unit tests..."; 
	@yarn -s test-unit --watch;

supabase-start: ## start the supabase server
	@echo "Starting supabase server..."
	@yarn supabase start

supabase-stop: ## stop the supabase server
	@echo "Stopping supabase server..."
	@yarn supabase stop

db-migrate: ## migrate the database
	@echo "Apply migrations on the database..."
	@yarn -s db-migrate

db-seed: ## seed the database
	@echo "Seeding the database..."
	@yarn -s db-seed

db-setup: db-migrate db-seed ## setup the database
