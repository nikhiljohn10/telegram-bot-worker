BUILD_ID=$(shell find packages/main/src packages/worker/src -type f -exec sha256sum {} + | LC_ALL=C sort | sha256sum | cut -d ' ' -f1)

all: .make_$(BUILD_ID) build

.make_$(BUILD_ID):
	npm install
	touch .make_$(BUILD_ID)

build: .make_$(BUILD_ID) packages/main/dist/main/src/main.js
packages/main/dist/main/src/main.js: .make_$(BUILD_ID)
	npm run build

worker: .make_$(BUILD_ID) packages/worker/src/worker/src/worker.mjs
packages/worker/dist/worker/src/worker.mjs: .make_$(BUILD_ID)
	npm run build:worker

release: .make_$(BUILD_ID)
	npm run release

.PHONY : clean
clean :
	-rm -rf packages/main/dist
	-rm -rf packages/worker/dist
	-rm -rf .make_*
