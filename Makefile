BUILD_DATE=$(shell date +%Y%m%d)
BUILD_ID=$(shell find packages/main/src packages/worker/src -type f ! -name '*.swp' -exec sha256sum {} + | LC_ALL=C sort | sha256sum | cut -d ' ' -f1)
NPM_INSTALL=.tmp/build_$(BUILD_DATE)
BUILD=.tmp/build_$(BUILD_ID)
WORKER=.tmp/build_worker_$(BUILD_ID)

all: build

build: $(BUILD)
worker: $(WORKER)
npm_install: $(NPM_INSTALL)

$(NPM_INSTALL):
	npm install
	mkdir -p .tmp; touch $(NPM_INSTALL)

$(BUILD): $(NPM_INSTALL)
	npm run build
	mkdir -p .tmp; touch $(BUILD)

$(WORKER): $(NPM_INSTALL)
	npm run build:worker
	mkdir -p .tmp; touch $(WORKER)

release: $(NPM_INSTALL)
	npm run release

.PHONY : clean
clean :
	-rm -rf packages/main/dist
	-rm -rf packages/worker/dist
	-rm -rf .tmp/build_*
