test:
	mocha test/

babel:
	babel lib/ -d src/

lint:
	eslint .

env:
	@echo $(PATH)

build: babel test lint

watch:
	watchd lib/**/* test/**/* bin/* -c 'bake build'

all: build watch
