develop:
	"./node_modules/.bin/watchify" lib/index.js -o bin/bundle.js -t [ babelify --presets [ es2015 ] ]
