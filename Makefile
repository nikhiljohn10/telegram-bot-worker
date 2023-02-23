all: package.json build

npm_install:
	npm install

build: npm_install
	npm run build
