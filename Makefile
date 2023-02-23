BUILD_ID=$(shell find packages/main/src packages/worker/src -type f ! -name '*.swp' -exec sha256sum {} + | LC_ALL=C sort | sha256sum | cut -d ' ' -f1)

all: build

.build_$(BUILD_ID):
	npm install
	mkdir -p .tmp; touch .tmp/build_$(BUILD_ID)

build: packages/main/dist/main/src/main.js
packages/main/dist/main/src/main.js: .build_$(BUILD_ID)
	npm run build

worker: packages/worker/src/worker/src/worker.mjs
packages/worker/dist/worker/src/worker.mjs: .build_$(BUILD_ID)
	npm run build:worker

release: .build_$(BUILD_ID)
	npm run release

.PHONY : clean
clean :
	-rm -rf packages/main/dist
	-rm -rf packages/worker/dist
	-rm -rf .build_*
