develop:
	"./node_modules/.bin/watchify" lib/index.js -o bin/bundle.js -t [ babelify --presets [ es2015 ] ]

compile:
	"./node_modules/.bin/browserify" lib/index.js -o bin/bundle.js -t [ babelify --presets [ es2015 ] ]

serve:
	ruby -rwebrick -e'WEBrick::HTTPServer.new(:Port => 8080, :DocumentRoot => Dir.pwd).start'
