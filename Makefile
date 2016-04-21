test: babel
	mocha test/ -R min

babel:
	babel lib/ -d src/

lint:
	eslint . --env es6

env:
	@echo $(PATH)

build: test lint

tt:
	COMP_LINE="list --foo" COMP_CWORD=2 COMP_POINT=4 tabtab completion

watch:
	watchd lib/**/* test/**/* bin/* -c 'bake build'

all: build watch
