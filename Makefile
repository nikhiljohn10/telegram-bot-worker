all: build

package.json package-lock.json:
	npm install

packages/main/dist/main/src/main.js: package-lock.json
	npm run build
build: packages/main/dist/main/src/main.js

packages/worker/dist/worker/src/worker.mjs: package-lock.json
	npm run build:worker

.PHONY : clean
clean :
	-rm -rf packages/main/dist
	-rm -rf packages/worker/dist
