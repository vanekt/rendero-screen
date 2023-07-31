clean:
	rm -rf ./dist

lint:
	yarn lint

build:
	yarn build

publish:
	yarn publish --access public

release: clean lint build publish