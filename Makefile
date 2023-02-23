all: build

package.json package-lock.json:
	npm install

build: packages/main/dist/main/src/main.js
packages/main/dist/main/src/main.js: package-lock.json
	npm run build

worker: packages/worker/dist/worker/src/worker.mjs
packages/worker/dist/worker/src/worker.mjs: package-lock.json
	npm run build:worker

.PHONY : clean
clean :
	-rm -rf packages/main/dist
	-rm -rf packages/worker/dist
