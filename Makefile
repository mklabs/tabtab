test: babel
  mocha test/ -R spec

babel:
  babel lib/ -d src/

lint:
  eslint . --env es6

docs:
  tomdox lib/complete.js lib/debug.js lib/index.js lib/commands/*.js --primary orange --accent deep_orange --icon keyboard_tab --prefix https://mklabs.github.io/node-tabtab/

ghpages:
  bake docs && git co gh-pages && git rm -r . && cp -r docs/* . && git add . && git ci

env:
  @echo $(PATH)

build: test

tt:
  COMP_LINE="list --foo" COMP_CWORD=2 COMP_POINT=4 tabtab completion

watch:
  watchd lib/*.js lib/**/* test/**/* bin/* -c 'bake build'

all: build watch
